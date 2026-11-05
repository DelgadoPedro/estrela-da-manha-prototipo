import { useNavigate } from 'react-router-dom';
import { BarraCaminho, Pagina } from '../../components/Layout';

export default function ModeloEmDesenho() {
  const nav = useNavigate();
  return (
    <Pagina>
      <BarraCaminho onVoltar={() => nav(-1)} />
      <h1 className="titulo-36">Modelo em desenho</h1>
    </Pagina>
  );
}
