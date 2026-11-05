import { useId } from 'react';
import type { ReactNode } from 'react';
import { Icone } from './Icone';
import type { NomeIcone } from './icones';

export function CampoBusca({ valor, onChange, placeholder, rotulo, inputRef }: { valor: string; onChange: (v: string) => void; placeholder: string; rotulo?: string; inputRef?: any }) {
  return (
    <label className="campo-busca">
      <Icone nome="buscar" tam={22} />
      <input ref={inputRef} type="search" aria-label={rotulo ?? placeholder} placeholder={placeholder} value={valor} onChange={e => onChange(e.target.value)} />
    </label>
  );
}
export function Filtro({ rotulo, valor, opcoes, onChange, padrao }: { rotulo: string; valor: string; opcoes: string[]; onChange: (v: string) => void; padrao: string }) {
  const id = useId();
  return (
    <div className={`filtro ${valor !== padrao ? 'aplicado' : ''}`}>
      <label htmlFor={id}>{rotulo}:</label>
      <b>{valor}</b>
      <Icone nome="abaixo" tam={18} />
      <select id={id} value={valor} onChange={e => onChange(e.target.value)}>
        {opcoes.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
export function Abas({ abas, atual, onChange, rotulo }: { abas: { id: string; nome: string; tag?: ReactNode }[]; atual: string; onChange: (id: string) => void; rotulo: string }) {
  return (
    <div className="abas" role="tablist" aria-label={rotulo}>
      {abas.map(a => (
        <button key={a.id} type="button" role="tab" aria-selected={a.id === atual} className={a.id === atual ? 'ativa' : ''} onClick={() => onChange(a.id)}>
          {a.nome}{a.tag}
        </button>
      ))}
    </div>
  );
}
export function CaixaAviso({ tipo = 'dica', icone, titulo, texto, acao }: { tipo?: 'dica' | 'pendencia' | 'sucesso' | 'inativo'; icone?: NomeIcone; titulo?: string; texto?: ReactNode; acao?: ReactNode }) {
  return (
    <div className={`caixa-aviso ${tipo}`}>
      {icone && <Icone nome={icone} />}
      <div>{titulo && <strong>{titulo}</strong>}{texto && <span>{texto}</span>}</div>
      {acao}
    </div>
  );
}
export function SalvoAuto() {
  return <span className="salvo-auto"><Icone nome="feito" tam={18} />Tudo salvo automaticamente</span>;
}
export function IndicadorEtapas({ etapas, atual }: { etapas: string[]; atual: number }) {
  return (
    <ol className="etapas" aria-label="Etapas">
      {etapas.map((e, i) => {
        const n = i + 1;
        const est = n < atual ? 'feita' : n === atual ? 'atual' : 'proxima';
        return (
          <li key={e} className={est} aria-current={n === atual ? 'step' : undefined}>
            <span className="circulo">{n < atual ? <Icone nome="feito" tam={18} largura={2.6} /> : n}</span>
            <span className="nome">{e}</span>
          </li>
        );
      })}
    </ol>
  );
}
