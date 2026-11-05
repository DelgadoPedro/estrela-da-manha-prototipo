import { ICONES } from './icones';
import type { NomeIcone } from './icones';
export function Icone({ nome, tam = 20, largura = 2 }: { nome: NomeIcone; tam?: number; largura?: number }) {
  return <svg className="icone" width={tam} height={tam} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={largura} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONES[nome] }} />;
}
export function EstrelaCheia({ tam = 20 }: { tam?: number }) {
  return <svg width={tam} height={tam} viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" fill="#F7D800" stroke="#C9A800" strokeWidth="1.4" strokeLinejoin="round" /></svg>;
}
