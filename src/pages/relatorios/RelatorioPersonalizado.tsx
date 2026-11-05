import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/store';
import { BarraCaminho, Pagina } from '../../components/Layout';
import { Botao } from '../../components/Botao';
import { CaixaSelecao, CampoSelect, GrupoOpcoes } from '../../components/Campo';
import { EstrelaCheia, Icone } from '../../components/Icone';
import { JanelaAdicionarAtalho, TabelaImpressao, useGerar } from './comum';
import { EditarAtalhosHome } from '../home/Home';
import { gerarRelatorio } from '../../data/relatorios';
import { NOME_MODALIDADE } from '../../data/tipos';
import type { Modalidade } from '../../data/tipos';
import { mesNome } from '../../utils/datas';

const O_QUE = [
  { v: 'frequencia', t: 'Frequência de turma' }, { v: 'ativos', t: 'Alunos' }, { v: 'turmas', t: 'Turmas' }, { v: 'prefeitura', t: 'Prestação de contas' }, { v: 'declaracoes', t: 'Declaração de matrícula' },
];
const INCLUIR = ['Nome e idade', 'Presença por dia', 'Telefone do responsável', 'Espaço para assinatura'];
const POR_MOD: Record<string, Modalidade | undefined> = { Todas: undefined, 'Educação Infantil': 'infantil', Contraturno: 'contraturno', Oficinas: 'oficinas' };

export default function RelatorioPersonalizado() {
  const { s, d, aviso } = useStore();
  const nav = useNavigate();
  const gerar = useGerar();
  const ano = new Date().getFullYear();
  const [tipo, setTipo] = useState('frequencia');
  const [tipoTurma, setTipoTurma] = useState('Oficinas');
  const turmasOp = s.turmas.filter(t => t.ativa && (!POR_MOD[tipoTurma] || t.modalidade === POR_MOD[tipoTurma]));
  const [turmaId, setTurmaId] = useState('teatro');
  const [anoSel, setAnoSel] = useState(String(ano));
  const [semestre, setSemestre] = useState('2º semestre');
  const [mes, setMes] = useState('Todos os meses');
  const [incluir, setIncluir] = useState(['Nome e idade', 'Presença por dia', 'Espaço para assinatura']);
  const [formato, setFormato] = useState<'PDF' | 'Excel'>('PDF');
  const [salvarAtalho, setSalvarAtalho] = useState(false);
  const [editarHome, setEditarHome] = useState(false);
  const turma = turmasOp.find(t => t.id === turmaId) ?? turmasOp[0];
  const periodo = `${mes === 'Todos os meses' ? semestre : mes} de ${anoSel}`;
  const nomeTipo = O_QUE.find(o => o.v === tipo)!.t;
  const params = { tipo, turmaId: turma?.id, periodo, incluir, formato, de: '/relatorios/personalizado', modalidade: tipoTurma === 'Todas' ? 'Todos' : (POR_MOD[tipoTurma] ? NOME_MODALIDADE[POR_MOD[tipoTurma] as Modalidade] : 'Todos') };
  const fixado = s.atalhosHome.includes('personalizado');
  const fixar = () => {
    if (fixado) { d({ t: 'atalhosHome', ids: s.atalhosHome.filter(i => i !== 'personalizado') }); return; }
    if (s.atalhosHome.length >= 3) { setEditarHome(true); return; }
    d({ t: 'atalhosHome', ids: [...s.atalhosHome, 'personalizado'] });
    aviso('Fixado no acesso rápido');
  };
  const previa = gerarRelatorio(params, s.alunos, s.turmas);
  const comTurma = tipo === 'frequencia';
  return (
    <Pagina fixa className="personalizado">
      <BarraCaminho voltar="/relatorios" caminho={[{ nome: 'Relatórios', para: '/relatorios' }, { nome: 'Relatório personalizado' }]}>
        <button type="button" className={`fixar ${fixado ? 'ligado' : ''}`} aria-pressed={fixado} onClick={fixar}>
          {fixado ? <EstrelaCheia /> : <Icone nome="estrela" />}{fixado ? 'Fixado no acesso rápido' : 'Fixar no acesso rápido'}
        </button>
      </BarraCaminho>
      <div className="titulo-bloco nao-imprimir">
        <h1 className="titulo-40">Relatório personalizado</h1>
        <p className="subtitulo-18">Escolha o que você quer ver e baixe o relatório</p>
      </div>
      <div className="personalizado-corpo nao-imprimir">
        <section className="cartao-pers">
          <GrupoOpcoes rotulo="O que você quer ver?" obrigatorio valor={tipo} onChange={setTipo} opcoes={O_QUE} />
          {comTurma && (
            <div className="linha-2 igual">
              <CampoSelect rotulo="Tipo de turma" valor={tipoTurma} onChange={setTipoTurma} opcoes={Object.keys(POR_MOD)} />
              <CampoSelect rotulo="Turma" obrigatorio valor={turma?.id ?? ''} onChange={setTurmaId} opcoes={turmasOp.map(t => ({ v: t.id, t: t.nome }))} />
            </div>
          )}
          <div className="linha-3">
            <CampoSelect rotulo="Ano" obrigatorio valor={anoSel} onChange={setAnoSel} opcoes={[String(ano), String(ano - 1)]} />
            <CampoSelect rotulo="Semestre" obrigatorio valor={semestre} onChange={setSemestre} opcoes={['1º semestre', '2º semestre']} />
            <CampoSelect rotulo="Mês" valor={mes} onChange={setMes} opcoes={['Todos os meses', ...Array.from({ length: 12 }, (_, i) => mesNome(i))]} />
          </div>
          {comTurma && (
            <fieldset className="incluir">
              <legend>Incluir no relatório</legend>
              <div>{INCLUIR.map(i => <CaixaSelecao key={i} rotulo={i} marcada={incluir.includes(i)} onChange={v => setIncluir(v ? [...incluir, i] : incluir.filter(x => x !== i))} />)}</div>
            </fieldset>
          )}
        </section>
        <aside className="seu-relatorio">
          <h2>Seu relatório</h2>
          <dl>
            <div><dt>Relatório</dt><dd>{nomeTipo}</dd></div>
            {comTurma && <div><dt>Turma</dt><dd>{turma?.nome}</dd></div>}
            <div><dt>Período</dt><dd>{periodo}</dd></div>
          </dl>
          <GrupoOpcoes rotulo="Formato do arquivo" valor={formato} onChange={setFormato} opcoes={['PDF', 'Excel']} />
          <div className="seu-acoes">
            <Botao icone="baixar" largo disabled={comTurma && !turma} onClick={() => { gerar(params); nav('/relatorios/pronto'); }}>Baixar relatório</Botao>
            <Botao tipo="secundario" icone="imprimir" largo onClick={() => window.print()}>Imprimir</Botao>
            <Botao tipo="discreto" icone="estrela" largo onClick={() => setSalvarAtalho(true)}>Salvar como atalho</Botao>
          </div>
        </aside>
      </div>
      <div className="area-relatorio"><TabelaImpressao r={previa} /></div>
      {salvarAtalho && <JanelaAdicionarAtalho inicial={tipo === 'ativos' ? 'ativos' : tipo} nomeInicial={nomeTipo} fechar={() => setSalvarAtalho(false)} adicionado={() => nav('/relatorios')} />}
      {editarHome && <EditarAtalhosHome fechar={() => setEditarHome(false)} />}
    </Pagina>
  );
}
