import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import type { Aluno, AtalhoRel, DadosForm, Marca, RelatorioGerado, Turma } from '../data/tipos';
import { alunosIniciais } from '../data/alunos';
import { turmasIniciais } from '../data/turmas';
import { atalhosIniciais } from '../data/relatorios';
import { hoje } from '../utils/datas';
import { Icone } from '../components/Icone';

export interface AtalhoHome { id: string; nome: string; icone: string; para: string }

export const ATALHOS_HOME: AtalhoHome[] = [
  { id: 'matricula', nome: 'Nova matrícula', icone: 'adicionar', para: '/alunos/matricula' },
  { id: 'procurar', nome: 'Procurar aluno', icone: 'buscar', para: '/alunos?procurar=1' },
  { id: 'chamada', nome: 'Chamada de hoje', icone: 'chamada', para: '/turmas/lista/todos' },
  { id: 'turmas', nome: 'Todas as turmas', icone: 'turmas', para: '/turmas/lista/todos' },
  { id: 'personalizado', nome: 'Relatório personalizado', icone: 'relatorios', para: '/relatorios/personalizado' },
];

export interface Estado {
  alunos: Aluno[];
  turmas: Turma[];
  atalhosHome: string[];
  atalhosRel: AtalhoRel[];
  relatorio?: RelatorioGerado;
  proximaMatricula: number;
  andamento?: { modalidade: string; etapa: number; dados: DadosForm; alunoId?: string } | null;
}

function inicial(): Estado {
  const alunos = alunosIniciais();
  return { alunos, turmas: turmasIniciais(alunos), atalhosHome: ['matricula', 'procurar', 'chamada'], atalhosRel: atalhosIniciais(), proximaMatricula: 138 };
}

export type Acao =
  | { t: 'salvarAluno'; aluno: Aluno; turmasAntes?: string[] }
  | { t: 'desativarAlunos'; ids: string[]; data: string; motivo: string }
  | { t: 'reativarAluno'; id: string }
  | { t: 'removerAlunos'; ids: string[] }
  | { t: 'concluirMatricula'; aluno: Aluno; irmaoId?: string }
  | { t: 'anexarFicha'; id: string; nomeArquivo: string }
  | { t: 'salvarTurma'; turma: Turma }
  | { t: 'desativarTurmas'; ids: string[]; data: string; motivo: string }
  | { t: 'reativarTurma'; id: string }
  | { t: 'removerTurma'; id: string }
  | { t: 'tirarDaTurma'; alunoId: string; turmaId: string }
  | { t: 'adicionarNaTurma'; alunoId: string; turmaId: string }
  | { t: 'marcarChamada'; turmaId: string; data: string; alunoId: string; marca: Marca | null; motivo?: string }
  | { t: 'motivoChamada'; turmaId: string; data: string; alunoId: string; motivo: string }
  | { t: 'marcarTodos'; turmaId: string; data: string; ids: string[] }
  | { t: 'atalhosHome'; ids: string[] }
  | { t: 'atalhosRel'; lista: AtalhoRel[] }
  | { t: 'relatorio'; relatorio: RelatorioGerado }
  | { t: 'andamento'; andamento: Estado['andamento'] };

const comHistorico = (a: Aluno, texto: string): Aluno => ({ ...a, historico: [...a.historico, { data: hoje(), texto }] });
const mudaAluno = (s: Estado, id: string, f: (a: Aluno) => Aluno): Estado => ({ ...s, alunos: s.alunos.map(a => (a.id === id ? f(a) : a)) });
const mudaTurma = (s: Estado, id: string, f: (t: Turma) => Turma): Estado => ({ ...s, turmas: s.turmas.map(t => (t.id === id ? f(t) : t)) });

