import { useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStore } from '../../store/store';
import { BarraCaminho, Pagina } from '../../components/Layout';
import { Botao } from '../../components/Botao';
import { CaixaAviso } from '../../components/Lista';
import { Icone } from '../../components/Icone';
import { NOME_MODALIDADE } from '../../data/tipos';
import { juntarNomes, turmaPrincipal } from './comum';
import { pendenciasDe } from './matriculaDados';

export default function MatriculaConcluida() {
  const { id } = useParams();
  const { s, d, aviso } = useStore();
  const arquivo = useRef<HTMLInputElement>(null);
  const aluno = s.alunos.find(a => a.id === id);
  if (!aluno) return <Pagina><BarraCaminho voltar="/alunos" textoVoltar="Voltar para Alunos" /></Pagina>;
  const t = turmaPrincipal(aluno, s.turmas);
  const dados = aluno.matricula?.dados ?? { modalidade: aluno.modalidade };
  const pend = pendenciasDe(dados);
  const preposicao = aluno.modalidade === 'infantil' ? 'na' : aluno.modalidade === 'contraturno' ? 'no' : 'nas';
  const impressao = aluno.modalidade === 'infantil' ? `/alunos/${aluno.id}/impressao` : `/alunos/${aluno.id}/modelo`;
  return (
    <Pagina fixa className="centro-cartao">
      <BarraCaminho voltar="/alunos" textoVoltar="Voltar para Alunos" />
      <div className="centro-area">
        <section className="cartao-resultado">
          <span className="selo-ok"><Icone nome="feito" tam={40} largura={2.4} /></span>
          <h1>Matrícula feita!</h1>
          <p className="subtitulo-16">{aluno.nome} está {preposicao} {NOME_MODALIDADE[aluno.modalidade]}{t ? `, ${t.curto}` : ''}.</p>
          {pend.length > 0 && (
            <CaixaAviso tipo="pendencia" icone="alerta" titulo={pend.length === 1 ? 'Ficou 1 informação para depois' : `Ficaram ${pend.length} informações para depois`}
              texto={`${juntarNomes(pend)}.`}
              acao={<Link className="link-verde" to={`/alunos/${aluno.id}/editar?parte=dados`}>Completar agora</Link>} />
          )}
          <div className="proximos">
            <p>Próximos passos</p>
            <div>
              <Botao tipo="secundario" icone="imprimir" para={impressao} largo>Imprimir ficha para assinar</Botao>
              <Botao tipo="secundario" icone="enviar-arquivo" largo onClick={() => arquivo.current?.click()}>Anexar ficha assinada</Botao>
              <input ref={arquivo} type="file" hidden accept="image/*,.pdf" aria-label="Anexar ficha assinada" onChange={e => { const f = e.target.files?.[0]; if (f) { d({ t: 'anexarFicha', id: aluno.id, nomeArquivo: f.name }); aviso('Ficha assinada anexada'); } e.target.value = ''; }} />
            </div>
          </div>
          <hr className="divisoria" />
          <div className="botoes-fim">
            <Botao tipo="discreto" para="/alunos">Voltar para Alunos</Botao>
            <Botao tipo="secundario" icone="adicionar" para="/alunos/matricula">Fazer outra matrícula</Botao>
            <Botao para={`/alunos/${aluno.id}`}>Ver ficha do aluno</Botao>
          </div>
        </section>
      </div>
    </Pagina>
  );
}
