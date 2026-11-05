import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useStore } from '../../store/store';
import { BarraCaminho, Pagina } from '../../components/Layout';
import { Botao } from '../../components/Botao';
import { Abas, SalvoAuto } from '../../components/Lista';
import { EtiquetaModalidade, EtiquetaStatus } from '../../components/Etiqueta';
import { BotoesJanela, JanelaConfirmacao } from '../../components/Janela';
import { CampoBusca } from '../../components/Lista';
import { Icone } from '../../components/Icone';
import { FILTROS, JanelaDesativarTurmas, JanelaRemoverTurma, alunosDaTurma, semTitulo } from './comum';
import { datasDeAula, frequenciaAluno } from '../../data/turmas';
import { hoje, idadeTexto, nomeDia, nomeDiaMin, ordemData, siglaDia } from '../../utils/datas';
import { NOME_MODALIDADE } from '../../data/tipos';
import type { Aluno, Marca, Turma } from '../../data/tipos';
import { turmaPrincipal } from '../alunos/comum';

const ABAS = [{ id: 'chamada', nome: 'Chamada' }, { id: 'alunos', nome: 'Alunos' }, { id: 'frequencia', nome: 'Frequência' }, { id: 'dados', nome: 'Dados' }];

function datasDaTurma(t: Turma) {
  const set = new Set([...datasDeAula(t, 7), ...Object.keys(t.chamadas), hoje()]);
  return [...set].sort((a, b) => ordemData(b) - ordemData(a));
}

function contar(t: Turma, data: string, alunos: Aluno[]) {
  const dia = t.chamadas[data] ?? {};
  let p = 0, f = 0, j = 0;
  for (const a of alunos) { const m = dia[a.id]?.m; if (m === 'P') p++; if (m === 'F') f++; if (m === 'J') j++; }
  return { p, f, j, sem: alunos.length - p - f - j };
}

