import type { Aluno, AtalhoRel, RelatorioGerado, Turma } from './tipos';
import { CURTO_MODALIDADE, NOME_MODALIDADE } from './tipos';
import { frequenciaAluno } from './turmas';
import { idade, hoje, ordemData } from '../utils/datas';
import type { NomeIcone } from '../components/icones';

export interface TipoRelatorio { tipo: string; nome: string; sub: string; icone: NomeIcone }
export const CATALOGO: TipoRelatorio[] = [
  { tipo: 'frequencia', nome: 'Frequência de Turma', sub: 'Escolher turma e mês', icone: 'chamada' },
  { tipo: 'ativos', nome: 'Alunos Ativos', sub: 'Escolher a data', icone: 'alunos' },
  { tipo: 'turmas', nome: 'Turmas', sub: 'Escolher semestre e ano', icone: 'turmas' },
  { tipo: 'natal', nome: 'Operação Natal', sub: 'Escolher o ano', icone: 'presente' },
  { tipo: 'prefeitura', nome: 'Prefeitura', sub: 'Escolher o período', icone: 'prefeitura' },
  { tipo: 'declaracoes', nome: 'Declarações de matrícula', sub: 'Escolher um aluno', icone: 'documento' },
  { tipo: 'autorizacoes', nome: 'Autorizações de retirada', sub: 'Escolher um aluno', icone: 'autorizados' },
  { tipo: 'inativos', nome: 'Alunos inativos', sub: 'Escolher a data', icone: 'arquivar' },
  { tipo: 'oficinas', nome: 'Lista de oficinas', sub: 'Escolher semestre e ano', icone: 'turmas' },
];
export const tipoDe = (tipo: string) => CATALOGO.find(c => c.tipo === tipo) ?? CATALOGO[0];

export const atalhosIniciais = (): AtalhoRel[] => CATALOGO.slice(0, 5).map(c => ({ id: c.tipo, nome: c.nome, tipo: c.tipo }));

