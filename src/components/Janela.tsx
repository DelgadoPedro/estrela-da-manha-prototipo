import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { Icone } from './Icone';
import type { NomeIcone } from './icones';

interface Props {
  titulo: string; texto?: ReactNode; icone?: NomeIcone; perigo?: boolean; fechar: () => void; children?: ReactNode; largura?: number;
}
// Janela aberta a partir de outra janela devolve o foco ao botão que abriu a primeira.
let origemForaDaJanela: Element | null = null;
const FOCAVEIS = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled])';

export function JanelaConfirmacao({ titulo, texto, icone, perigo, fechar, children, largura = 700 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const idT = useId();
  const origem = useRef<Element | null>(null);
  if (origem.current === null) {
    const ativo = document.activeElement;
    if (ativo && !ativo.closest('.janela')) origemForaDaJanela = ativo;
    origem.current = origemForaDaJanela;
  }
  const fecharRef = useRef(fechar); fecharRef.current = fechar;
  useEffect(() => {
    const el = ref.current!;
    (el.querySelector('[data-foco]') as HTMLElement | null ?? el.querySelector(FOCAVEIS) as HTMLElement | null)?.focus();
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); fecharRef.current(); return; }
      if (e.key !== 'Tab') return;
      const itens = [...el.querySelectorAll<HTMLElement>(FOCAVEIS)];
      if (!itens.length) return;
      const pri = itens[0], ult = itens[itens.length - 1];
      if (e.shiftKey && document.activeElement === pri) { e.preventDefault(); ult.focus(); }
      else if (!e.shiftKey && document.activeElement === ult) { e.preventDefault(); pri.focus(); }
    };
    document.addEventListener('keydown', tecla);
    return () => {
      document.removeEventListener('keydown', tecla);
      // Espera a tela atualizar: outra janela pode ter aberto no lugar desta.
      const alvo = origem.current;
      requestAnimationFrame(() => { if (!document.querySelector('.janela') && alvo instanceof HTMLElement && alvo.isConnected) alvo.focus(); });
    };
  }, []);
  return (
    <div className="sobreposicao nao-imprimir">
      <div className="janela" role="dialog" aria-modal="true" aria-labelledby={idT} ref={ref} style={{ width: largura }}>
        <div className="janela-topo">
          {icone && <span className={`janela-icone ${perigo ? 'perigo' : ''}`}><Icone nome={icone} tam={26} /></span>}
          <div>
            <h2 id={idT}>{titulo}</h2>
            {texto && <p>{texto}</p>}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
export function BotoesJanela({ children }: { children: ReactNode }) {
  return <><hr className="divisoria" /><div className="janela-botoes">{children}</div></>;
}
