import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useStore } from '../../store/store';
import { BarraCaminho, Pagina } from '../../components/Layout';
import { Botao } from '../../components/Botao';
import { Abas } from '../../components/Lista';
import { EtiquetaModalidade, EtiquetaPendente, EtiquetaStatus } from '../../components/Etiqueta';
import { Icone } from '../../components/Icone';
import { FotoPadrao } from '../../components/Ilustracao';
import { linhaIrmao, rotuloEtiquetaTurma, turmasDoAluno } from './comum';
import { frequenciaAluno } from '../../data/turmas';
import { idadeTexto } from '../../utils/datas';
import { FichaEdInfantil } from '../../print/FichaEdInfantil';
import type { NomeIcone } from '../../components/icones';

function Dado({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return <div className="dado"><dt>{rotulo}</dt><dd>{children}</dd></div>;
}
function Cartao({ icone, titulo, perigo, children }: { icone: NomeIcone; titulo: string; perigo?: boolean; children: ReactNode }) {
  return <section className={`cartao-info ${perigo ? 'perigo' : ''}`}><h2><Icone nome={icone} tam={24} />{titulo}</h2><div>{children}</div></section>;
}

export default function FichaAluno() {
  const { id } = useParams();
  const { s, d, aviso } = useStore();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const aluno = s.alunos.find(a => a.id === id);
  const aba = params.get('aba') ?? 'dados';
  const [imprimindo, setImprimindo] = useState(false);
  const arquivo = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!imprimindo) return;
    const fim = () => setImprimindo(false);
    window.addEventListener('afterprint', fim);
    window.print();
    return () => window.removeEventListener('afterprint', fim);
  }, [imprimindo]);
  if (!aluno) return <Pagina><BarraCaminho voltar="/alunos" /><h1 className="titulo-36">Alunos</h1></Pagina>;
  const turmas = turmasDoAluno(aluno, s.turmas);
  const irmaos = aluno.irmaos.map(i => s.alunos.find(a => a.id === i)).filter(Boolean) as typeof s.alunos;
  const docsPendentes = aluno.documentos.filter(x => x.situacao === 'Pendente').length + (aluno.cpf && aluno.documentos.some(x => x.nome.startsWith('CPF') && x.situacao === 'Pendente') ? -1 : 0);
  const editar = `/alunos/${aluno.id}/editar`;
  const imprimir = () => (aluno.modalidade === 'infantil' ? setImprimindo(true) : nav(`/alunos/${aluno.id}/modelo`));
  const inativo = aluno.status === 'Inativo';
  return (
    <Pagina fixa className={`ficha ${inativo ? 'com-faixa' : ''}`}>
      <BarraCaminho voltar="/alunos">
        {inativo && <Botao tipo="secundario" onClick={() => { d({ t: 'reativarAluno', id: aluno.id }); aviso(`${aluno.nome} foi reativado`); }}>Reativar aluno</Botao>}
      </BarraCaminho>
      {inativo && <div className="faixa-inativo"><Icone nome="arquivar" />Aluno desativado em {aluno.desativacao?.data}. Motivo: {aluno.desativacao?.motivo.toLowerCase()}.</div>}
      <section className="ficha-topo">
        <FotoPadrao />
        <div className="ficha-id">
          <div className="ficha-nome"><h1>{aluno.nome}</h1><EtiquetaStatus status={aluno.status} /></div>
          <p>{idadeTexto(aluno.nascimento)}</p>
          <div className="etiquetas">
            {turmas.length === 0 && <EtiquetaModalidade m={aluno.modalidade} />}
            {turmas.map(t => <EtiquetaModalidade key={t.id} m={t.modalidade} texto={rotuloEtiquetaTurma(t)} />)}
          </div>
        </div>
        <span className="espaco" />
        <Botao tipo="secundario" icone="imprimir" onClick={imprimir}>Imprimir ficha</Botao>
        <Botao icone="editar" para={editar}>Editar cadastro</Botao>
      </section>
      <div className="cartoes-info">
        <Cartao icone="saude" titulo="Saúde" perigo>
          <div className="info-bloco"><small>Alergia</small><p className="alergia">{aluno.alergia || 'Nenhuma alergia informada'}</p></div>
          {aluno.condicao && <div className="info-bloco"><small>Condição de saúde</small><p>{aluno.condicao}</p></div>}
        </Cartao>
        <Cartao icone="autorizados" titulo="Pode buscar a criança">
          {aluno.autorizados.map(x => <p className="pessoa" key={x.nome}><b>{x.nome}</b> <span>· {x.parentesco}{x.documento ? ` · ${x.documento}` : ''}</span></p>)}
        </Cartao>
        <Cartao icone="telefone" titulo="Contatos de emergência">
          {aluno.emergencia.map(x => <div className="info-bloco" key={x.nome}><small>{x.nome}</small><p className="telefone">{x.telefone}</p></div>)}
        </Cartao>
      </div>
      <section className="ficha-abas">
        <Abas rotulo="Partes da ficha" atual={aba} onChange={v => setParams(v === 'dados' ? {} : { aba: v }, { replace: true })} abas={[
          { id: 'dados', nome: 'Dados pessoais' }, { id: 'responsaveis', nome: 'Responsáveis' }, { id: 'turmas', nome: 'Turmas e frequência' },
          { id: 'documentos', nome: 'Documentos', tag: docsPendentes > 0 ? <span className="tag-aba">{docsPendentes} {docsPendentes === 1 ? 'pendente' : 'pendentes'}</span> : undefined },
          { id: 'historico', nome: 'Histórico' },
        ]} />
        <div className="aba-conteudo" role="tabpanel">
          {aba === 'dados' && (
            <dl className="dados-grade">
              <Dado rotulo="Nome completo">{aluno.nome}</Dado>
              <Dado rotulo="Data de nascimento">{aluno.nascimento} ({idadeTexto(aluno.nascimento)})</Dado>
              <Dado rotulo="Sexo">{aluno.sexo || 'Não informado'}</Dado>
              <Dado rotulo="CPF">{aluno.cpf || <span className="pendente-completar"><EtiquetaPendente /><Link to={`${editar}?parte=dados`}>Completar</Link></span>}</Dado>
              <Dado rotulo="Endereço">{aluno.endereco || 'Não informado'}</Dado>
              <Dado rotulo="Irmãos na ONG">{irmaos.length ? irmaos.map(i => <Link className="link-forte" key={i.id} to={`/alunos/${i.id}`}>{linhaIrmao(i, s.turmas)}</Link>) : 'Nenhum'}</Dado>
              <Dado rotulo="Tamanho de roupa / sapato">{aluno.roupa || 'Não informado'}</Dado>
              <Dado rotulo="Autoriza uso de imagem">{aluno.imagem || 'Não informado'}</Dado>
              <Dado rotulo="Escola regular">{aluno.escola || 'Não informado'}</Dado>
            </dl>
          )}
          {aba === 'responsaveis' && (
            <div className="aba-responsaveis">
              <div className="botoes-aba">
                <Botao tipo="secundario" icone="editar" para={`${editar}?parte=responsaveis`}>Editar responsáveis</Botao>
                <Botao tipo="secundario" icone="adicionar" para={`${editar}?parte=responsaveis&novo=1`}>Adicionar responsável</Botao>
              </div>
              <div className="tabela-simples">
                <table>
                  <thead><tr><th>Nome</th><th>Parentesco</th><th>Telefone</th><th>Documento</th></tr></thead>
                  <tbody>{aluno.responsaveis.map(r => (
                    <tr key={r.nome + r.telefone}><td><b>{r.nome}</b></td><td>{r.parentesco}</td><td>{r.telefone}</td><td>{r.documento || <EtiquetaPendente texto="CPF pendente" />}</td></tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}
          {/* TODO(design): as abas Turmas e frequência, Documentos e Histórico não têm frame no Figma. Versão mais simples, no padrão da aba Responsáveis. */}
          {aba === 'turmas' && (
            <div className="tabela-simples"><table>
              <thead><tr><th>Turma</th><th>Modalidade</th><th>Professor</th><th>Frequência</th></tr></thead>
              <tbody>{turmas.map(t => { const f = frequenciaAluno(t, aluno.id); return <tr key={t.id}><td><Link className="link-forte" to={`/turmas/${t.id}`}>{t.nome}</Link></td><td><EtiquetaModalidade m={t.modalidade} /></td><td>{t.professor}</td><td>{f === null ? 'Sem aulas' : `${f}%`}</td></tr>; })}</tbody>
            </table></div>
          )}
          {aba === 'documentos' && (
            <div className="aba-responsaveis">
              <div className="botoes-aba">
                <Botao tipo="secundario" icone="enviar-arquivo" onClick={() => arquivo.current?.click()}>Anexar ficha assinada</Botao>
                <input ref={arquivo} type="file" hidden accept="image/*,.pdf" onChange={e => { const f = e.target.files?.[0]; if (f) { d({ t: 'anexarFicha', id: aluno.id, nomeArquivo: f.name }); aviso('Ficha assinada anexada'); } e.target.value = ''; }} />
              </div>
              <div className="tabela-simples"><table>
                <thead><tr><th>Documento</th><th>Situação</th></tr></thead>
                <tbody>{aluno.documentos.map(x => <tr key={x.nome}><td><b>{x.nome}</b></td><td>{x.situacao === 'Pendente' && !(x.nome.startsWith('CPF') && aluno.cpf) ? <EtiquetaPendente /> : <span className="etiqueta etiqueta-ativo pilula"><i />Entregue</span>}</td></tr>)}</tbody>
              </table></div>
            </div>
          )}
          {aba === 'historico' && (
            <ul className="historico">{[...aluno.historico].reverse().map((h, i) => <li key={i}><b>{h.data}</b><span>{h.texto}</span></li>)}</ul>
          )}
        </div>
      </section>
      {imprimindo && aluno.modalidade === 'infantil' && <div className="area-impressao"><FichaEdInfantil aluno={aluno} /></div>}
    </Pagina>
  );
}
