import { ILUSTRACOES } from './ilustracoes';
import type { NomeIlustracao } from './ilustracoes';
import logo from '../assets/logo.png';
export function Ilustracao({ nome, tam = 190 }: { nome: NomeIlustracao; tam?: number }) {
  return <svg width={tam} height={tam} viewBox="0 0 190 190" fill="none" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ILUSTRACOES[nome] }} />;
}
/** Retrato padrão da ficha: o mesmo desenho da Ilustração/Alunos. */
export function FotoPadrao({ tam = 112 }: { tam?: number }) {
  return (
    <svg className="foto-padrao" width={tam} height={tam} viewBox="26 71.8 71.4 70.7" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Foto da criança">
      <path d="M34.8333 142.5C34.8333 126.667 45.9167 117.167 61.75 117.167C77.5833 117.167 88.6667 126.667 88.6667 142.5H34.8333Z" fill="#1F7A3A" />
      <path d="M61.75 114.792C70.0573 114.792 76.7917 108.057 76.7917 99.7499C76.7917 91.4426 70.0573 84.7083 61.75 84.7083C53.4427 84.7083 46.7083 91.4426 46.7083 99.7499C46.7083 108.057 53.4427 114.792 61.75 114.792Z" fill="#E9B98C" />
      <path d="M46.7083 98.1667C46.7083 88.6667 53.5167 83.125 61.75 83.125C69.9833 83.125 76.7917 88.6667 76.7917 98.1667C72.8333 92.625 67.2917 91.0417 61.75 91.0417C56.2083 91.0417 50.6667 92.625 46.7083 98.1667Z" fill="#5B3A23" />
    </svg>
  );
}
export function Logo({ tam = 58 }: { tam?: number }) {
  return <img src={logo} width={tam} height={tam} style={{ objectFit: 'contain' }} alt="Logo da Casa da Infância Estrela da Manhã" />;
}
