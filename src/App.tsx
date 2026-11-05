import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { BarraSuperior, Rodape } from './components/Layout';
import Home from './pages/home/Home';
import ListaAlunos from './pages/alunos/ListaAlunos';
import FichaAluno from './pages/alunos/FichaAluno';
import EditarCadastro from './pages/alunos/EditarCadastro';
import EscolherModalidade from './pages/alunos/EscolherModalidade';
import FormularioMatricula from './pages/alunos/FormularioMatricula';
import MatriculaConcluida from './pages/alunos/MatriculaConcluida';
import FichaImpressao from './pages/alunos/FichaImpressao';
import ModeloEmDesenho from './pages/alunos/ModeloEmDesenho';
import TurmasInicio from './pages/turmas/TurmasInicio';
import ListaTurmas from './pages/turmas/ListaTurmas';
import FormTurma from './pages/turmas/FormTurma';
import PaginaTurma from './pages/turmas/PaginaTurma';
import RelatoriosInicio from './pages/relatorios/RelatoriosInicio';
import RelatorioPersonalizado from './pages/relatorios/RelatorioPersonalizado';
import RelatorioPronto from './pages/relatorios/RelatorioPronto';

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <>
      <BarraSuperior />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/alunos" element={<ListaAlunos />} />
        <Route path="/alunos/matricula" element={<EscolherModalidade />} />
        <Route path="/alunos/matricula/:modalidade" element={<FormularioMatricula />} />
        <Route path="/alunos/:id/concluida" element={<MatriculaConcluida />} />
        <Route path="/alunos/:id/impressao" element={<FichaImpressao />} />
        <Route path="/alunos/:id/modelo" element={<ModeloEmDesenho />} />
        <Route path="/alunos/:id/editar" element={<EditarCadastro />} />
        <Route path="/alunos/:id" element={<FichaAluno />} />
        <Route path="/turmas" element={<TurmasInicio />} />
        <Route path="/turmas/lista/:filtro" element={<ListaTurmas />} />
        <Route path="/turmas/nova" element={<FormTurma />} />
        <Route path="/turmas/:id/editar" element={<FormTurma />} />
        <Route path="/turmas/:id" element={<PaginaTurma />} />
        <Route path="/relatorios" element={<RelatoriosInicio />} />
        <Route path="/relatorios/personalizado" element={<RelatorioPersonalizado />} />
        <Route path="/relatorios/pronto" element={<RelatorioPronto />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Rodape />
    </>
  );
}