function AbaChamada({ t, alunos, data, setData }: { t: Turma; alunos: Aluno[]; data: string; setData: (d: string) => void }) {
  const { d } = useStore();
  const dia = t.chamadas[data] ?? {};
  const c = contar(t, data, alunos);
  const marcar = (id: string, m: Marca) => d({ t: 'marcarChamada', turmaId: t.id, data, alunoId: id, marca: dia[id]?.m === m ? null : m });
  return (
    <div className="aba-chamada">
      <div className="chamada-topo">
        <div className="select-caixa select-aula">
          <select aria-label="Dia da aula" className="caixa" value={data} onChange={e => setData(e.target.value)}>
            {datasDaTurma(t).map(x => <option key={x} value={x}>Aula de {nomeDiaMin(x)}, {x}</option>)}
          </select>
          <Icone nome="abaixo" />
        </div>
        <p className="chamada-resumo" role="status">Presentes {c.p} · Faltas {c.f} · Justificadas {c.j} · Sem marcar {c.sem}</p>
        <SalvoAuto />
        <Botao tipo="secundario" onClick={() => d({ t: 'marcarTodos', turmaId: t.id, data, ids: alunos.map(a => a.id) })}>Marcar todos presentes</Botao>
      </div>
      <div className="chamada-lista">
        {alunos.map(a => {
          const r = dia[a.id];
          return (
            <div className="chamada-linha" key={a.id}>
              <div className="chamada-principal">
                <strong id={`ch-${a.id}`}>{a.nome}</strong>
                <div className="marcas-chamada" role="group" aria-labelledby={`ch-${a.id}`}>
                  <button type="button" aria-pressed={r?.m === 'P'} className={r?.m === 'P' ? 'p' : ''} onClick={() => marcar(a.id, 'P')}>Presente</button>
                  <button type="button" aria-pressed={r?.m === 'F'} className={r?.m === 'F' ? 'f' : ''} onClick={() => marcar(a.id, 'F')}>Falta</button>
                  <button type="button" aria-pressed={r?.m === 'J'} className={r?.m === 'J' ? 'j' : ''} onClick={() => marcar(a.id, 'J')}>Falta justificada</button>
                </div>
              </div>
              {r?.m === 'J' && <input className="caixa motivo-falta" aria-label={`Motivo da falta de ${a.nome}`} value={r.motivo ?? ''} onChange={e => d({ t: 'motivoChamada', turmaId: t.id, data, alunoId: a.id, motivo: e.target.value })} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SeloFreq({ f }: { f: number | null }) {
  if (f === null) return <>Sem aulas</>;
  return <>{f}%{f < 70 ? <span className="selo-baixa">Baixa</span> : f < 80 ? <span className="selo-atencao">Atenção</span> : null}</>;
}

function AbaAlunos({ t, alunos, tirar }: { t: Turma; alunos: Aluno[]; tirar: (a: Aluno) => void }) {
  const livres = t.vagas - alunos.length;
  return (
    <div className="aba-alunos">
      <div className="alunos-topo"><strong>{alunos.length} {alunos.length === 1 ? 'aluno' : 'alunos'} na turma · {livres} {livres === 1 ? 'vaga livre' : 'vagas livres'}</strong><span>A frequência não conta as faltas justificadas.</span></div>
      <div className="lista-rola">
        <table className="tabela-leve">
          <thead><tr><th>Aluno</th><th style={{ width: 280 }}>Frequência</th><th style={{ width: 190 }}><span className="sr-only">Ação</span></th></tr></thead>
          <tbody>
            {alunos.map(a => (
              <tr key={a.id}>
                <td><Link className="link-sublinhado" to={`/alunos/${a.id}`}>{a.nome}</Link></td>
                <td className="freq"><SeloFreq f={frequenciaAluno(t, a.id)} /></td>
                <td><Botao tipo="secundario" onClick={() => tirar(a)} rotulo={`Tirar ${a.nome} da turma`}>Tirar da turma</Botao></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AbaFrequencia({ t, alunos, abrirDia }: { t: Turma; alunos: Aluno[]; abrirDia: (d: string) => void }) {
  const [modo, setModo] = useState<'aluno' | 'aula'>('aluno');
  const datas = useMemo(() => Object.keys(t.chamadas).sort((a, b) => ordemData(a) - ordemData(b)).slice(-7), [t.chamadas]);
  const seg = (
    <div className="segmentado" role="group" aria-label="Ver frequência">
      <button type="button" aria-pressed={modo === 'aluno'} onClick={() => setModo('aluno')}>Por aluno</button>
      <button type="button" aria-pressed={modo === 'aula'} onClick={() => setModo('aula')}>Por aula</button>
    </div>
  );
  if (modo === 'aula') {
    return (
      <div className="aba-freq">
        <div className="freq-topo">{seg}<span className="freq-dica">Clique numa aula para abrir a chamada daquele dia.</span></div>
        <div className="lista-rola">
          <table className="tabela-leve por-aula">
            <thead><tr><th>Aula</th><th>Presentes</th><th>Faltas</th><th>Justificadas</th><th>Sem marcar</th></tr></thead>
            <tbody>
              {[...datas].reverse().map(x => {
                const c = contar(t, x, alunos);
                return (
                  <tr key={x}>
                    <td><button type="button" className="link-sublinhado" onClick={() => abrirDia(x)}>{nomeDia(x)}, {x}</button>{x === hoje() && <span className="selo-hoje">Hoje</span>}</td>
                    <td className={c.p ? 'n-p' : ''}>{c.p}</td><td className={c.f ? 'n-f' : ''}>{c.f}</td><td className={c.j ? 'n-j' : ''}>{c.j}</td><td>{c.sem}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  return (
    <div className="aba-freq">
      <div className="freq-topo">
        {seg}
        <span className="freq-dica">Últimas {datas.length} aulas · o % considera todo o período e não conta faltas justificadas</span>
        <span className="legenda"><i className="marca-freq p"><Icone nome="feito" tam={14} largura={2.6} /></i>Presente<i className="marca-freq f">×</i>Falta<i className="marca-freq j">J</i>Justificada</span>
      </div>
      <div className="lista-rola">
        <table className="tabela-leve por-aluno">
          <thead>
            <tr>
              <th>Aluno</th>
              {datas.map(x => <th key={x} className="col-data"><button type="button" onClick={() => abrirDia(x)} aria-label={`Abrir chamada de ${x}`}><small>{siglaDia(x)}</small><b>{x.slice(0, 5)}</b></button></th>)}
              <th className="col-pc">% no período</th>
            </tr>
          </thead>
          <tbody>
            {alunos.map(a => {
              const f = frequenciaAluno(t, a.id);
              return (
                <tr key={a.id}>
                  <td><strong>{a.nome}</strong></td>
                  {datas.map(x => {
                    const m = t.chamadas[x]?.[a.id]?.m;
                    return <td key={x} className="col-data">{m === 'P' ? <i className="marca-freq p" title="Presente"><Icone nome="feito" tam={14} largura={2.6} /><span className="sr-only">Presente</span></i> : m === 'F' ? <i className="marca-freq f" title="Falta">×<span className="sr-only">Falta</span></i> : m === 'J' ? <i className="marca-freq j" title="Justificada">J<span className="sr-only">ustificada</span></i> : <span className="traco">–</span>}</td>;
                  })}
                  <td className={`col-pc ${f !== null && f < 70 ? 'baixa' : f !== null && f < 80 ? 'atencao' : ''}`}>{f === null ? '–' : `${f}%`}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AbaDados({ t, alunos, desativar, remover, reativar }: { t: Turma; alunos: Aluno[]; desativar: () => void; remover: () => void; reativar: () => void }) {
  const Dado = ({ r, children }: { r: string; children: ReactNode }) => <div className="dado forte"><dt>{r}</dt><dd>{children}</dd></div>;
  return (
    <div className="aba-dados">
      <dl className="dados-grade">
        <Dado r="Nome da turma">{t.nome}</Dado>
        <Dado r="Modalidade"><EtiquetaModalidade m={t.modalidade} /></Dado>
        <Dado r="Situação"><EtiquetaStatus status={t.ativa ? 'Ativa' : 'Inativa'} /></Dado>
        <Dado r="Professor">{semTitulo(t.professor)}</Dado>
        <Dado r="Sala ou local">{t.sala || 'Não informado'}</Dado>
        <Dado r="Vagas">{alunos.length} de {t.vagas} ({t.vagas - alunos.length} {t.vagas - alunos.length === 1 ? 'livre' : 'livres'})</Dado>
        <Dado r="Dias e horários">{t.horarios.map(h => <span className="bloco-linha" key={h.dia}>{h.dia} · {h.inicio} às {h.fim}</span>)}</Dado>
        <Dado r="Início das aulas">{t.inicio}</Dado>
        <Dado r="Encerramento">{t.encerramento || 'Sem data de término'}</Dado>
        {t.observacoes && <Dado r="Observações">{t.observacoes}</Dado>}
      </dl>
      <div className="zona-perigo">
        <div><strong>Desativar ou remover a turma</strong><p>Desativar guarda o histórico e dá para reativar depois. Remover apaga a turma para sempre.</p></div>
        {/* TODO(design): reativar turma não tem frame. Fica no lugar de Desativar quando a turma está inativa. */}
        {t.ativa ? <Botao tipo="secundario" icone="arquivar" onClick={desativar}>Desativar turma</Botao> : <Botao tipo="secundario" icone="arquivar" onClick={reativar}>Reativar turma</Botao>}
        <Botao tipo="perigo" icone="lixeira" onClick={remover}>Remover turma</Botao>
      </div>
    </div>
  );
}

function JanelaAdicionar({ t, alunos, fechar, adicionou }: { t: Turma; alunos: Aluno[]; fechar: () => void; adicionou: () => void }) {
  const { s, d, aviso } = useStore();
  const [busca, setBusca] = useState('');
  const norm = (x: string) => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const livres = t.vagas - alunos.length;
  const lista = s.alunos.filter(a => !a.turmaIds.includes(t.id) && a.status !== 'Inativo' && !a.rascunho && norm(a.nome).includes(norm(busca))).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  const add = (a: Aluno) => { d({ t: 'adicionarNaTurma', alunoId: a.id, turmaId: t.id }); aviso('Aluno adicionado'); adicionou(); };
  return (
    <JanelaConfirmacao titulo={`Adicionar aluno à ${t.nome}`} texto={livres > 0 ? `Restam ${livres} ${livres === 1 ? 'vaga' : 'vagas'}. Só aparecem alunos já cadastrados.` : 'Turma sem vagas'} fechar={fechar} largura={720}>
      <CampoBusca valor={busca} onChange={setBusca} placeholder="Buscar aluno pelo nome" />
      <ul className="lista-adicionar">
        {lista.map(a => {
          const tp = turmaPrincipal(a, s.turmas);
          return (
            <li key={a.id}>
              <div><strong>{a.nome}</strong><small>{idadeTexto(a.nascimento)}{tp ? ` · ${tp.modalidade === 'oficinas' ? tp.nome : `${NOME_MODALIDADE[tp.modalidade]} ${tp.curto}`}` : ''}</small></div>
              <Botao tipo="secundario" disabled={livres <= 0} onClick={() => add(a)} rotulo={`Adicionar ${a.nome}`}>Adicionar</Botao>
            </li>
          );
        })}
      </ul>
      <BotoesJanela><Botao tipo="secundario" largo onClick={fechar}>Fechar</Botao></BotoesJanela>
    </JanelaConfirmacao>
  );
}

export default function PaginaTurma() {
  const { id } = useParams();
  const { s, d, aviso } = useStore();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const t = s.turmas.find(x => x.id === id);
  const aba = params.get('aba') ?? 'chamada';
  const [dataEsc, setDataEsc] = useState(params.get('data') ?? hoje());
  const [tirar, setTirar] = useState<Aluno | null>(null);
  const [janela, setJanela] = useState<'adicionar' | 'desativar' | 'remover' | null>(null);
  if (!t) return <Pagina><BarraCaminho voltar="/turmas" /></Pagina>;
  const alunos = alunosDaTurma(t, s.alunos);
  const lista = `/turmas/lista/${t.modalidade}`;
  const abrirDia = (x: string) => { setDataEsc(x); setParams({ aba: 'chamada' }); };
  return (
    <Pagina fixa className="pagina-turma">
      <BarraCaminho voltar={lista} caminho={[{ nome: 'Turmas', para: '/turmas' }, { nome: FILTROS[t.modalidade].caminho, para: lista }, { nome: t.nome }]} />
      <section className="turma-topo">
        <h1>{t.nome}</h1>
        <EtiquetaStatus status={t.ativa ? 'Ativa' : 'Inativa'} />
        <EtiquetaModalidade m={t.modalidade} />
        <strong>{alunos.length} de {t.vagas} vagas</strong>
        <span className="espaco" />
        <Botao tipo="secundario" icone="editar" para={`/turmas/${t.id}/editar`}>Editar turma</Botao>
        <Botao icone="adicionar" onClick={() => setJanela('adicionar')}>Adicionar aluno</Botao>
      </section>
      <section className="turma-abas">
        <Abas rotulo="Partes da turma" atual={aba} abas={ABAS} onChange={v => setParams({ aba: v }, { replace: true })} />
        <div className="aba-conteudo" role="tabpanel">
          {aba === 'chamada' && <AbaChamada t={t} alunos={alunos} data={dataEsc} setData={setDataEsc} />}
          {aba === 'alunos' && <AbaAlunos t={t} alunos={alunos} tirar={setTirar} />}
          {aba === 'frequencia' && <AbaFrequencia t={t} alunos={alunos} abrirDia={abrirDia} />}
          {aba === 'dados' && <AbaDados t={t} alunos={alunos} desativar={() => setJanela('desativar')} remover={() => setJanela('remover')} reativar={() => { d({ t: 'reativarTurma', id: t.id }); aviso(`${t.nome} reativada`); }} />}
        </div>
      </section>
      {tirar && (
        <JanelaConfirmacao titulo={`Tirar ${tirar.nome} da turma?`} texto={`${tirar.sexo === 'Feminino' ? 'Ela' : 'Ele'} continua cadastrad${tirar.sexo === 'Feminino' ? 'a' : 'o'} e a vaga fica livre para outro aluno. As presenças e faltas ${tirar.sexo === 'Feminino' ? 'dela' : 'dele'} nesta turma continuam guardadas.`} icone="alunos" perigo fechar={() => setTirar(null)} largura={720}>
          <BotoesJanela>
            <Botao tipo="secundario" largo onClick={() => setTirar(null)}>Voltar</Botao>
            <Botao tipo="perigo-cheio" largo onClick={() => { d({ t: 'tirarDaTurma', alunoId: tirar.id, turmaId: t.id }); aviso(`${tirar.nome} saiu da turma`); setTirar(null); }}>Tirar da turma</Botao>
          </BotoesJanela>
        </JanelaConfirmacao>
      )}
      {janela === 'adicionar' && <JanelaAdicionar t={t} alunos={alunos} fechar={() => setJanela(null)} adicionou={() => { setJanela(null); setParams({ aba: 'alunos' }, { replace: true }); }} />}
      {janela === 'desativar' && <JanelaDesativarTurmas turmas={[t]} fechar={() => setJanela(null)} confirmar={(data, motivo) => { d({ t: 'desativarTurmas', ids: [t.id], data, motivo }); aviso(`${t.nome} desativada`); nav(lista); }} />}
      {janela === 'remover' && <JanelaRemoverTurma turma={t} fechar={() => setJanela(null)} desativar={(data, motivo) => { d({ t: 'desativarTurmas', ids: [t.id], data, motivo }); aviso(`${t.nome} desativada`); nav(lista); }} apagar={() => { d({ t: 'removerTurma', id: t.id }); aviso(`${t.nome} removida`); nav(lista); }} />}
    </Pagina>
  );
}
