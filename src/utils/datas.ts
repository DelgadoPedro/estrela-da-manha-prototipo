export const pad = (n: number) => String(n).padStart(2, '0');
export const formatar = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
export const hoje = () => formatar(new Date());
export const horaAgora = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };

export function lerData(s?: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s ?? '');
  if (!m) return null;
  const d = new Date(+m[3], +m[2] - 1, +m[1]);
  return d.getMonth() === +m[2] - 1 && d.getDate() === +m[1] ? d : null;
}
export function dataValida(s?: string) { return lerData(s) !== null; }

export function idade(nascimento?: string): number | null {
  const n = lerData(nascimento);
  if (!n) return null;
  const h = new Date();
  let i = h.getFullYear() - n.getFullYear();
  if (h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) i--;
  return i >= 0 ? i : null;
}
export function idadeTexto(nascimento?: string) {
  const i = idade(nascimento);
  return i === null ? '' : `${i} ${i === 1 ? 'ano' : 'anos'}`;
}
export function mascaraData(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}
export function mascaraHora(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length <= 2 ? d : `${d.slice(0, 2)}:${d.slice(2)}`;
}
export function mascaraTelefone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : '';
  const corte = d.length > 10 ? 7 : 6;
  if (d.length <= corte) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, corte)}-${d.slice(corte)}`;
}
const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
export const nomeDia = (s: string) => { const d = lerData(s); return d ? DIAS[d.getDay()] : ''; };
export const nomeDiaMin = (s: string) => nomeDia(s).toLowerCase();
export const siglaDia = (s: string) => nomeDia(s).slice(0, 3);
export const ordemData = (s: string) => lerData(s)?.getTime() ?? 0;
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
export const mesNome = (i: number) => MESES[i];
export function dataPorExtenso(s: string) {
  const d = lerData(s);
  return d ? `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}` : '';
}
