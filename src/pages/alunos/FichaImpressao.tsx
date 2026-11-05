import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store/store';
import { BarraCaminho, Pagina } from '../../components/Layout';
import { Botao } from '../../components/Botao';
import { FichaEdInfantil } from '../../print/FichaEdInfantil';
import { NOME_MODALIDADE } from '../../data/tipos';

export default function FichaImpressao() {
  const { id } = useParams();
  const { s } = useStore();
  const nav = useNavigate();
  const aluno = s.alunos.find(a => a.id === id);
  if (!aluno) return <Pagina><BarraCaminho voltar="/alunos" /></Pagina>;
  const voltar = () => (aluno.matricula ? nav(`/alunos/${aluno.id}/concluida`) : nav(`/alunos/${aluno.id}`));
  return (
    <Pagina className="impressao-tela">
      <BarraCaminho onVoltar={voltar} />
      <div className="linha-titulo nao-imprimir">
        <div>
          <h1 className="titulo-36">Ficha para assinatura</h1>
          <p className="subtitulo-16">{aluno.nome} · {NOME_MODALIDADE[aluno.modalidade]} · 2 páginas</p>
        </div>
        <div className="botoes-linha">
          {/* TODO(design): "Baixar PDF" chama a impressão do navegador, como pedido, até existir geração de PDF. */}
          <Botao tipo="secundario" icone="baixar" onClick={() => window.print()}>Baixar PDF</Botao>
          <Botao icone="imprimir" onClick={() => window.print()}>Imprimir</Botao>
        </div>
      </div>
      <div className="impressao-preview">
        <FichaEdInfantil aluno={aluno} />
      </div>
    </Pagina>
  );
}
