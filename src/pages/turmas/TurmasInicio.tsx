import { Link } from 'react-router-dom';
import { BarraCaminho, Pagina } from '../../components/Layout';
import { Botao } from '../../components/Botao';
import { Ilustracao } from '../../components/Ilustracao';

export default function TurmasInicio() {
  return (
    <Pagina fixa className="turmas-inicio">
      <BarraCaminho voltar="/" />
      <div className="linha-titulo">
        <div>
          <h1 className="titulo-40">Turmas</h1>
          <p className="subtitulo-18">Escolha o tipo de turma que você quer ver</p>
        </div>
        <Botao tipo="secundario" icone="turmas" para="/turmas/lista/todos">Ver todas as turmas</Botao>
      </div>
      <div className="secoes-centro">
        <div className="secoes-3 borda-forte">
          <Link className="botao-secao" to="/turmas/lista/infantil"><Ilustracao nome="Infantil" /><span>Educação<br />Infantil</span></Link>
          <Link className="botao-secao" to="/turmas/lista/contraturno"><Ilustracao nome="Contraturno" /><span>Contraturno</span></Link>
          <Link className="botao-secao" to="/turmas/lista/oficinas"><Ilustracao nome="Oficinas" /><span>Oficinas</span></Link>
        </div>
      </div>
    </Pagina>
  );
}
