import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { novoId, useStore } from '../../store/store';
import { BarraCaminho, Pagina } from '../../components/Layout';
import { Botao } from '../../components/Botao';
import { CaixaSelecao, Campo, CampoSelect, GrupoOpcoes } from '../../components/Campo';
import { IndicadorEtapas, SalvoAuto } from '../../components/Lista';
import { EtiquetaModalidade } from '../../components/Etiqueta';
import { NOME_MODALIDADE } from '../../data/tipos';
import type { DadosForm, Modalidade } from '../../data/tipos';
import { dataValida, idade, idadeTexto, mascaraData, mascaraTelefone } from '../../utils/datas';
import { CORES, ESCOLARIDADE, ESTADO_CIVIL, ETAPAS_CONTRATURNO, ETAPAS_INFANTIL, PARENTESCOS, autorizadosAuto, familiaAuto, formInicial, montarAluno, parentescoResp, reais, rendaFamilia } from './matriculaDados';
import { linhaIrmao } from './comum';

// TODO(design): o Figma não mostra os erros da matrícula. Mensagens curtas e provisórias.
const OBRIG = 'Preencha este campo.';
const ESCOLHA = 'Escolha uma opção.';
const SN = ['Sim', 'Não'];

/** Recria o formulário ao trocar de modalidade ou de rascunho. */
export default function FormularioMatricula() {
  const { modalidade = 'infantil' } = useParams();
  const [params] = useSearchParams();
  return <Formulario key={`${modalidade}-${params.get('rascunho') ?? ''}`} />;
}

