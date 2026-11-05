import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/store';
import { BarraCaminho, Pagina } from '../../components/Layout';
import { Botao } from '../../components/Botao';
import { CaixaAviso } from '../../components/Lista';
import { Icone } from '../../components/Icone';
import { paginasRelatorio } from '../../data/relatorios';
import { baixar, gerarCsv, gerarPdf } from '../../utils/pdf';
import { TabelaImpressao } from './comum';

export default function RelatorioPronto() {
  const { s, aviso } = useStore();
  const nav = useNavigate();
  const r = s.relatorio;
  useEffect(() => { if (!r) nav('/relatorios', { replace: true }); }, [r]);
  if (!r) return null;
  const n = paginasRelatorio(r);
  const baixarAgora = () => {
    baixar(r.formato === 'PDF' ? gerarPdf(r.titulo, r.detalhe, r.colunas, r.linhas) : gerarCsv(r.colunas, r.linhas), r.arquivo);
    aviso('Relatório baixado');
  };
  return (
    <Pagina fixa className="centro-cartao relatorio-pronto">
      <BarraCaminho voltar={r.de} caminho={[{ nome: 'Relatórios', para: '/relatorios' }, { nome: 'Relatório pronto' }]} />
      <div className="centro-area nao-imprimir">
        <section className="cartao-resultado estreito">
          <span className="selo-ok"><Icone nome="feito" tam={40} largura={2.4} /></span>
          <h1>Seu relatório está pronto</h1>
          <p className="subtitulo-16">{r.detalhe}</p>
          <div className="arquivo-pronto">
            <Icone nome="documento" tam={24} />
            <div><b>{r.arquivo}</b><small>{r.formato} · {r.formato === 'PDF' ? `${n} ${n === 1 ? 'página' : 'páginas'} · pronto para imprimir` : `${r.linhas.length} linhas`}</small></div>
          </div>
          <Botao icone="baixar" largo onClick={baixarAgora}>Baixar relatório</Botao>
          <div className="botoes-2">
            <Botao tipo="secundario" icone="imprimir" largo onClick={() => window.print()}>Imprimir</Botao>
            <Botao tipo="discreto" icone="relatorios" largo para="/relatorios">Gerar outro relatório</Botao>
          </div>
          {r.aviso && <CaixaAviso icone="info" texto={r.aviso} />}
        </section>
      </div>
      <div className="area-relatorio"><TabelaImpressao r={r} /></div>
    </Pagina>
  );
}
