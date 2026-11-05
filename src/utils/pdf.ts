// Gerador mínimo de PDF em texto, para o "Baixar relatório" entregar um arquivo de verdade.
const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

function latin1(s: string) {
  const b = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); b[i] = c < 256 ? c : 63; }
  return b;
}

export function gerarPdf(titulo: string, detalhe: string, colunas: string[], linhas: string[][]): Blob {
  const larg = 515; const porPagina = 34;
  const paginas: string[][][] = [];
  for (let i = 0; i < Math.max(1, linhas.length); i += porPagina) paginas.push(linhas.slice(i, i + porPagina));
  const peso = colunas.map((c, i) => Math.max(c.length, ...linhas.map(l => (l[i] ?? '').length), 3));
  const soma = peso.reduce((a, b) => a + b, 0);
  const x: number[] = []; let ac = 40; for (const p of peso) { x.push(ac); ac += (p / soma) * larg; }
  const corta = (s: string, i: number) => { const max = Math.floor(((peso[i] / soma) * larg) / 4.4); return s.length > max ? s.slice(0, Math.max(1, max - 1)) + '.' : s; };
  const obj: string[] = [];
  const conteudos = paginas.map((pg, n) => {
    let c = `BT /F2 16 Tf 40 790 Td (${esc(titulo)}) Tj ET\nBT /F1 10 Tf 40 772 Td (${esc(detalhe)}) Tj ET\n`;
    let y = 748;
    colunas.forEach((col, i) => { c += `BT /F2 9 Tf ${x[i].toFixed(1)} ${y} Td (${esc(corta(col, i))}) Tj ET\n`; });
    c += `40 ${y - 5} m 555 ${y - 5} l S\n`; y -= 19;
    for (const l of pg) {
      l.forEach((v, i) => { c += `BT /F1 9 Tf ${x[i].toFixed(1)} ${y} Td (${esc(corta(v ?? '', i))}) Tj ET\n`; });
      y -= 20;
    }
    c += `BT /F1 8 Tf 40 30 Td (Pagina ${n + 1} de ${paginas.length}) Tj ET\n`;
    return c;
  });
  const n = paginas.length;
  obj[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  obj[2] = `<< /Type /Pages /Count ${n} /Kids [${paginas.map((_, i) => `${5 + i * 2} 0 R`).join(' ')}] >>`;
  obj[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
  obj[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';
  conteudos.forEach((c, i) => {
    obj[5 + i * 2] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${6 + i * 2} 0 R >>`;
    obj[6 + i * 2] = `<< /Length ${c.length} >>\nstream\n${c}endstream`;
  });
  let pdf = '%PDF-1.4\n'; const offs: number[] = [];
  for (let i = 1; i < obj.length; i++) { offs[i] = pdf.length; pdf += `${i} 0 obj\n${obj[i]}\nendobj\n`; }
  const xref = pdf.length;
  pdf += `xref\n0 ${obj.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < obj.length; i++) pdf += `${String(offs[i]).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${obj.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([latin1(pdf)], { type: 'application/pdf' });
}

export function baixar(blob: Blob, nome: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = nome; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function gerarCsv(colunas: string[], linhas: string[][]): Blob {
  const q = (s: string) => `"${(s ?? '').replace(/"/g, '""')}"`;
  return new Blob(['﻿' + [colunas, ...linhas].map(l => l.map(q).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
}