function Formulario() {
  const { modalidade = 'infantil' } = useParams();
  const mod = modalidade as Modalidade;
  const infantil = mod === 'infantil';
  const { s, d: dispatch, aviso } = useStore();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const rascunhoId = params.get('rascunho');
  const etapas = infantil ? ETAPAS_INFANTIL : ETAPAS_CONTRATURNO;
  const inicio = () => {
    const r = rascunhoId ? s.alunos.find(a => a.id === rascunhoId)?.rascunho : undefined;
    if (r) return { etapa: r.etapa, dados: r.dados as DadosForm };
    if (s.andamento?.modalidade === mod && !s.andamento.alunoId) return { etapa: s.andamento.etapa, dados: s.andamento.dados };
    return { etapa: 1, dados: formInicial(mod) };
  };
  const [{ etapa, dados: f }, setTudo] = useState(inicio);
  const [erros, setErros] = useState<Record<string, string>>({});
  const setEtapa = (n: number) => { setTudo(x => ({ ...x, etapa: n })); setErros({}); window.scrollTo(0, 0); };
  const set = (k: string, v: unknown) => { setTudo(x => ({ ...x, dados: { ...x.dados, [k]: v } })); setErros(e => (e[k] ? { ...e, [k]: '' } : e)); };
  const setV = (o: DadosForm) => setTudo(x => ({ ...x, dados: { ...x.dados, ...o } }));
  useEffect(() => { if (!rascunhoId) dispatch({ t: 'andamento', andamento: { modalidade: mod, etapa, dados: f } }); }, [etapa, f]);

  // Campos reutilizados
  const T = (k: string, rotulo: string, o: { obrigatorio?: boolean; pendente?: boolean; mascara?: (v: string) => string; ajuda?: string; className?: string } = {}) =>
    <Campo rotulo={rotulo} valor={f[k] ?? ''} onChange={v => set(k, v)} erro={erros[k]} {...o} />;
  const S = (k: string, rotulo: string, opcoes: string[], o: { obrigatorio?: boolean; className?: string } = {}) =>
    <CampoSelect rotulo={rotulo} valor={f[k] ?? ''} onChange={v => set(k, v)} opcoes={opcoes} vazio="" erro={erros[k]} {...o} />;
  const O = (k: string, rotulo: string, opcoes: (string | { v: string; t: string; disabled?: boolean })[], o: { obrigatorio?: boolean; varias?: boolean; className?: string } = {}) =>
    <GrupoOpcoes rotulo={rotulo} valor={f[k] ?? (o.varias ? [] : '')} onChange={v => set(k, v)} opcoes={opcoes} erro={erros[k]} {...o} />;
  const SimQual = (k: string, rotulo: string, qualRotulo = 'Qual ou quais?') => (
    <div className="pergunta" key={k}>
      {O(k, rotulo, SN)}
      {f[k] === 'Sim' && T(`${k}Qual`, qualRotulo, { obrigatorio: true })}
    </div>
  );
  const Check = (k: string, rotulo: string) => <CaixaSelecao marcada={!!f[k]} onChange={v => set(k, v)} rotulo={rotulo} />;
  const ajudaIdade = (k: string) => { const i = idade(f[k]); return i !== null ? `${idadeTexto(f[k])}.` : undefined; };

  const irmao = f.temIrmao === 'Sim' ? s.alunos.find(a => a.id === f.irmaoId) : undefined;
  const opcoesIrmao = s.alunos.filter(a => a.status !== 'Pendente').map(a => ({ v: a.id, t: linhaIrmao(a, s.turmas) }));
  const artigo = irmao?.sexo === 'Feminino' ? 'da' : irmao?.sexo === 'Masculino' ? 'do' : 'de';
  const usarMesmos = (marcar: boolean) => {
    const r = irmao?.responsaveis[0];
    if (!marcar || !irmao || !r) { set('usarMesmos', marcar); return; }
    const pd = irmao.matricula?.dados ?? {};
    if (infantil) {
      setV({ usarMesmos: true, maeNome: r.nome, maeParentesco: PARENTESCOS.includes(r.parentesco) ? r.parentesco : 'Outro', maeTel: r.telefone, maeRG: pd.maeRG ?? '', maeCPF: pd.maeCPF ?? '', maeNasc: pd.maeNasc ?? '', endereco: f.endereco || irmao.endereco });
    } else {
      setV({ usarMesmos: true, respNome: r.nome, respParentesco: ['Mãe', 'Pai'].includes(r.parentesco) ? r.parentesco : 'Outro', respParentescoQual: ['Mãe', 'Pai'].includes(r.parentesco) ? '' : r.parentesco, respTel: r.telefone, endereco: f.endereco || irmao.endereco });
    }
  };
  const blocoIrmao = (
    <>
      {O('temIrmao', 'Tem irmão ou irmã matriculado na ONG?', SN)}
      {f.temIrmao === 'Sim' && (
        <div className="bloco-irmao">
          <CampoSelect rotulo="Irmão ou irmã" obrigatorio valor={f.irmaoId} vazio="" erro={erros.irmaoId} opcoes={opcoesIrmao} onChange={v => setV({ irmaoId: v, usarMesmos: false })} className="meia" />
          {irmao && <CaixaSelecao marcada={!!f.usarMesmos} onChange={usarMesmos} rotulo={`Usar os mesmos responsáveis ${artigo} ${irmao.nome.split(' ')[0]}`} />}
        </div>
      )}
      <hr className="divisoria" />
    </>
  );
  const turmasMod = s.turmas.filter(t => t.modalidade === mod && t.ativa);
  const opcoesTurma = turmasMod.map(t => {
    const livres = t.vagas - s.alunos.filter(a => a.turmaIds.includes(t.id)).length;
    return { v: t.id, t: `${t.curto} · ${livres > 0 ? `${livres} ${livres === 1 ? 'vaga' : 'vagas'}` : 'sem vagas'}`, disabled: livres <= 0 };
  });

  // Validação por etapa
  const validar = () => {
    const e: Record<string, string> = {};
    const req = (k: string, msg = OBRIG) => { const v = f[k]; if (!v || (Array.isArray(v) && !v.length) || (typeof v === 'string' && !v.trim())) e[k] = msg; };
    const data = (k: string) => { if (f[k] && !dataValida(f[k])) e[k] = 'Escreva a data no formato dd/mm/aaaa.'; };
    if (infantil) {
      if (etapa === 1) { req('nome'); req('sexo', ESCOLHA); req('nascimento'); data('nascimento'); }
      if (etapa === 2) { if (f.temIrmao === 'Sim') req('irmaoId', ESCOLHA); req('maeNome'); req('maeParentesco', ESCOLHA); req('maeTel'); data('maeNasc'); }
      if (etapa === 3 && f.paiInfo === 'Sim') { req('paiNome'); data('paiNasc'); }
      if (etapa === 4) req('endereco');
      if (etapa === 5) for (const k of ['deficiencia', 'restricao', 'medicamento', 'alergia', 'cirurgia', 'problema']) if (f[k] === 'Sim') req(`${k}Qual`);
      if (etapa === 6) { req('edfisica', ESCOLHA); req('fluor', ESCOLHA); req('imagem', ESCOLHA); req('turma', ESCOLHA); req('dataMatricula'); data('dataMatricula'); }
    } else {
      if (etapa === 1) { req('nome'); req('nascimento'); data('nascimento'); req('endereco'); req('estuda', ESCOLHA); if (f.estuda === 'Sim') { req('escola'); req('serie'); } }
      if (etapa === 2) { if (f.temIrmao === 'Sim') req('irmaoId', ESCOLHA); req('respParentesco', ESCOLHA); if (f.respParentesco === 'Outro') req('respParentescoQual'); req('respNome'); req('respTel'); data('respNasc'); }
      if (etapa === 3 && f.beneficios.includes('Outros')) req('beneficiosQual');
      if (etapa === 4) for (const k of ['deficiencia', 'aprendizagem', 'alergia', 'medicamento']) if (f[k] === 'Sim') req(`${k}Qual`);
      if (etapa === 5) { req('cursos', ESCOLHA); if (f.cursos.includes('Outros')) req('cursosQual'); req('sozinho', ESCOLHA); req('imagem', ESCOLHA); req('respAssina', ESCOLHA); req('turma', ESCOLHA); req('dataMatricula'); data('dataMatricula'); }
    }
    setErros(e);
    if (Object.keys(e).length) {
      requestAnimationFrame(() => (document.querySelector('.form-matricula [aria-invalid="true"] input, .form-matricula input[aria-invalid="true"], .form-matricula select[aria-invalid="true"]') as HTMLElement | null)?.focus());
      return false;
    }
    return true;
  };
  const avancar = () => { if (validar()) setEtapa(etapa + 1); };
  const concluir = () => {
    if (!validar()) return;
    const id = rascunhoId ?? novoId(f.nome, s.alunos);
    const base = rascunhoId ? s.alunos.find(a => a.id === rascunhoId) : undefined;
    const aluno = montarAluno(f, id, s.proximaMatricula, 'Ativo', etapa, base);
    dispatch({ t: 'concluirMatricula', aluno, irmaoId: f.temIrmao === 'Sim' ? f.irmaoId : undefined });
    dispatch({ t: 'andamento', andamento: null });
    nav(`/alunos/${id}/concluida`);
  };
  const salvarDepois = () => {
    const id = rascunhoId ?? novoId(f.nome || 'matricula', s.alunos);
    dispatch({ t: 'salvarAluno', aluno: montarAluno(f, id, s.proximaMatricula, 'Pendente', etapa, s.alunos.find(a => a.id === id)) });
    dispatch({ t: 'andamento', andamento: null });
    aviso(`Matrícula de ${f.nome || 'criança sem nome'} guardada como pendente`);
    nav('/alunos');
  };

  // Tabelas
  const familia = familiaAuto(f, irmao);
  const addFam = () => set('familiaExtra', [...f.familiaExtra, { parentesco: '', nome: '', idade: '', esc: '', oc: '' }]);
  const setFam = (i: number, k: string, v: string) => set('familiaExtra', f.familiaExtra.map((x: DadosForm, j: number) => (j === i ? { ...x, [k]: v } : x)));
  const tabelaFamilia = (
    <>
      <div className="tabela-simples"><table>
        <thead><tr><th>Parentesco</th><th>Nome</th><th>Idade</th><th>Escolaridade</th>{infantil && <th>Ocupação</th>}</tr></thead>
        <tbody>
          {familia.map(x => <tr key={x.nome}><td>{x.parentesco}</td><td>{x.nome}</td><td>{x.idade}</td><td>{x.esc}</td>{infantil && <td>{x.oc}</td>}</tr>)}
          {f.familiaExtra.map((x: DadosForm, i: number) => (
            <tr key={i} className="linha-editavel">
              <td><input aria-label="Parentesco" value={x.parentesco} onChange={e => setFam(i, 'parentesco', e.target.value)} /></td>
              <td><input aria-label="Nome" value={x.nome} onChange={e => setFam(i, 'nome', e.target.value)} /></td>
              <td><input aria-label="Idade" value={x.idade} onChange={e => setFam(i, 'idade', e.target.value.replace(/\D/g, ''))} /></td>
              <td><input aria-label="Escolaridade" value={x.esc} onChange={e => setFam(i, 'esc', e.target.value)} /></td>
              {infantil && <td><input aria-label="Ocupação" value={x.oc} onChange={e => setFam(i, 'oc', e.target.value)} /></td>}
            </tr>
          ))}
        </tbody>
      </table></div>
      <div><Botao tipo="secundario" icone="adicionar" onClick={addFam}>Adicionar pessoa</Botao></div>
    </>
  );
  const autos = autorizadosAuto(f);
  const totalAut = autos.length + f.autorizadosExtra.length;
  const setAut = (i: number, k: string, v: string) => set('autorizadosExtra', f.autorizadosExtra.map((x: DadosForm, j: number) => (j === i ? { ...x, [k]: k === 'telefone' ? mascaraTelefone(v) : v } : x)));
  const tabelaAut = (
    <div className="bloco">
      <p className="rotulo-solto">Pessoas autorizadas a buscar a criança (até 4)</p>
      <div className="tabela-simples"><table>
        <thead><tr><th style={{ width: 56 }}>Nº</th><th>Nome</th><th style={{ width: 170 }}>Parentesco</th><th style={{ width: 185 }}>Telefone</th></tr></thead>
        <tbody>
          {autos.map((x, i) => <tr key={x.nome}><td>{i + 1}</td><td>{x.nome}</td><td>{x.parentesco}</td><td>{x.telefone}</td></tr>)}
          {f.autorizadosExtra.map((x: DadosForm, i: number) => (
            <tr key={i} className="linha-editavel">
              <td>{autos.length + i + 1}</td>
              <td><input aria-label={`Nome da pessoa ${autos.length + i + 1}`} value={x.nome} onChange={e => setAut(i, 'nome', e.target.value)} /></td>
              <td><input aria-label={`Parentesco da pessoa ${autos.length + i + 1}`} value={x.parentesco} onChange={e => setAut(i, 'parentesco', e.target.value)} /></td>
              <td><input aria-label={`Telefone da pessoa ${autos.length + i + 1}`} value={x.telefone} onChange={e => setAut(i, 'telefone', e.target.value)} /></td>
            </tr>
          ))}
        </tbody>
      </table></div>
      <div><Botao tipo="secundario" icone="adicionar" disabled={totalAut >= 4} onClick={() => set('autorizadosExtra', [...f.autorizadosExtra, { nome: '', parentesco: '', telefone: '' }])}>Adicionar pessoa</Botao></div>
    </div>
  );
  const blocoMatricula = (
    <>
      <hr className="divisoria" />
      <h3 className="subtitulo-form">Matrícula</h3>
      {O('turma', 'Turma', opcoesTurma, { obrigatorio: true })}
      <div className="grade-2">
        {T('dataMatricula', 'Data da matrícula', { obrigatorio: true, mascara: mascaraData })}
        <Campo rotulo="Responsável pela matrícula" valor={f.responsavelMatricula} soLeitura />
      </div>
    </>
  );

  const conteudoInfantil = () => {
    const pessoa = (p: string, comParentesco: boolean) => (
      <div className="grade-2">
        {T(`${p}Nome`, 'Nome', { obrigatorio: true })}
        {comParentesco ? S('maeParentesco', 'Parentesco', PARENTESCOS, { obrigatorio: true }) : T('paiNasc', 'Data de nascimento', { mascara: mascaraData, ajuda: ajudaIdade('paiNasc') })}
        {comParentesco && T('maeNasc', 'Data de nascimento', { mascara: mascaraData, ajuda: ajudaIdade('maeNasc') })}
        {T(`${p}Tel`, 'Telefone para contato', { obrigatorio: comParentesco, mascara: mascaraTelefone })}
        {T(`${p}RG`, 'RG')}
        {T(`${p}CPF`, 'CPF', { pendente: comParentesco })}
        {S(`${p}EC`, 'Estado civil', ESTADO_CIVIL)}
        {S(`${p}Esc`, 'Escolaridade', ESCOLARIDADE)}
        {O(`${p}Cor`, 'Cor/Raça', CORES, { className: 'largura-toda' })}
        {T(`${p}Prof`, 'Profissão')}
        {T(`${p}Local`, 'Local de trabalho')}
        {T(`${p}Hor`, 'Horário de trabalho')}
        {T(`${p}Renda`, 'Renda (R$)')}
        <div className="marcas largura-toda">{Check(`${p}Emerg`, 'É contato de emergência')}{Check(`${p}Busca`, 'Pode buscar a criança')}</div>
      </div>
    );
    switch (etapa) {
      case 1: return (
        <div className="grade-2">
          {T('nome', 'Nome da criança', { obrigatorio: true, className: 'largura-toda' })}
          {O('sexo', 'Sexo', ['Feminino', 'Masculino'], { obrigatorio: true })}
          {T('nascimento', 'Data de nascimento', { obrigatorio: true, mascara: mascaraData, ajuda: ajudaIdade('nascimento') })}
          {T('sus', 'Cartão SUS', { pendente: true })}
          {T('registro', 'Nº do registro de nascimento')}
          {O('cor', 'Cor/Raça', CORES, { className: 'largura-toda' })}
        </div>
      );
      case 2: return <>{blocoIrmao}{pessoa('mae', true)}</>;
      case 3: return <>{O('paiInfo', 'Preencher os dados do pai?', ['Sim', 'Não informar'])}{f.paiInfo === 'Sim' && <><hr className="divisoria" />{pessoa('pai', false)}</>}</>;
      case 4: return (
        <>
          {T('endereco', 'Endereço', { obrigatorio: true })}
          <p className="rotulo-solto">Composição familiar e situação socioeconômica</p>
          {tabelaFamilia}
          <p className="renda-familia">Renda da família: R$ {reais(rendaFamilia(f))}</p>
        </>
      );
      case 5: return (
        <>
          <div className="meia">{T('ubs', 'UBS/USF utilizada')}</div>
          <div className="grade-2 perguntas">
            {SimQual('deficiencia', 'A criança tem alguma deficiência?')}
            {O('convulsao', 'Tem ou teve crise convulsiva?', SN)}
            {SimQual('restricao', 'Tem restrição alimentar?')}
            {SimQual('medicamento', 'Toma medicamento de forma contínua?')}
            {SimQual('alergia', 'Tem alergia?')}
            {SimQual('cirurgia', 'Já fez alguma cirurgia?')}
            {SimQual('problema', 'Tem algum problema de saúde?')}
          </div>
        </>
      );
      default: return (
        <>
          {tabelaAut}
          {T('observacoes', 'Observações')}
          <hr className="divisoria" />
          <h3 className="subtitulo-form">Autorizações</h3>
          <div className="grade-2">
            {O('edfisica', 'Educação física', SN, { obrigatorio: true })}
            {O('fluor', 'Aplicação tópica de flúor', SN, { obrigatorio: true })}
          </div>
          {O('imagem', 'Uso de imagem para divulgar as atividades da ONG', SN, { obrigatorio: true })}
          {blocoMatricula}
        </>
      );
    }
  };
  const conteudoContraturno = () => {
    switch (etapa) {
      case 1: return (
        <div className="grade-2">
          {T('nome', 'Nome da criança', { obrigatorio: true, className: 'largura-toda' })}
          {T('nascimento', 'Data de nascimento', { obrigatorio: true, mascara: mascaraData, ajuda: ajudaIdade('nascimento') })}
          {T('rg', 'RG')}
          {T('cpf', 'CPF', { pendente: true })}
          {T('endereco', 'Endereço', { obrigatorio: true })}
          {O('estuda', 'A criança estuda?', SN, { obrigatorio: true, className: 'largura-toda' })}
          {f.estuda === 'Sim' && T('escola', 'Em qual escola?', { obrigatorio: true })}
          {f.estuda === 'Sim' && T('serie', 'Série', { obrigatorio: true })}
        </div>
      );
      case 2: return (
        <>
          {blocoIrmao}
          {O('respParentesco', 'Grau de parentesco', ['Mãe', 'Pai', 'Outro'], { obrigatorio: true })}
          {f.respParentesco === 'Outro' && <div className="meia">{T('respParentescoQual', 'Qual?', { obrigatorio: true })}</div>}
          <div className="grade-2">
            {T('respNome', 'Nome', { obrigatorio: true, className: 'largura-toda' })}
            {T('respNasc', 'Data de nascimento', { mascara: mascaraData, ajuda: ajudaIdade('respNasc') })}
            {T('respTel', 'Telefone', { obrigatorio: true, mascara: mascaraTelefone })}
            {T('respRecado', 'Recado com')}
            {T('respRG', 'RG')}
            {T('respCPF', 'CPF', { pendente: true })}
            {T('respProf', 'Profissão')}
            {T('respLocal', 'Local de trabalho')}
            {T('respHor', 'Horário de trabalho')}
            <div className="marcas largura-toda">{Check('respEmerg', 'É contato de emergência')}{Check('respBusca', 'Pode buscar a criança')}</div>
          </div>
        </>
      );
      case 3: return (
        <>
          <p className="rotulo-solto">Composição familiar</p>
          {tabelaFamilia}
          {O('beneficios', 'Recebe benefícios sociais?', ['Bolsa Família', 'Outros', 'Não recebe'], { varias: true })}
          {f.beneficios.includes('Outros') && <div className="meia">{T('beneficiosQual', 'Qual?', { obrigatorio: true })}</div>}
        </>
      );
      case 4: return (
        <div className="grade-2 perguntas">
          {SimQual('deficiencia', 'A criança tem alguma deficiência?', 'Qual?')}
          {SimQual('aprendizagem', 'Tem dificuldade de aprendizagem para ler ou escrever?', 'Qual?')}
          {O('fala', 'Tem dificuldade na fala?', ['Troca de palavras', 'Gagueira', 'Não'], { varias: true })}
          {O('convulsao', 'Tem ou teve crise convulsiva?', SN)}
          {O('refeicoes', 'Quais refeições a criança faz?', ['Café da manhã', 'Almoço', 'Café da tarde', 'Janta'], { varias: true, className: 'largura-toda' })}
          {SimQual('alergia', 'Tem alguma alergia?', 'Qual?')}
          {SimQual('medicamento', 'Faz uso de medicamento contínuo?', 'Qual?')}
          {O('respiratoria', 'Tem ou já teve alguma doença respiratória?', ['Rinite', 'Sinusite', 'Bronquite', 'Não'], { varias: true, className: 'largura-toda' })}
        </div>
      );
      default: {
        const opResp = [f.respNome ? `${f.respNome} (${(parentescoResp(f) || '').toLowerCase()})` : ''].filter(Boolean);
        return (
          <>
            {O('cursos', 'Quais cursos do projeto a criança vai fazer?', ['Roda de Conversa', 'Dança', 'Musicalização', 'Jiu-jitsu', 'Outros'], { varias: true, obrigatorio: true })}
            {f.cursos.includes('Outros') && <div className="meia">{T('cursosQual', 'Qual?', { obrigatorio: true })}</div>}
            <hr className="divisoria" />
            <h3 className="subtitulo-form">Autorizações</h3>
            {O('sozinho', 'Pode ir embora sozinho?', SN, { obrigatorio: true })}
            {tabelaAut}
            {O('imagem', 'Uso de imagens e vídeos em redes sociais e outros meios de comunicação', SN, { obrigatorio: true })}
            <div className="meia">{S('respAssina', 'Responsável que assina as autorizações', opResp, { obrigatorio: true })}</div>
            {blocoMatricula}
          </>
        );
      }
    }
  };

  const ult = etapa === etapas.length;
  const respsCard = infantil
    ? (etapa > 3 ? [f.maeNome && `${f.maeNome} (${(f.maeParentesco || '').toLowerCase()})`, f.paiInfo === 'Sim' && f.paiNome && `${f.paiNome} (pai)`].filter(Boolean).join(' · ') : '')
    : (etapa > 2 && f.respNome ? `${f.respNome} (${(parentescoResp(f) || '').toLowerCase()})` : '');
  return (
    <Pagina className="matricula">
      <BarraCaminho voltar="/alunos"><SalvoAuto /></BarraCaminho>
      <h1 className="titulo-32 matricula-titulo">Nova matrícula · {NOME_MODALIDADE[mod]}</h1>
      <IndicadorEtapas etapas={etapas} atual={etapa} />
      <div className="matricula-corpo">
        <form className="form-matricula" noValidate onSubmit={e => { e.preventDefault(); if (ult) concluir(); else avancar(); }}>
          <div className="form-matricula-conteudo">
            <header><small>Etapa {etapa} de {etapas.length}</small><h2>{etapas[etapa - 1]}</h2></header>
            {infantil ? conteudoInfantil() : conteudoContraturno()}
          </div>
          <footer>
            {etapa === 1
              ? <Botao tipo="secundario" icone="voltar" para="/alunos/matricula">Etapa anterior</Botao>
              : <Botao tipo="secundario" icone="voltar" onClick={() => setEtapa(etapa - 1)}>Etapa anterior</Botao>}
            <span className="espaco" />
            <Botao tipo="discreto" icone="salvar" onClick={salvarDepois}>Salvar e continuar depois</Botao>
            <Botao submit icone={ult ? 'documento' : 'avancar'}>{ult ? 'Concluir matrícula' : 'Avançar'}</Botao>
          </footer>
        </form>
        <aside className="ate-aqui">
          <h2>Até aqui</h2>
          <div><small>Modalidade</small><EtiquetaModalidade m={mod} texto={NOME_MODALIDADE[mod]} /></div>
          {etapa > 1 && f.nome && <div><small>Criança</small><p>{f.nome}{idadeTexto(f.nascimento) ? ` · ${idadeTexto(f.nascimento)}` : ''}</p></div>}
          {infantil && etapa === 3 && f.maeNome && <div><small>Mãe ou responsável</small><p>{f.maeNome}</p></div>}
          {respsCard && <div><small>{infantil ? 'Responsáveis' : 'Responsável'}</small><p>{respsCard}</p></div>}
          <Link className="link-verde" to="/alunos/matricula">Trocar modalidade</Link>
        </aside>
      </div>
    </Pagina>
  );
}
