import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useStore } from '../../store/store';
import { BarraCaminho, Pagina } from '../../components/Layout';
import { Botao } from '../../components/Botao';
import { CaixaSelecao } from '../../components/Campo';
import { CampoBusca, Filtro } from '../../components/Lista';
import { EtiquetaModalidade, EtiquetaStatus } from '../../components/Etiqueta';
import { Icone } from '../../components/Icone';
import { JanelaDesativar, JanelaRemover, turmaPrincipal } from './comum';
import { hoje } from '../../utils/datas';
import { CURTO_MODALIDADE } from '../../data/tipos';
import type { Aluno } from '../../data/tipos';

const plural = (n: number, s: string, p: string) => `${n} ${n === 1 ? s : p}`;

export default function ListaAlunos() {
  const { s, d, aviso } = useStore();
  const [params] = useSearchParams();
  const [busca, setBusca] = useState('');
  const [modalidade, setModalidade] = useState('Todas');
  const [turma, setTurma] = useState('Todas');
  const [status, setStatus] = useState('Todos');
  const [desc, setDesc] = useState(false);
  const [sel, setSel] = useState<string[]>([]);
  const [janela, setJanela] = useState<'desativar' | 'remover' | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  const procurar = params.get('procurar');
  useEffect(() => { if (procurar) ref.current?.focus(); }, [procurar]);

  const linhaTurma = (a: Aluno) => turmaPrincipal(a, s.turmas)?.curto ?? 'Sem turma';
  const nomesTurma = useMemo(() => ['Todas', ...new Set(s.alunos.map(linhaTurma))].sort((a, b) => (a === 'Todas' ? -1 : b === 'Todas' ? 1 : a.localeCompare(b, 'pt-BR'))), [s.alunos, s.turmas]);
  const norm = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const lista = useMemo(() => {
    const l = s.alunos.filter(a =>
      norm(a.nome).includes(norm(busca.trim())) &&
      (modalidade === 'Todas' || CURTO_MODALIDADE[a.modalidade] === modalidade) &&
      (turma === 'Todas' || linhaTurma(a) === turma) &&
      (status === 'Todos' || a.status === status));
    l.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR') * (desc ? -1 : 1));
    return l;
  }, [s.alunos, busca, modalidade, turma, status, desc]);

  const ativos = s.alunos.filter(a => a.status === 'Ativo').length;
  const q = busca.trim();
  const titulo = q ? `${plural(lista.length, 'aluno encontrado', 'alunos encontrados')} para “${q}”` : `${plural(s.alunos.length, 'aluno cadastrado', 'alunos cadastrados')} · ${plural(ativos, 'ativo', 'ativos')}`;
  const visiveisSel = lista.filter(a => sel.includes(a.id));
  const todos = lista.length > 0 && visiveisSel.length === lista.length;
  const parcial = visiveisSel.length > 0 && !todos;
  const alvo = s.alunos.filter(a => sel.includes(a.id));
  const limpar = () => { setBusca(''); setModalidade('Todas'); setTurma('Todas'); setStatus('Todos'); };

  const desativar = (data: string, motivo: string) => {
    d({ t: 'desativarAlunos', ids: sel, data, motivo });
    aviso(`${plural(sel.length, 'aluno desativado', 'alunos desativados')}`);
    setJanela(null); setSel([]);
  };
  const remover = () => {
    d({ t: 'removerAlunos', ids: sel });
    aviso(`${plural(sel.length, 'aluno removido', 'alunos removidos')}`);
    setJanela(null); setSel([]);
  };
  const destino = (a: Aluno) => (a.rascunho ? `/alunos/matricula/${a.modalidade}?rascunho=${a.id}` : `/alunos/${a.id}`);

  return (
    <Pagina fixa className="lista-alunos">
      <BarraCaminho voltar="/" />
      <div className="linha-titulo">
        <div>
          <h1 className="titulo-36">Alunos</h1>
          <p className="subtitulo-16" aria-live="polite">{titulo}</p>
        </div>
        <Botao icone="adicionar" para="/alunos/matricula">Adicionar aluno</Botao>
      </div>
      <div className="busca-filtros">
        <CampoBusca inputRef={ref} valor={busca} onChange={setBusca} placeholder="Buscar aluno pelo nome" />
        <Filtro rotulo="Modalidade" valor={modalidade} padrao="Todas" opcoes={['Todas', 'Ed. Infantil', 'Contraturno', 'Oficinas']} onChange={setModalidade} />
        <Filtro rotulo="Turma" valor={turma} padrao="Todas" opcoes={nomesTurma} onChange={setTurma} />
        <Filtro rotulo="Status" valor={status} padrao="Todos" opcoes={['Todos', 'Ativo', 'Pendente', 'Inativo']} onChange={setStatus} />
        <Botao tipo="discreto" onClick={limpar}>Limpar filtros</Botao>
      </div>
      {sel.length > 0 && (
        <div className="faixa-selecao" role="region" aria-label="Ações dos selecionados">
          <strong>{plural(sel.length, 'aluno selecionado', 'alunos selecionados')}</strong>
          <span className="espaco" />
          <Botao tipo="secundario" icone="arquivar" onClick={() => setJanela('desativar')}>Desativar</Botao>
          <Botao tipo="perigo" icone="lixeira" onClick={() => setJanela('remover')}>Remover</Botao>
          <Botao tipo="discreto" onClick={() => setSel([])}>Cancelar seleção</Botao>
        </div>
      )}
      <div className="tabela-cartao">
        <div className="tabela-rola" tabIndex={0} role="region" aria-label="Lista de alunos">
          <table className="tabela tabela-alunos">
            <thead>
              <tr>
                <th className="col-sel"><CaixaSelecao oculto rotulo="Selecionar todos" marcada={todos} parcial={parcial} onChange={v => setSel(v ? [...new Set([...sel, ...lista.map(a => a.id)])] : sel.filter(i => !lista.some(a => a.id === i)))} /></th>
                <th aria-sort={desc ? 'descending' : 'ascending'}><button type="button" className="ordenar" onClick={() => setDesc(!desc)}>Nome <Icone nome="ordenar" tam={15} /></button></th>
                <th style={{ width: 220 }}>Modalidade</th>
                <th style={{ width: 180 }}>Turma</th>
                <th style={{ width: 150 }}>Status</th>
                <th style={{ width: 52 }}><span className="sr-only">Abrir ficha</span></th>
              </tr>
            </thead>
            <tbody>
              {lista.map(a => (
                <tr key={a.id} className={sel.includes(a.id) ? 'sel' : ''}>
                  <td className="col-sel"><CaixaSelecao oculto rotulo={`Selecionar ${a.nome}`} marcada={sel.includes(a.id)} onChange={v => setSel(v ? [...sel, a.id] : sel.filter(i => i !== a.id))} /></td>
                  <td><Link className="link-nome" to={destino(a)}>{a.nome}</Link></td>
                  <td><EtiquetaModalidade m={a.modalidade} /></td>
                  <td>{linhaTurma(a)}</td>
                  <td><EtiquetaStatus status={a.status} /></td>
                  <td><Link className="seta-linha" to={destino(a)} aria-label={`Abrir ficha de ${a.nome}`}><Icone nome="avancar" tam={18} /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="tabela-rodape">
          Mostrando {lista.length} de {plural(s.alunos.length, 'aluno', 'alunos')}
          {busca && <> · <button type="button" className="link-texto" onClick={() => setBusca('')}>Limpar busca</button></>}
        </div>
      </div>
      {janela === 'desativar' && <JanelaDesativar alunos={alvo} turmas={s.turmas} fechar={() => setJanela(null)} confirmar={desativar} />}
      {janela === 'remover' && <JanelaRemover alunos={alvo} turmas={s.turmas} fechar={() => setJanela(null)} confirmar={remover} desativar={() => desativar(hoje(), 'Não informado')} />}
    </Pagina>
  );
}
