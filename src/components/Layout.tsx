import { Fragment } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icone } from './Icone';
import { Logo } from './Ilustracao';
import { useStore } from '../store/store';

const SECOES = [
  { nome: 'Home', para: '/', icone: 'inicio' },
  { nome: 'Alunos', para: '/alunos', icone: 'alunos' },
  { nome: 'Turmas', para: '/turmas', icone: 'turmas' },
  { nome: 'Relatórios', para: '/relatorios', icone: 'relatorios' },
] as const;

export function BarraSuperior() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const atual = (p: string) => (p === '/' ? pathname === '/' : pathname.startsWith(p));
  return (
    <header className="barra nao-imprimir">
      <div className="barra-in">
        <Link className="marca" to="/" aria-label="Casa da Infância Estrela da Manhã, ir para a Home">
          <Logo />
          <span><small>Casa da Infância</small><b>Estrela da Manhã</b></span>
        </Link>
        <nav aria-label="Seções do sistema">
          {SECOES.map(s => (
            <Link key={s.nome} to={s.para} aria-current={atual(s.para) ? 'page' : undefined}><Icone nome={s.icone} tam={22} />{s.nome}</Link>
          ))}
        </nav>
        <div className="usuario">
          <span><b>Mariana Souza</b><small>Coordenação</small></span>
          {/* TODO(design): sem login no protótipo. Sair só volta para a Home. */}
          <button type="button" className="sair" onClick={() => nav('/')}><Icone nome="sair" />Sair</button>
        </div>
      </div>
    </header>
  );
}

export function Rodape() {
  const { restaurar } = useStore();
  return <button type="button" className="restaurar nao-imprimir" onClick={restaurar}>Restaurar dados de exemplo</button>;
}

export interface ItemCaminho { nome: string; para?: string }
export function Voltar({ para, onClick, texto = 'Voltar' }: { para?: string; onClick?: () => void; texto?: string }) {
  const dentro = <><Icone nome="voltar" />{texto}</>;
  return para ? <Link className="botao botao-secundario voltar" to={para}>{dentro}</Link> : <button type="button" className="botao botao-secundario voltar" onClick={onClick}>{dentro}</button>;
}
export function BarraCaminho({ voltar, onVoltar, caminho, textoVoltar, children }: { voltar?: string; onVoltar?: () => void; caminho?: ItemCaminho[]; textoVoltar?: string; children?: ReactNode }) {
  return (
    <div className="barra-caminho nao-imprimir">
      <Voltar para={voltar} onClick={onVoltar} texto={textoVoltar} />
      {caminho && (
        <nav className="caminho" aria-label="Você está em">
          {caminho.map((c, i) => (
            <Fragment key={c.nome + i}>
              {i > 0 && <Icone nome="avancar" tam={16} />}
              {c.para ? <Link to={c.para}>{c.nome}</Link> : <span aria-current="page">{c.nome}</span>}
            </Fragment>
          ))}
        </nav>
      )}
      <span className="espaco" />
      {children}
    </div>
  );
}
export function Pagina({ children, fixa, className = '' }: { children: ReactNode; fixa?: boolean; className?: string }) {
  return <main className={`pagina ${fixa ? 'pagina-fixa' : ''} ${className}`}>{children}</main>;
}
