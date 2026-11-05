export type Modalidade = 'infantil' | 'contraturno' | 'oficinas';
export type StatusAluno = 'Ativo' | 'Pendente' | 'Inativo';
export type Marca = 'P' | 'F' | 'J';

export const NOME_MODALIDADE: Record<Modalidade, string> = { infantil: 'Educação Infantil', contraturno: 'Contraturno', oficinas: 'Oficinas' };
export const CURTO_MODALIDADE: Record<Modalidade, string> = { infantil: 'Ed. Infantil', contraturno: 'Contraturno', oficinas: 'Oficinas' };

export interface Responsavel { nome: string; parentesco: string; telefone: string; documento: string }
export interface Autorizado { nome: string; parentesco: string; documento: string; telefone?: string }
export interface Documento { nome: string; situacao: 'Entregue' | 'Pendente' }
export interface EventoHistorico { data: string; texto: string }

export type DadosForm = Record<string, any>;

export interface Aluno {
  id: string;
  nome: string;
  nascimento: string;
  sexo: string;
  status: StatusAluno;
  modalidade: Modalidade;
  turmaIds: string[];
  cpf: string;
  endereco: string;
  escola: string;
  roupa: string;
  imagem: string;
  irmaos: string[];
  responsaveis: Responsavel[];
  autorizados: Autorizado[];
  emergencia: { nome: string; telefone: string }[];
  alergia: string;
  condicao: string;
  documentos: Documento[];
  historico: EventoHistorico[];
  desativacao?: { data: string; motivo: string };
  matricula?: { numero: string; preenchidaEm: string; preenchidaHora: string; dados: DadosForm };
  rascunho?: { etapa: number; dados: DadosForm };
}

export interface HorarioDia { dia: string; inicio: string; fim: string }
export type Chamadas = Record<string, Record<string, { m: Marca; motivo?: string }>>;

export interface Turma {
  id: string;
  nome: string;
  curto: string;
  modalidade: Modalidade;
  professor: string;
  sala: string;
  observacoes: string;
  horarios: HorarioDia[];
  inicio: string;
  encerramento: string;
  vagas: number;
  ativa: boolean;
  desativacao?: { data: string; motivo: string };
  chamadas: Chamadas;
}

export interface AtalhoRel { id: string; nome: string; tipo: string }
export interface RelatorioGerado {
  tipo: string; titulo: string; detalhe: string; arquivo: string; formato: 'PDF' | 'Excel';
  colunas: string[]; linhas: string[][]; aviso?: string; de: string;
}
