import { formatar, hoje, ordemData } from '../utils/datas';
import type { Aluno, Chamadas, HorarioDia, Marca, Modalidade, Turma } from './tipos';

const SEG_QUA = (i: string, f: string): HorarioDia[] => [{ dia: 'Segunda', inicio: i, fim: f }, { dia: 'Quarta', inicio: i, fim: f }];
const TER_QUI = (i: string, f: string): HorarioDia[] => [{ dia: 'Terça', inicio: i, fim: f }, { dia: 'Quinta', inicio: i, fim: f }];
const TODOS = (i: string, f: string): HorarioDia[] => ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'].map(dia => ({ dia, inicio: i, fim: f }));
export const INDICE_DIA: Record<string, number> = { Domingo: 0, Segunda: 1, 'Terça': 2, Quarta: 3, Quinta: 4, Sexta: 5, 'Sábado': 6 };

function t(id: string, nome: string, curto: string, modalidade: Modalidade, professor: string, vagas: number, horarios: HorarioDia[], ativa = true, sala = 'Sala 1', observacoes = ''): Turma {
  return { id, nome, curto, modalidade, professor, sala, observacoes, horarios, inicio: '05/10/2026', encerramento: '18/12/2026', vagas, ativa, chamadas: {},
    ...(ativa ? {} : { desativacao: { data: '01/08/2026', motivo: 'Sem professor' } }) };
}

const base = (): Turma[] => [
  t('manha-a', 'Contraturno – Manhã A', 'Manhã A', 'contraturno', 'Prof. Diego Santana', 20, TODOS('08:00', '11:00')),
  t('manha-b', 'Contraturno – Manhã B', 'Manhã B', 'contraturno', 'Prof.ª Renata Lopes', 20, TODOS('08:00', '11:00'), true, 'Sala 3'),
  t('tarde-a', 'Contraturno – Tarde A', 'Tarde A', 'contraturno', 'Prof. Felipe Barros', 20, TODOS('13:30', '16:30'), true, 'Sala 4'),
  t('tarde-b', 'Contraturno – Tarde B', 'Tarde B', 'contraturno', 'Prof.ª Sônia Castro', 20, TODOS('13:30', '16:30'), true, 'Sala 5'),
  t('artes', 'Oficina de Artes Visuais', 'Artes Visuais', 'oficinas', 'Prof.ª Helena Prado', 12, TER_QUI('14:00', '15:30'), true, 'Ateliê'),
  t('circo', 'Oficina de Atividades Circenses', 'Circo', 'oficinas', 'Prof.ª Camila Duarte', 12, TER_QUI('15:30', '17:00'), true, 'Quadra'),
  t('capoeira', 'Oficina de Capoeira', 'Capoeira', 'oficinas', 'Prof. Thiago Rocha', 15, SEG_QUA('16:00', '17:00'), false, 'Quadra'),
  t('karate', 'Oficina de Karatê', 'Karatê', 'oficinas', 'Rafael Mendes', 15, SEG_QUA('14:00', '15:30'), true, 'Sala 2', 'Levar kimono e garrafinha de água.'),
  t('musica', 'Oficina de Música', 'Música', 'oficinas', 'Prof. Lucas Andrade', 15, TER_QUI('14:00', '15:00'), true, 'Sala de música'),
  t('teatro', 'Oficina de Teatro', 'Teatro', 'oficinas', 'Prof.ª Beatriz Nogueira', 15, SEG_QUA('15:30', '17:00'), true, 'Auditório'),
  t('1a', 'Turma 1A', 'Turma 1A', 'infantil', 'Prof.ª Marta Oliveira', 2, TODOS('07:30', '17:00')),
  t('1b', 'Turma 1B', 'Turma 1B', 'infantil', 'Prof. Paulo Ribeiro', 5, TODOS('07:30', '17:00'), true, 'Sala 6'),
  t('2a', 'Turma 2A', 'Turma 2A', 'infantil', 'Prof.ª Lúcia Ferraz', 6, TODOS('07:30', '17:00'), true, 'Sala 7'),
  t('2b', 'Turma 2B', 'Turma 2B', 'infantil', 'Prof. Marcos Teixeira', 15, TODOS('07:30', '17:00'), false, 'Sala 8'),
];

/** Últimas aulas até hoje (hoje entra só se for dia de aula). */
export function datasDeAula(turma: Turma, quantas = 7): string[] {
  const dias = new Set(turma.horarios.map(h => INDICE_DIA[h.dia]));
  const fim = new Date(); fim.setHours(0, 0, 0, 0);
  const out: string[] = [];
  const d = new Date(fim);
  for (let i = 0; i < 90 && out.length < quantas; i++) {
    if (dias.has(d.getDay())) out.push(formatar(d));
    d.setDate(d.getDate() - 1);
  }
  return out;
}

function pseudo(s: string) { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 9973; return h / 9973; }

// Padrão da tabela de frequência da Oficina de Karatê no Figma. Da aula mais antiga para a mais recente.
const PADRAO_KARATE: Record<string, string> = {
  'ana-beatriz-souza': 'PPPPPP', 'bruno-henrique-lima': 'PPFPPP', 'camila-ferreira': 'PPPJPP', 'davi-oliveira': 'PFPPFP',
  'eduarda-martins': 'PPPPPP', 'felipe-costa': 'PPPPPP', 'gabriela-rocha': 'FPFPFP', 'heitor-almeida': 'PPPFPP',
  'isabela-nunes': 'PPPPPP', 'joao-pedro-santos': 'PPJPPP', 'laura-lima': 'PPPPPP', 'caio-costa': 'PFPPPP',
};
const HOJE_KARATE: Record<string, { m: Marca; motivo?: string }> = {
  'ana-beatriz-souza': { m: 'P' }, 'bruno-henrique-lima': { m: 'P' },
  'camila-ferreira': { m: 'J', motivo: 'Consulta médica (a mãe avisou a professora)' },
  'davi-oliveira': { m: 'F' }, 'eduarda-martins': { m: 'P' },
};

export function turmasIniciais(alunos: Aluno[]): Turma[] {
  const lista = base();
  const hj = hoje();
  for (const turma of lista) {
    if (!turma.ativa) continue;
    const membros = alunos.filter(a => a.turmaIds.includes(turma.id));
    const datas = datasDeAula(turma, 7);
    const passadas = datas.filter(d => d !== hj).sort((a, b) => ordemData(a) - ordemData(b));
    const chamadas: Chamadas = {};
    passadas.forEach((data, i) => {
      chamadas[data] = {};
      for (const a of membros) {
        const padrao = turma.id === 'karate' ? PADRAO_KARATE[a.id] : undefined;
        const n = pseudo(a.id + data);
        const m: Marca = padrao ? (padrao[Math.max(0, padrao.length - passadas.length + i)] as Marca) ?? 'P' : n < 0.84 ? 'P' : n < 0.94 ? 'F' : 'J';
        chamadas[data][a.id] = { m };
      }
    });
    if (turma.id === 'karate' && datas.includes(hj)) chamadas[hj] = { ...HOJE_KARATE };
    turma.chamadas = chamadas;
  }
  return lista;
}

export function frequenciaAluno(turma: Turma, alunoId: string): number | null {
  let p = 0, f = 0;
  for (const dia of Object.values(turma.chamadas)) {
    const r = dia[alunoId];
    if (r?.m === 'P') p++;
    if (r?.m === 'F') f++;
  }
  return p + f === 0 ? null : Math.round((p / (p + f)) * 100);
}
