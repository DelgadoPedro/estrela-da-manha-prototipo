import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useStore } from '../../store/store';
import { BarraCaminho, Pagina } from '../../components/Layout';
import { Botao } from '../../components/Botao';
import { Campo, CampoSelect, GrupoOpcoes } from '../../components/Campo';
import { EtiquetaPendente } from '../../components/Etiqueta';
import { BotoesJanela, JanelaConfirmacao } from '../../components/Janela';
import { JanelaDesativar, juntarNomes, rotuloEtiquetaTurma, turmaPrincipal } from './comum';
import { dataValida, idadeTexto, idade, mascaraData, mascaraTelefone } from '../../utils/datas';
import { NOME_MODALIDADE } from '../../data/tipos';
import type { Aluno, Modalidade } from '../../data/tipos';

type Parte = 'modalidade' | 'dados' | 'saude' | 'responsaveis' | 'documentos';
const PARTES: { id: Parte; nome: string }[] = [
  { id: 'modalidade', nome: 'Modalidade e turma' }, { id: 'dados', nome: 'Dados da criança' }, { id: 'saude', nome: 'Saúde' },
  { id: 'responsaveis', nome: 'Responsáveis' }, { id: 'documentos', nome: 'Documentos' },
];
const ROTULOS: Record<string, string> = {
  nome: 'Nome', nascimento: 'Data de nascimento', sexo: 'Sexo', cpf: 'CPF', endereco: 'Endereço', escola: 'Escola regular',
  modalidade: 'Modalidade', turma: 'Turma', alergia: 'Alergia', condicao: 'Condição de saúde',
};
const parteDe = (k: string): Parte => (k.startsWith('r') && /^r\d/.test(k) ? 'responsaveis' : k.startsWith('doc') ? 'documentos' : k === 'modalidade' || k === 'turma' ? 'modalidade' : k === 'alergia' || k === 'condicao' ? 'saude' : 'dados');

function planificar(a: Aluno, turmaId: string) {
  const v: Record<string, string> = { nome: a.nome, nascimento: a.nascimento, sexo: a.sexo, endereco: a.endereco, cpf: a.cpf, escola: a.escola, modalidade: a.modalidade, turma: turmaId, alergia: a.alergia, condicao: a.condicao };
  a.responsaveis.forEach((r, i) => { v[`r${i}nome`] = r.nome; v[`r${i}parentesco`] = r.parentesco; v[`r${i}telefone`] = r.telefone; v[`r${i}documento`] = r.documento; });
  a.documentos.forEach((x, i) => { v[`doc${i}`] = x.situacao; });
  return v;
}
function rotuloDe(k: string, a: Aluno) {
  const m = /^r(\d+)(\w+)/.exec(k);
  if (m) return `${{ nome: 'Nome', parentesco: 'Parentesco', telefone: 'Telefone', documento: 'Documento' }[m[2]] ?? m[2]} do responsável`;
  if (k.startsWith('doc')) return a.documentos[+k.slice(3)]?.nome ?? 'Documento';
  return ROTULOS[k] ?? k;
}