export function reducer(s: Estado, a: Acao): Estado {
  switch (a.t) {
    case 'salvarAluno': {
      const existe = s.alunos.some(x => x.id === a.aluno.id);
      return { ...s, alunos: existe ? s.alunos.map(x => (x.id === a.aluno.id ? a.aluno : x)) : [...s.alunos, a.aluno] };
    }
    case 'desativarAlunos':
      return { ...s, alunos: s.alunos.map(x => (a.ids.includes(x.id) ? comHistorico({ ...x, status: 'Inativo', desativacao: { data: a.data, motivo: a.motivo } }, `Aluno desativado. Motivo: ${a.motivo}.`) : x)) };
    case 'reativarAluno':
      return mudaAluno(s, a.id, x => comHistorico({ ...x, status: 'Ativo', desativacao: undefined }, 'Aluno reativado.'));
    case 'removerAlunos':
      return { ...s, alunos: s.alunos.filter(x => !a.ids.includes(x.id)).map(x => ({ ...x, irmaos: x.irmaos.filter(i => !a.ids.includes(i)) })) };
    case 'concluirMatricula': {
      const novo = a.aluno;
      const existe = s.alunos.some(x => x.id === novo.id);
      let alunos = existe ? s.alunos.map(x => (x.id === novo.id ? novo : x)) : [...s.alunos, novo];
      if (a.irmaoId) alunos = alunos.map(x => (x.id === a.irmaoId && !x.irmaos.includes(novo.id) ? { ...x, irmaos: [...x.irmaos, novo.id] } : x));
      return { ...s, alunos, proximaMatricula: s.proximaMatricula + 1 };
    }
    case 'anexarFicha':
      return mudaAluno(s, a.id, x => comHistorico({ ...x, documentos: [...x.documentos.filter(d => d.nome !== 'Ficha de matrícula assinada'), { nome: 'Ficha de matrícula assinada', situacao: 'Entregue' }] }, `Ficha assinada anexada: ${a.nomeArquivo}.`));
    case 'salvarTurma': {
      const existe = s.turmas.some(t => t.id === a.turma.id);
      return { ...s, turmas: existe ? s.turmas.map(t => (t.id === a.turma.id ? a.turma : t)) : [...s.turmas, a.turma] };
    }
    case 'desativarTurmas':
      return { ...s, turmas: s.turmas.map(t => (a.ids.includes(t.id) ? { ...t, ativa: false, desativacao: { data: a.data, motivo: a.motivo } } : t)) };
    case 'reativarTurma':
      return mudaTurma(s, a.id, t => ({ ...t, ativa: true, desativacao: undefined }));
    case 'removerTurma':
      return { ...s, turmas: s.turmas.filter(t => t.id !== a.id), alunos: s.alunos.map(x => ({ ...x, turmaIds: x.turmaIds.filter(i => i !== a.id) })) };
    case 'tirarDaTurma': {
      const nome = s.turmas.find(t => t.id === a.turmaId)?.nome ?? '';
      return mudaAluno(s, a.alunoId, x => comHistorico({ ...x, turmaIds: x.turmaIds.filter(i => i !== a.turmaId) }, `Saiu da ${nome}.`));
    }
    case 'adicionarNaTurma': {
      const nome = s.turmas.find(t => t.id === a.turmaId)?.nome ?? '';
      return mudaAluno(s, a.alunoId, x => comHistorico({ ...x, turmaIds: [...x.turmaIds, a.turmaId] }, `Entrou na ${nome}.`));
    }
    case 'marcarChamada':
      return mudaTurma(s, a.turmaId, t => {
        const dia = { ...(t.chamadas[a.data] ?? {}) };
        if (a.marca === null) delete dia[a.alunoId];
        else dia[a.alunoId] = { m: a.marca, motivo: a.marca === 'J' ? a.motivo ?? dia[a.alunoId]?.motivo : undefined };
        return { ...t, chamadas: { ...t.chamadas, [a.data]: dia } };
      });
    case 'motivoChamada':
      return mudaTurma(s, a.turmaId, t => ({ ...t, chamadas: { ...t.chamadas, [a.data]: { ...t.chamadas[a.data], [a.alunoId]: { m: 'J', motivo: a.motivo } } } }));
    case 'marcarTodos':
      return mudaTurma(s, a.turmaId, t => {
        const dia = { ...(t.chamadas[a.data] ?? {}) };
        for (const id of a.ids) if (!dia[id]) dia[id] = { m: 'P' };
        return { ...t, chamadas: { ...t.chamadas, [a.data]: dia } };
      });
    case 'atalhosHome':
      return { ...s, atalhosHome: a.ids.slice(0, 3) };
    case 'atalhosRel':
      return { ...s, atalhosRel: a.lista };
    case 'andamento':
      return { ...s, andamento: a.andamento };
    case 'relatorio':
      return { ...s, relatorio: a.relatorio };
  }
}

const CHAVE = 'estrela-da-manha-v1';
function carregar(): Estado {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (bruto) return JSON.parse(bruto);
  } catch { /* segue com os dados de exemplo */ }
  return inicial();
}

interface Ctx {
  s: Estado;
  d: (a: Acao) => void;
  aviso: (texto: string) => void;
  restaurar: () => void;
}
const Contexto = createContext<Ctx | null>(null);
export const useStore = () => { const c = useContext(Contexto); if (!c) throw new Error('Sem store'); return c; };

interface AvisoAtual { id: number; texto: string }

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, d] = useReducer(reducer, undefined, carregar);
  const [avisoAtual, setAviso] = useState<AvisoAtual | null>(null);
  const seq = useRef(0);
  const criadoEm = useRef(0);
  useEffect(() => { try { localStorage.setItem(CHAVE, JSON.stringify(s)); } catch { /* sem cópia local */ } }, [s]);
  const aviso = useCallback((texto: string) => { criadoEm.current = Date.now(); setAviso({ id: ++seq.current, texto }); }, []);
  // O aviso acompanha a navegação da própria ação e some na próxima troca de tela, para não cobrir botões.
  const { pathname } = useLocation();
  useEffect(() => { if (Date.now() - criadoEm.current > 100) setAviso(null); }, [pathname]);
  const restaurar = useCallback(() => {
    try { localStorage.removeItem(CHAVE); } catch { /* nada a limpar */ }
    window.location.hash = '#/';
    window.location.reload();
  }, []);
  const valor = useMemo(() => ({ s, d, aviso, restaurar }), [s, aviso, restaurar]);
  return (
    <Contexto.Provider value={valor}>
      {children}
      {avisoAtual && <AvisoFlutuanteHost key={avisoAtual.id} texto={avisoAtual.texto} fechar={() => setAviso(null)} />}
    </Contexto.Provider>
  );
}

function AvisoFlutuanteHost({ texto, fechar }: { texto: string; fechar: () => void }) {
  const ref = useRef(fechar); ref.current = fechar;
  useEffect(() => { const t = setTimeout(() => ref.current(), 7000); return () => clearTimeout(t); }, []);
  return (
    <div className="aviso-flutuante nao-imprimir" role="status">
      <Icone nome="feito" tam={20} />
      <span>{texto}</span>
      <button type="button" onClick={fechar}>Fechar</button>
    </div>
  );
}

export function novoId(nome: string, existentes: { id: string }[]) {
  const base = nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item';
  let id = base, n = 2;
  while (existentes.some(e => e.id === id)) id = `${base}-${n++}`;
  return id;
}
export type { DadosForm };
