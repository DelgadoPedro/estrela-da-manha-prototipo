import { useState } from 'react';
import { Botao } from '../../components/Botao';
import { BotoesJanela, JanelaConfirmacao } from '../../components/Janela';
import { Campo, CampoSelect, GrupoOpcoes } from '../../components/Campo';
import { CATALOGO, gerarRelatorio, tipoDe } from '../../data/relatorios';
import type { ParamsRelatorio } from '../../data/relatorios';
import { useStore } from '../../store/store';
import { hoje, mascaraData, mesNome } from '../../utils/datas';
import type { RelatorioGerado } from '../../data/tipos';

export function TabelaImpressao({ r }: { r: RelatorioGerado }) {
  return (
    <div className="relatorio-impresso">
      <h1>{r.titulo}</h1>
      <p>{r.detalhe}</p>
      <table>
        <thead><tr>{r.colunas.map(c => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>{r.linhas.map((l, i) => <tr key={i}>{l.map((v, j) => <td key={j}>{v}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

/** Janelas de gerar relatório, abertas pelos atalhos. */
export function JanelaGerar({ tipo, fechar, gerar }: { tipo: string; fechar: () => void; gerar: (p: ParamsRelatorio) => void }) {
  const { s } = useStore();
  const agora = new Date();
  const ano = agora.getFullYear();
  const estaMes = `Este mês (${mesNome(agora.getMonth())})`;
  const mesPassado = `Mês passado (${mesNome((agora.getMonth() + 11) % 12)})`;
  const turmas = s.turmas.filter(t => t.ativa);
  const [turmaId, setTurmaId] = useState(turmas.find(t => t.id === 'teatro')?.id ?? turmas[0]?.id ?? '');
  const [mes, setMes] = useState(estaMes);
  const [outraData, setOutraData] = useState('');
  const [quando, setQuando] = useState(`Hoje (${hoje()})`);
  const [tipoTurma, setTipoTurma] = useState('Todos');
  const [anoSel, setAnoSel] = useState(String(ano));
  const [semestre, setSemestre] = useState('2º semestre');
  const [campanha, setCampanha] = useState(`Natal ${ano}`);
  const [periodo, setPeriodo] = useState('Trimestre');
  const [trimestre, setTrimestre] = useState(`3º trimestre de ${ano} (jul a set)`);
  const titulos: Record<string, [string, string, string]> = {
    frequencia: ['Gerar frequência de turma', 'Escolha a turma e o mês da lista de presença.', 'chamada'],
    ativos: ['Gerar lista de alunos ativos', 'Escolha a data e o tipo de turma que entram na lista.', 'alunos'],
    turmas: ['Gerar lista de turmas', 'Escolha o ano e o semestre das turmas.', 'turmas'],
    natal: ['Gerar relatório da Operação Natal', 'Escolha o ano da campanha.', 'presente'],
    prefeitura: ['Gerar prestação de contas', 'Escolha o período que a Prefeitura pediu.', 'prefeitura'],
  };
  const cat = tipoDe(tipo);
  const [tit, sub] = titulos[tipo] ?? [`Gerar ${cat.nome.toLowerCase()}`, undefined];
  const enviar = () => {
    let p = '';
    if (tipo === 'frequencia') p = mes === 'Escolher outro mês' ? outraData || mes : mes.replace(/^.*\((.*)\)$/, '$1') + ` de ${ano}`;
    if (tipo === 'ativos') p = quando.startsWith('Hoje') ? hoje() : quando === 'Início do semestre' ? `01/07/${ano}` : outraData;
    if (tipo === 'turmas' || tipo === 'oficinas') p = `${semestre} de ${anoSel}`;
    if (tipo === 'natal') p = campanha;
    if (tipo === 'prefeitura') p = periodo === 'Trimestre' ? trimestre : `${periodo} de ${ano}`;
    gerar({ tipo, turmaId, periodo: p, modalidade: tipoTurma, de: '/relatorios' });
  };
  return (
    <JanelaConfirmacao titulo={tit} texto={sub} icone={cat.icone} fechar={fechar} largura={720}>
      <div className="pilha">
        {tipo === 'frequencia' && <>
          <CampoSelect rotulo="Turma" obrigatorio valor={turmaId} onChange={setTurmaId} opcoes={turmas.map(t => ({ v: t.id, t: t.nome }))} />
          <GrupoOpcoes rotulo="Mês" obrigatorio valor={mes} onChange={setMes} opcoes={[estaMes, mesPassado, 'Escolher outro mês']} />
          {mes === 'Escolher outro mês' && <Campo rotulo="Qual mês?" valor={outraData} onChange={setOutraData} />}
        </>}
        {tipo === 'ativos' && <>
          <GrupoOpcoes rotulo="Alunos ativos em" obrigatorio valor={quando} onChange={setQuando} opcoes={[`Hoje (${hoje()})`, 'Início do semestre', 'Escolher outra data']} />
          {quando === 'Escolher outra data' && <Campo rotulo="Qual data?" valor={outraData} onChange={setOutraData} mascara={mascaraData} placeholder="dd/mm/aaaa" />}
          <GrupoOpcoes rotulo="Tipo de turma" obrigatorio valor={tipoTurma} onChange={setTipoTurma} opcoes={['Todos', 'Educação Infantil', 'Contraturno', 'Oficinas']} />
        </>}
        {(tipo === 'turmas' || tipo === 'oficinas') && <>
          <GrupoOpcoes rotulo="Ano" obrigatorio valor={anoSel} onChange={setAnoSel} opcoes={[String(ano), String(ano - 1)]} />
          <GrupoOpcoes rotulo="Semestre" obrigatorio valor={semestre} onChange={setSemestre} opcoes={['1º semestre', '2º semestre', 'Ano todo']} />
        </>}
        {tipo === 'natal' && <>
          <GrupoOpcoes rotulo="Campanha" obrigatorio valor={campanha} onChange={setCampanha} opcoes={[`Natal ${ano}`, `Natal ${ano - 1}`]} />
          <p className="nota-janela">O relatório traz as crianças da campanha e as famílias que vão retirar os presentes.</p>
        </>}
        {tipo === 'prefeitura' && <>
          <GrupoOpcoes rotulo="Período" obrigatorio valor={periodo} onChange={setPeriodo} opcoes={['Mês', 'Trimestre', 'Semestre', 'Ano']} />
          {periodo === 'Trimestre' && <CampoSelect rotulo="Qual trimestre?" obrigatorio valor={trimestre} onChange={setTrimestre} opcoes={[`1º trimestre de ${ano} (jan a mar)`, `2º trimestre de ${ano} (abr a jun)`, `3º trimestre de ${ano} (jul a set)`, `4º trimestre de ${ano} (out a dez)`]} />}
        </>}
      </div>
      <BotoesJanela>
        <Botao tipo="secundario" largo icone="voltar" onClick={fechar}>Voltar</Botao>
        <Botao largo icone="documento" onClick={enviar}>Gerar relatório</Botao>
      </BotoesJanela>
    </JanelaConfirmacao>
  );
}

const OP_NOVOS = () => CATALOGO.map(c => ({ v: c.tipo, t: c.nome }));

export function JanelaAdicionarAtalho({ fechar, inicial, nomeInicial, adicionado }: { fechar: () => void; inicial?: string; nomeInicial?: string; adicionado?: () => void }) {
  const { s, d, aviso } = useStore();
  const opcoes = OP_NOVOS().filter(o => !s.atalhosRel.some(a => a.tipo === o.v) || o.v === inicial);
  const [tipo, setTipo] = useState(inicial ?? opcoes[0]?.v ?? '');
  const [nome, setNome] = useState(nomeInicial ?? (opcoes[0] ? tipoDe(opcoes[0].v).nome : ''));
  return (
    <JanelaConfirmacao titulo="Adicionar atalho" texto="Escolha o relatório que vai ficar nesta tela." icone="adicionar" fechar={fechar} largura={720}>
      <div className="pilha">
        <GrupoOpcoes rotulo="Qual relatório?" obrigatorio valor={tipo} opcoes={opcoes} onChange={v => { setTipo(v); setNome(tipoDe(v).nome); }} />
        <Campo rotulo="Nome no atalho" obrigatorio valor={nome} onChange={setNome} />
      </div>
      <BotoesJanela>
        <Botao tipo="secundario" largo icone="voltar" onClick={fechar}>Voltar</Botao>
        <Botao largo icone="adicionar" disabled={!tipo || !nome.trim()} onClick={() => {
          d({ t: 'atalhosRel', lista: [...s.atalhosRel, { id: `${tipo}-${Date.now()}`, nome: nome.trim(), tipo }] });
          aviso('Atalho adicionado');
          (adicionado ?? fechar)();
        }}>Adicionar atalho</Botao>
      </BotoesJanela>
    </JanelaConfirmacao>
  );
}

export function useGerar() {
  const { s, d } = useStore();
  return (p: ParamsRelatorio) => { const r = gerarRelatorio(p, s.alunos, s.turmas); d({ t: 'relatorio', relatorio: r }); return r; };
}