export default function EditarCadastro() {
  const { id } = useParams();
  const { s, d, aviso } = useStore();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const aluno = s.alunos.find(a => a.id === id)!;
  const principal = aluno ? turmaPrincipal(aluno, s.turmas) : undefined;
  const orig = useMemo(() => (aluno ? planificar(aluno, principal?.id ?? '') : {}), [aluno?.id]);
  const [v, setV] = useState<Record<string, string>>(orig);
  const [qtdResp, setQtdResp] = useState((aluno?.responsaveis.length ?? 0) + (params.get('novo') ? 1 : 0));
  const [parte, setParte] = useState<Parte>((params.get('parte') as Parte) || 'dados');
  const [janela, setJanela] = useState<'sair' | 'desativar' | null>(null);
  const [erros, setErros] = useState<Record<string, string>>({});
  if (!aluno) return <Pagina><BarraCaminho voltar="/alunos" /></Pagina>;

  const mudou = Object.keys(v).filter(k => (v[k] ?? '') !== (orig[k] ?? ''));
  const nomesMudou = [...new Set(mudou.map(k => rotuloDe(k, aluno)))];
  const set = (k: string, val: string) => { setV(x => ({ ...x, [k]: val })); setErros(e => ({ ...e, [k]: '' })); };
  const antes = (k: string) => ((v[k] ?? '') !== (orig[k] ?? '') ? orig[k] ?? '' : undefined);
  const tagParte = (p: Parte) => {
    const n = mudou.filter(k => parteDe(k) === p).length;
    if (n) return <span className="tag-mudanca">{n} {n === 1 ? 'mudança' : 'mudanças'}</span>;
    let pend = 0;
    if (p === 'dados' && !v.cpf) pend = 1;
    if (p === 'responsaveis') pend = aluno.responsaveis.filter((r, i) => !v[`r${i}documento`] && r).length;
    if (p === 'documentos') pend = aluno.documentos.filter((x, i) => v[`doc${i}`] === 'Pendente' && !(x.nome.startsWith('CPF') && v.cpf)).length;
    return pend ? <EtiquetaPendente texto={`${pend} ${pend === 1 ? 'pendente' : 'pendentes'}`} /> : null;
  };
  const sair = () => (mudou.length ? setJanela('sair') : nav(`/alunos/${aluno.id}`));
  const salvar = () => {
    const e: Record<string, string> = {};
    if (!v.nome?.trim()) e.nome = 'Preencha este campo.';
    if (!dataValida(v.nascimento)) e.nascimento = 'Escreva a data no formato dd/mm/aaaa.';
    if (!v.endereco?.trim()) e.endereco = 'Preencha este campo.';
    setErros(e);
    if (Object.keys(e).length) { setJanela(null); setParte(parteDe(Object.keys(e)[0])); return; }
    const resp = Array.from({ length: qtdResp }, (_, i) => ({ nome: v[`r${i}nome`] ?? '', parentesco: v[`r${i}parentesco`] ?? '', telefone: v[`r${i}telefone`] ?? '', documento: v[`r${i}documento`] ?? '' })).filter(r => r.nome.trim());
    const turmaAntiga = principal?.id;
    const turmaIds = v.turma !== turmaAntiga ? [...aluno.turmaIds.filter(t => t !== turmaAntiga), ...(v.turma ? [v.turma] : [])] : aluno.turmaIds;
    const novo: Aluno = {
      ...aluno, nome: v.nome, nascimento: v.nascimento, sexo: v.sexo, cpf: v.cpf, endereco: v.endereco, escola: v.escola, modalidade: v.modalidade as Modalidade,
      alergia: v.alergia, condicao: v.condicao, responsaveis: resp, turmaIds,
      documentos: aluno.documentos.map((x, i) => ({ ...x, situacao: (x.nome.startsWith('CPF') && v.cpf ? 'Entregue' : v[`doc${i}`]) as 'Entregue' | 'Pendente' })),
      historico: mudou.length ? [...aluno.historico, { data: new Date().toLocaleDateString('pt-BR'), texto: `Cadastro atualizado: ${juntarNomes(nomesMudou)}.` }] : aluno.historico,
    };
    d({ t: 'salvarAluno', aluno: novo });
    aviso(`Alterações salvas · ${juntarNomes(nomesMudou)} ${nomesMudou.length > 1 ? 'atualizados' : 'atualizado'}`);
    nav(`/alunos/${aluno.id}`);
  };
  const turmasMod = s.turmas.filter(t => t.modalidade === v.modalidade);
  const idadeAj = () => {
    const i = idade(v.nascimento);
    if (i === null) return undefined;
    const t = turmasMod.find(x => x.id === v.turma);
    return v.modalidade === 'infantil' && t && i <= 6 ? `${idadeTexto(v.nascimento)}. Idade certa para a ${t.curto}.` : `${idadeTexto(v.nascimento)}.`;
  };
  const titulo = PARTES.find(p => p.id === parte)!.nome;
  return (
    <Pagina fixa className="editar">
      <BarraCaminho onVoltar={sair} />
      <div className="titulo-bloco">
        <h1 className="titulo-32">Editar cadastro</h1>
        <p className="subtitulo-16">{aluno.nome} · {principal ? rotuloEtiquetaTurma(principal) : NOME_MODALIDADE[aluno.modalidade]}</p>
      </div>
      <div className="editar-corpo">
        <nav className="menu-partes" aria-label="Partes do cadastro">
          <p>Partes do cadastro</p>
          {PARTES.map(p => (
            <button key={p.id} type="button" className={p.id === parte ? 'ativo' : ''} aria-current={p.id === parte ? 'true' : undefined} onClick={() => setParte(p.id)}>
              <span>{p.nome}</span>{tagParte(p.id)}
            </button>
          ))}
          <span className="espaco" />
          <div className="saida-ong"><Botao tipo="perigo" icone="arquivar" largo onClick={() => setJanela('desativar')}>Desativar aluno</Botao></div>
        </nav>
        <section className="form-editar">
          <header><small>Editando</small><h2>{titulo}</h2></header>
          <div className="form-editar-campos">
            {parte === 'dados' && (
              <div className="grade-2">
                <Campo rotulo="Nome completo" obrigatorio valor={v.nome} onChange={x => set('nome', x)} antes={antes('nome')} erro={erros.nome} />
                <Campo rotulo="Data de nascimento" obrigatorio valor={v.nascimento} onChange={x => set('nascimento', x)} mascara={mascaraData} ajuda={idadeAj()} antes={antes('nascimento')} erro={erros.nascimento} />
                <GrupoOpcoes rotulo="Sexo" valor={v.sexo} onChange={x => set('sexo', x)} opcoes={['Feminino', 'Masculino']} />
                <Campo rotulo="CPF da criança" pendente valor={v.cpf} onChange={x => set('cpf', x)} antes={antes('cpf')} />
                <Campo rotulo="Endereço" obrigatorio valor={v.endereco} onChange={x => set('endereco', x)} antes={antes('endereco')} erro={erros.endereco} />
                <Campo rotulo="Escola regular" valor={v.escola} onChange={x => set('escola', x)} antes={antes('escola')} />
              </div>
            )}
            {/* TODO(design): as partes Modalidade e turma, Saúde, Responsáveis e Documentos não têm frame no Figma. Mesmo padrão de Dados da criança. */}
            {parte === 'modalidade' && (
              <div className="grade-2">
                <CampoSelect rotulo="Modalidade" valor={v.modalidade} antes={antes('modalidade') !== undefined ? NOME_MODALIDADE[orig.modalidade as Modalidade] : undefined} onChange={x => { set('modalidade', x); set('turma', ''); }} opcoes={Object.entries(NOME_MODALIDADE).map(([k, t]) => ({ v: k, t }))} />
                <CampoSelect rotulo="Turma" valor={v.turma} vazio="Sem turma" antes={antes('turma') !== undefined ? s.turmas.find(t => t.id === orig.turma)?.nome ?? '' : undefined} onChange={x => set('turma', x)} opcoes={turmasMod.map(t => ({ v: t.id, t: t.nome }))} />
              </div>
            )}
            {parte === 'saude' && (
              <div className="grade-2">
                <Campo rotulo="Alergia" valor={v.alergia} onChange={x => set('alergia', x)} antes={antes('alergia')} />
                <Campo rotulo="Condição de saúde" valor={v.condicao} onChange={x => set('condicao', x)} antes={antes('condicao')} />
              </div>
            )}
            {parte === 'responsaveis' && (
              <div className="pilha">
                {Array.from({ length: qtdResp }, (_, i) => (
                  <div className="grade-2 bloco-resp" key={i}>
                    <Campo rotulo="Nome" valor={v[`r${i}nome`] ?? ''} onChange={x => set(`r${i}nome`, x)} antes={antes(`r${i}nome`)} />
                    <Campo rotulo="Parentesco" valor={v[`r${i}parentesco`] ?? ''} onChange={x => set(`r${i}parentesco`, x)} antes={antes(`r${i}parentesco`)} />
                    <Campo rotulo="Telefone" valor={v[`r${i}telefone`] ?? ''} mascara={mascaraTelefone} onChange={x => set(`r${i}telefone`, x)} antes={antes(`r${i}telefone`)} />
                    <Campo rotulo="Documento" pendente valor={v[`r${i}documento`] ?? ''} onChange={x => set(`r${i}documento`, x)} antes={antes(`r${i}documento`)} />
                  </div>
                ))}
                <div><Botao tipo="secundario" icone="adicionar" onClick={() => setQtdResp(qtdResp + 1)}>Adicionar responsável</Botao></div>
              </div>
            )}
            {parte === 'documentos' && (
              <div className="pilha">
                {aluno.documentos.map((x, i) => <GrupoOpcoes key={x.nome} rotulo={x.nome} valor={v[`doc${i}`]} onChange={val => set(`doc${i}`, val)} opcoes={['Entregue', 'Pendente']} />)}
              </div>
            )}
          </div>
          <footer>
            <p className={mudou.length ? 'contador muda' : 'contador'} role="status">
              {mudou.length ? `${mudou.length} ${mudou.length === 1 ? 'alteração não salva' : 'alterações não salvas'}: ${juntarNomes(nomesMudou)}` : 'Nenhuma alteração ainda'}
            </p>
            <span className="espaco" />
            <Botao tipo="secundario" onClick={sair}>Cancelar</Botao>
            <Botao onClick={salvar} disabled={!mudou.length}>Salvar alterações</Botao>
          </footer>
        </section>
      </div>
      {janela === 'sair' && (
        <JanelaConfirmacao titulo="Sair sem salvar?" texto={`${juntarNomes(nomesMudou)} ${nomesMudou.length > 1 ? 'foram alterados' : 'foi alterado'}.`} icone="alerta" fechar={() => setJanela(null)}>
          <BotoesJanela>
            <Botao tipo="secundario" largo onClick={() => setJanela(null)}>Continuar editando</Botao>
            <Botao tipo="secundario" largo onClick={() => nav(`/alunos/${aluno.id}`)}>Sair sem salvar</Botao>
            <Botao largo onClick={salvar}>Salvar e sair</Botao>
          </BotoesJanela>
        </JanelaConfirmacao>
      )}
      {janela === 'desativar' && (
        <JanelaDesativar alunos={[aluno]} turmas={s.turmas} fechar={() => setJanela(null)} confirmar={(data, motivo) => {
          d({ t: 'desativarAlunos', ids: [aluno.id], data, motivo });
          aviso(`${aluno.nome} foi desativado`);
          nav(`/alunos/${aluno.id}`);
        }} />
      )}
    </Pagina>
  );
}