export function arquivoSeguro(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
const nomesTurmas = (a: Aluno, turmas: Turma[]) => a.turmaIds.map(id => turmas.find(t => t.id === id)?.curto).filter(Boolean).join(', ');
const porNome = (x: Aluno, y: Aluno) => x.nome.localeCompare(y.nome, 'pt-BR');

export interface ParamsRelatorio {
  tipo: string; turmaId?: string; periodo?: string; modalidade?: string; incluir?: string[]; formato?: 'PDF' | 'Excel'; de?: string; aluno?: string;
}

/** Monta o relatório sempre a partir do que está no store. */
export function gerarRelatorio(p: ParamsRelatorio, alunos: Aluno[], turmas: Turma[]): RelatorioGerado {
  const formato = p.formato ?? 'PDF';
  const ext = formato === 'PDF' ? 'pdf' : 'csv';
  const de = p.de ?? '/relatorios';
  const periodo = p.periodo ?? '';
  const pronto = (titulo: string, detalhe: string, base: string, colunas: string[], linhas: string[][], aviso?: string): RelatorioGerado => ({
    tipo: p.tipo, titulo, detalhe, arquivo: `${base}.${ext}`, formato, colunas, linhas, de, aviso,
  });
  switch (p.tipo) {
    case 'frequencia': {
      const turma = turmas.find(t => t.id === p.turmaId) ?? turmas[0];
      const inc = p.incluir ?? ['Nome e idade', 'Presença por dia', 'Espaço para assinatura'];
      const datas = Object.keys(turma.chamadas).sort((a, b) => ordemData(a) - ordemData(b)).slice(-7);
      const dia = inc.includes('Presença por dia');
      const colunas = ['Aluno', ...(inc.includes('Nome e idade') ? ['Idade'] : []), ...(dia ? datas.map(d => d.slice(0, 5)) : []), 'Freq.', ...(inc.includes('Telefone do responsável') ? ['Telefone'] : []), ...(inc.includes('Espaço para assinatura') ? ['Assinatura'] : [])];
      const linhas = alunos.filter(a => a.turmaIds.includes(turma.id)).sort(porNome).map(a => {
        const fr = frequenciaAluno(turma, a.id);
        return [a.nome, ...(inc.includes('Nome e idade') ? [String(idade(a.nascimento) ?? '')] : []),
          ...(dia ? datas.map(d => { const m = turma.chamadas[d]?.[a.id]?.m; return m === 'P' ? 'P' : m === 'F' ? 'F' : m === 'J' ? 'J' : '-'; }) : []),
          fr === null ? '-' : `${fr}%`, ...(inc.includes('Telefone do responsável') ? [a.responsaveis[0]?.telefone ?? ''] : []), ...(inc.includes('Espaço para assinatura') ? [''] : [])];
      });
      return pronto('Frequência de turma', `Frequência de turma · ${turma.nome} · ${periodo}`, `Frequencia_${arquivoSeguro(turma.nome)}_${arquivoSeguro(periodo)}`, colunas, linhas,
        'Depois de assinada, guarde a folha impressa na pasta da turma.');
    }
    case 'ativos': {
      const lista = alunos.filter(a => a.status === 'Ativo' && (!p.modalidade || p.modalidade === 'Todos' || NOME_MODALIDADE[a.modalidade] === p.modalidade)).sort(porNome);
      return pronto('Alunos ativos', `Alunos ativos · ${p.modalidade ?? 'Todos'} · ${periodo || hoje()} · ${lista.length} alunos`, `Alunos-Ativos_${arquivoSeguro(periodo || hoje())}`,
        ['Aluno', 'Idade', 'Modalidade', 'Turmas', 'Responsável', 'Telefone'],
        lista.map(a => [a.nome, String(idade(a.nascimento) ?? ''), CURTO_MODALIDADE[a.modalidade], nomesTurmas(a, turmas), a.responsaveis[0]?.nome ?? '', a.responsaveis[0]?.telefone ?? '']));
    }
    case 'inativos': {
      const lista = alunos.filter(a => a.status === 'Inativo').sort(porNome);
      return pronto('Alunos inativos', `Alunos inativos · ${lista.length} alunos`, 'Alunos-Inativos', ['Aluno', 'Modalidade', 'Saída', 'Motivo'],
        lista.map(a => [a.nome, CURTO_MODALIDADE[a.modalidade], a.desativacao?.data ?? '', a.desativacao?.motivo ?? '']));
    }
    case 'turmas':
    case 'oficinas': {
      const lista = turmas.filter(t => p.tipo === 'turmas' || t.modalidade === 'oficinas');
      return pronto(p.tipo === 'turmas' ? 'Lista de turmas' : 'Lista de oficinas', `${p.tipo === 'turmas' ? 'Turmas' : 'Oficinas'} · ${periodo} · ${lista.length} turmas`, `${p.tipo === 'turmas' ? 'Turmas' : 'Oficinas'}_${arquivoSeguro(periodo)}`,
        ['Turma', 'Professor', 'Modalidade', 'Alunos', 'Vagas', 'Situação'],
        lista.map(t => [t.nome, t.professor, CURTO_MODALIDADE[t.modalidade], String(alunos.filter(a => a.turmaIds.includes(t.id)).length), String(t.vagas), t.ativa ? 'Ativa' : 'Inativa']));
    }
    case 'natal': {
      const lista = alunos.filter(a => a.status === 'Ativo').sort(porNome);
      return pronto('Operação Natal', `${periodo} · ${lista.length} crianças`, `Operacao-Natal_${arquivoSeguro(periodo)}`, ['Criança', 'Idade', 'Roupa / sapato', 'Quem retira', 'Telefone'],
        lista.map(a => [a.nome, String(idade(a.nascimento) ?? ''), a.roupa, a.responsaveis[0]?.nome ?? '', a.responsaveis[0]?.telefone ?? '']));
    }
    case 'prefeitura': {
      const ativos = alunos.filter(a => a.status === 'Ativo');
      const linhas = (['infantil', 'contraturno', 'oficinas'] as const).map(m => {
        const ts = turmas.filter(t => t.modalidade === m && t.ativa);
        return [NOME_MODALIDADE[m], String(ts.length), String(ativos.filter(a => a.modalidade === m).length)];
      });
      linhas.push(['Total', String(turmas.filter(t => t.ativa).length), String(ativos.length)]);
      return pronto('Prestação de contas', `Prestação de contas · ${periodo}`, `Prestacao-de-Contas_${arquivoSeguro(periodo)}`, ['Modalidade', 'Turmas ativas', 'Alunos ativos'], linhas);
    }
    case 'autorizacoes': {
      const lista = alunos.filter(a => a.status !== 'Inativo').sort(porNome);
      return pronto('Autorizações de retirada', `Autorizações de retirada · ${lista.length} alunos`, 'Autorizacoes-de-Retirada', ['Criança', 'Pode buscar', 'Documento'],
        lista.flatMap(a => a.autorizados.map(x => [a.nome, `${x.nome} (${x.parentesco})`, x.documento])));
    }
    default: {
      const lista = alunos.filter(a => a.status === 'Ativo' && (!p.aluno || a.id === p.aluno)).sort(porNome);
      return pronto('Declaração de matrícula', `Declaração de matrícula · ${lista.length} alunos`, 'Declaracoes-de-Matricula', ['Aluno', 'Modalidade', 'Turmas', 'Data'],
        lista.map(a => [a.nome, CURTO_MODALIDADE[a.modalidade], nomesTurmas(a, turmas), hoje()]));
    }
  }
}

export function paginasRelatorio(r: RelatorioGerado) { return Math.max(1, Math.ceil(r.linhas.length / 34)); }
