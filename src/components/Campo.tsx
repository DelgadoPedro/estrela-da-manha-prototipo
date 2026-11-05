import { useId } from 'react';
import type { ReactNode } from 'react';
import { Icone } from './Icone';
import { EtiquetaPendente } from './Etiqueta';

interface BaseCampo {
  rotulo: string;
  valor: string;
  onChange?: (v: string) => void;
  obrigatorio?: boolean;
  erro?: string;
  ajuda?: ReactNode;
  pendente?: boolean;
  antes?: string;
  className?: string;
  soLeitura?: boolean;
}
function Rotulo({ id, rotulo, obrigatorio, pendente, alterado }: { id: string; rotulo: string; obrigatorio?: boolean; pendente?: boolean; alterado?: boolean }) {
  return (
    <div className="campo-rotulo">
      <label htmlFor={id}>{rotulo}{obrigatorio && ' *'}</label>
      {pendente && <EtiquetaPendente />}
      {alterado && <span className="selo-alterado">Alterado</span>}
    </div>
  );
}
const mensagem = (id: string, erro?: string, ajuda?: ReactNode, antes?: string) => (
  <>
    {erro && <p className="campo-erro" id={`${id}-m`}>{erro}</p>}
    {!erro && antes !== undefined && <p className="campo-ajuda" id={`${id}-m`}>Antes: {antes || 'não informado'}</p>}
    {!erro && antes === undefined && ajuda && <p className="campo-ajuda" id={`${id}-m`}>{ajuda}</p>}
  </>
);

export function Campo({ rotulo, valor, onChange, obrigatorio, erro, ajuda, pendente, antes, className = '', soLeitura, placeholder, mascara, multilinha, autoFocus }: BaseCampo & { placeholder?: string; mascara?: (v: string) => string; multilinha?: boolean; autoFocus?: boolean }) {
  const id = useId();
  const mostraPendente = pendente && !valor;
  const estado = erro ? 'erro' : antes !== undefined ? 'alterado' : mostraPendente ? 'pendente' : '';
  const props = {
    id, value: valor, readOnly: soLeitura, required: obrigatorio, autoFocus,
    placeholder: mostraPendente ? 'Não informado' : placeholder,
    'aria-invalid': erro ? true : undefined,
    'aria-describedby': erro || ajuda || antes !== undefined ? `${id}-m` : undefined,
    className: `caixa ${estado}`,
    onChange: (e: { target: { value: string } }) => onChange?.(mascara ? mascara(e.target.value) : e.target.value),
  };
  return (
    <div className={`campo ${className}`}>
      <Rotulo id={id} rotulo={rotulo} obrigatorio={obrigatorio} pendente={mostraPendente} alterado={antes !== undefined} />
      {multilinha ? <textarea {...props} /> : <input type="text" {...props} />}
      {mensagem(id, erro, ajuda, antes)}
    </div>
  );
}

export function CampoSelect({ rotulo, valor, onChange, obrigatorio, erro, opcoes, className = '', antes, ajuda, vazio }: BaseCampo & { opcoes: (string | { v: string; t: string; disabled?: boolean })[]; vazio?: string }) {
  const id = useId();
  return (
    <div className={`campo ${className}`}>
      <Rotulo id={id} rotulo={rotulo} obrigatorio={obrigatorio} alterado={antes !== undefined} />
      <div className="select-caixa">
        <select id={id} value={valor} required={obrigatorio} aria-invalid={erro ? true : undefined} aria-describedby={erro || ajuda ? `${id}-m` : undefined} className={`caixa ${erro ? 'erro' : antes !== undefined ? 'alterado' : ''}`} onChange={e => onChange?.(e.target.value)}>
          {vazio !== undefined && <option value="">{vazio}</option>}
          {opcoes.map(o => typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.v} value={o.v} disabled={o.disabled}>{o.t}</option>)}
        </select>
        <Icone nome="abaixo" />
      </div>
      {mensagem(id, erro, ajuda, antes)}
    </div>
  );
}

/** Grupo de botões de opção (uma ou várias respostas). */
export function GrupoOpcoes({ rotulo, valor, onChange, opcoes, obrigatorio, erro, varias, className = '', compacto }: {
  rotulo?: string; valor: string | string[]; onChange: (v: any) => void; opcoes: (string | { v: string; t: string; disabled?: boolean })[];
  obrigatorio?: boolean; erro?: string; varias?: boolean; className?: string; compacto?: boolean;
}) {
  const nome = useId();
  const marcados = Array.isArray(valor) ? valor : valor ? [valor] : [];
  return (
    <fieldset className={`grupo-opcoes ${className}`} aria-invalid={erro ? true : undefined}>
      {rotulo && <legend>{rotulo}{obrigatorio && ' *'}</legend>}
      <div className={`opcoes ${compacto ? 'compacto' : ''}`}>
        {opcoes.map(o => {
          const v = typeof o === 'string' ? o : o.v;
          const t = typeof o === 'string' ? o : o.t;
          const dis = typeof o === 'string' ? false : o.disabled;
          const sel = marcados.includes(v);
          return (
            <label key={v} className={`opcao ${sel ? 'sel' : ''} ${dis ? 'desligada' : ''}`}>
              <input type={varias ? 'checkbox' : 'radio'} name={nome} checked={sel} disabled={dis}
                onChange={() => {
                  if (!varias) return onChange(v);
                  onChange(sel ? marcados.filter(x => x !== v) : [...marcados, v]);
                }} />
              <span className="marcador" />
              <span>{t}</span>
            </label>
          );
        })}
      </div>
      {erro && <p className="campo-erro">{erro}</p>}
    </fieldset>
  );
}

export function CaixaSelecao({ marcada, parcial, onChange, rotulo, oculto, children }: { marcada: boolean; parcial?: boolean; onChange: (v: boolean) => void; rotulo: string; oculto?: boolean; children?: ReactNode }) {
  return (
    <label className={`caixa-selecao ${oculto ? 'so-caixa' : ''}`}>
      <input type="checkbox" aria-label={oculto ? rotulo : undefined} checked={marcada} ref={el => { if (el) el.indeterminate = !!parcial; }} onChange={e => onChange(e.target.checked)} />
      <span className={`quadrado ${marcada ? 'marcada' : parcial ? 'parcial' : ''}`}>
        {marcada ? <Icone nome="feito" tam={16} largura={3} /> : parcial ? <i /> : null}
      </span>
      {!oculto && <span>{children ?? rotulo}</span>}
    </label>
  );
}
