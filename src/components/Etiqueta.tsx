import type { Modalidade, StatusAluno } from '../data/tipos';
import { CURTO_MODALIDADE } from '../data/tipos';

export function EtiquetaModalidade({ m, texto }: { m: Modalidade; texto?: string }) {
  return <span className={`etiqueta etiqueta-${m}`}><i />{texto ?? CURTO_MODALIDADE[m]}</span>;
}
export function EtiquetaStatus({ status }: { status: StatusAluno | 'Ativa' | 'Inativa' }) {
  const c = status === 'Ativo' || status === 'Ativa' ? 'ativo' : status === 'Pendente' ? 'pendente' : 'inativo';
  return <span className={`etiqueta etiqueta-${c} pilula`}><i />{status}</span>;
}
export function EtiquetaPendente({ texto = 'Pendente' }: { texto?: string }) {
  return <span className="etiqueta etiqueta-pendente pilula"><i />{texto}</span>;
}
