import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store/store';
import { BarraCaminho, Pagina } from '../../components/Layout';
import { Botao } from '../../components/Botao';
import { CaixaSelecao } from '../../components/Campo';
import { CampoBusca, Filtro } from '../../components/Lista';
import { EtiquetaModalidade, EtiquetaStatus } from '../../components/Etiqueta';
import { Icone } from '../../components/Icone';
import { FILTROS, JanelaDesativarTurmas, JanelaRemoverTurma, comTitulo } from './comum';

const plural = (n: number, s: string, p: string) => `${n} ${n === 1 ? s : p}`;
const norm = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function ListaTurmas() {
  const { filtro = 'todos' } = useParams();
  const { s, d, aviso } = useStore();
  const nav = useNavigate();
  const def = FILTROS[filtro] ?? FILTROS.todos;
  const [busca, setBusca] = useState('');
  const [status, setStatus] = useState('Todos');
  const [desc, setDesc] = useState(false);
  const [sel, setSel] = useState<string[]>([]);
  const [janela, setJanela] = useState<'desativar' | 'remover' | null>(null);
  const daModalidade = s.turmas.filter(t => !def.mod || t.modalidade === def.mod);
  const lista = useMemo(() => {
    const l = daModalidade.filter(t => norm(t.nome).includes(norm(busca.trim())) && (status === 'Todos' || (status === 'Ativa') === t.ativa));
    l.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR') * (desc ? -1 : 1));
    return l;
  }, [daModalidade, busca, status, desc]);
  const ativas = daModalidade.filter(t => t.ativa).length;
  const vis = lista.filter(t => sel.includes(t.id));
  const todos = lista.length > 0 && vis.length === lista.length;
  const alvo = s.turmas.filter(t => sel.includes(t.id));
  const trocar = (r: string) => { const k = Object.keys(FILTROS).find(x => FILTROS[x].rotulo === r) ?? 'todos'; setSel([]); nav(`/turmas/lista/${k}`); };
  const limpar = () => { setBusca(''); setStatus('Todos'); setSel([]); if (filtro !== 'todos') nav('/turmas/lista/todos'); };
  const desativar = (data: string, motivo: string) => {
    d({ t: 'desativarTurmas', ids: sel, data, motivo });
    aviso(sel.length === 1 ? `${alvo[0].nome} desativada` : `${sel.length} turmas desativadas`);
    setSel([]); setJanela(null);
  };
  const apagar = () => {
    d({ t: 'removerTurma', id: alvo[0].id });
    aviso(`${alvo[0].nome} removida`);
    setSel([]); setJanela(null);
  };
  const caminho = [{ nome: 'Turmas', para: '/turmas' }, { nome: def.caminho }];
  return (
    <Pagina fixa className="lista-turmas">
      <BarraCaminho voltar="/turmas" caminho={caminho} />
      <div className="linha-titulo">
        <div>
          <h1 className="titulo-40 preto">{def.titulo}</h1>
          <p className="subtitulo-18 preto" aria-live="polite">{plural(daModalidade.length, 'turma cadastrada', 'turmas cadastradas')} · {plural(ativas, 'ativa', 'ativas')}</p>
        </div>
        <Botao icone="adicionar" para={`/turmas/nova?de=${filtro}`}>Adicionar turma</Botao>
      </div>
      <div className="busca-filtros">
        <CampoBusca valor={busca} onChange={setBusca} placeholder="Buscar turma pelo nome" />
        <Filtro rotulo="Modalidade" valor={def.rotulo} padrao="Todas" opcoes={['Todas', 'Ed. Infantil', 'Contraturno', 'Oficinas']} onChange={trocar} />
        <Filtro rotulo="Status" valor={status} padrao="Todos" opcoes={['Todos', 'Ativa', 'Inativa']} onChange={setStatus} />
        <Botao tipo="discreto" onClick={limpar}>Limpar filtros</Botao>
      </div>
      {sel.length > 0 && (
        <div className="faixa-selecao" role="region" aria-label="Ações das selecionadas">
          <strong>{plural(sel.length, 'turma selecionada', 'turmas selecionadas')}</strong>
          {sel.length > 1 && <span className="faixa-dica">Para remover, marque uma turma só.</span>}
          <span className="espaco" />
          <Botao tipo="secundario" icone="arquivar" onClick={() => setJanela('desativar')}>Desativar</Botao>
          <Botao tipo="perigo" className="remover-faixa" icone="lixeira" disabled={sel.length > 1} onClick={() => setJanela('remover')}>Remover</Botao>
          <Botao tipo="discreto" onClick={() => setSel([])}>Cancelar seleção</Botao>
        </div>
      )}
      <div className="tabela-cartao">
        <div className="tabela-rola" tabIndex={0} role="region" aria-label="Lista de turmas">
          <table className="tabela">
            <thead>
              <tr>
                <th className="col-sel"><CaixaSelecao oculto rotulo="Selecionar todas" marcada={todos} parcial={vis.length > 0 && !todos} onChange={v => setSel(v ? [...new Set([...sel, ...lista.map(t => t.id)])] : sel.filter(i => !lista.some(t => t.id === i)))} /></th>
                <th aria-sort={desc ? 'descending' : 'ascending'}><button type="button" className="ordenar" onClick={() => setDesc(!desc)}>Nome da turma <Icone nome="ordenar" tam={15} /></button></th>
                <th style={{ width: 240 }}>Professor</th>
                <th style={{ width: 180 }}>Modalidade</th>
                <th style={{ width: 130 }}>Alunos</th>
                <th style={{ width: 140 }}>Status</th>
                <th style={{ width: 52 }}><span className="sr-only">Abrir turma</span></th>
              </tr>
            </thead>
            <tbody>
              {lista.map(t => (
                <tr key={t.id} className={sel.includes(t.id) ? 'sel' : ''}>
                  <td className="col-sel"><CaixaSelecao oculto rotulo={`Selecionar ${t.nome}`} marcada={sel.includes(t.id)} onChange={v => setSel(v ? [...sel, t.id] : sel.filter(i => i !== t.id))} /></td>
                  <td><Link className="link-nome" to={`/turmas/${t.id}`}>{t.nome}</Link></td>
                  <td>{comTitulo(t.professor)}</td>
                  <td><EtiquetaModalidade m={t.modalidade} /></td>
                  <td>{s.alunos.filter(a => a.turmaIds.includes(t.id)).length} / {t.vagas}</td>
                  <td><EtiquetaStatus status={t.ativa ? 'Ativa' : 'Inativa'} /></td>
                  <td><Link className="seta-linha" to={`/turmas/${t.id}`} aria-label={`Abrir ${t.nome}`}><Icone nome="avancar" tam={18} /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="tabela-rodape">Mostrando {lista.length} de {plural(daModalidade.length, 'turma', 'turmas')}</div>
      </div>
      {janela === 'desativar' && <JanelaDesativarTurmas turmas={alvo} fechar={() => setJanela(null)} confirmar={desativar} />}
      {janela === 'remover' && alvo[0] && <JanelaRemoverTurma turma={alvo[0]} fechar={() => setJanela(null)} desativar={desativar} apagar={apagar} />}
    </Pagina>
  );
}
