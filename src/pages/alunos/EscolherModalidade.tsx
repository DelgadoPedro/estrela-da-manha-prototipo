import { Link } from 'react-router-dom';
import { BarraCaminho, Pagina } from '../../components/Layout';
import { Ilustracao } from '../../components/Ilustracao';

export default function EscolherModalidade() {
  return (
    <Pagina fixa className="escolher">
      <BarraCaminho voltar="/alunos" />
      <div className="titulo-bloco">
        <h1 className="titulo-32">Nova matrícula</h1>
        <p className="subtitulo-16">Em qual modalidade a criança vai entrar?</p>
      </div>
      <div className="secoes-centro">
        <div className="secoes-3">
          <Link className="botao-secao" to="/alunos/matricula/infantil"><Ilustracao nome="Infantil" /><span>Educação<br />Infantil</span></Link>
          <Link className="botao-secao" to="/alunos/matricula/contraturno"><Ilustracao nome="Contraturno" /><span>Contraturno</span></Link>
          <Link className="botao-secao" to="/alunos/matricula/oficinas"><Ilustracao nome="Oficinas" /><span>Oficinas</span></Link>
        </div>
      </div>
    </Pagina>
  );
}
