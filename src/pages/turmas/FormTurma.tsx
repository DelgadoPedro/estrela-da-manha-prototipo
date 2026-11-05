import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { novoId, useStore } from '../../store/store';
import { BarraCaminho, Pagina } from '../../components/Layout';
import { Botao } from '../../components/Botao';
import { Campo, GrupoOpcoes } from '../../components/Campo';
import { BotoesJanela, JanelaConfirmacao } from '../../components/Janela';
import { dataValida, mascaraData, mascaraHora, ordemData } from '../../utils/datas';
import { FILTROS } from './comum';
import type { HorarioDia, Modalidade, Turma } from '../../data/tipos';

const DIAS = [['Seg', 'Segunda'], ['Ter', 'Terça'], ['Qua', 'Quarta'], ['Qui', 'Quinta'], ['Sex', 'Sexta'], ['Sáb', 'Sábado']];
const MODS = [{ v: 'infantil', t: 'Educação Infantil' }, { v: 'contraturno', t: 'Contraturno' }, { v: 'oficinas', t: 'Oficinas' }];
const norm = (t: string) => t.trim().toLowerCase();
const curtoDe = (nome: string, m: string) => (m === 'oficinas' ? nome.replace(/^Oficina de /, '') : m === 'contraturno' ? nome.replace(/^Contraturno\s*.\s*/, '') : nome);
const horaValida = (h: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(h);

interface FormT { modalidade: string; nome: string; professor: string; sala: string; observacoes: string; horarios: HorarioDia[]; inicio: string; encerramento: string; vagas: number }

export default function FormTurma() {
  const { id } = useParams();
  const { s, d, aviso } = useStore();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const edit = s.turmas.find(t => t.id === id);
  const de = params.get('de') ?? (edit ? edit.modalidade : 'todos');
  const vazio: FormT = { modalidade: FILTROS[de]?.mod ?? '', nome: '', professor: '', sala: '', observacoes: '', horarios: [], inicio: '', encerramento: '', vagas: 0 };
  const orig = useMemo<FormT>(() => (edit ? { modalidade: edit.modalidade, nome: edit.nome, professor: edit.professor, sala: edit.sala, observacoes: edit.observacoes, horarios: edit.horarios, inicio: edit.inicio, encerramento: edit.encerramento, vagas: edit.vagas } : vazio), [id]);
  const [f, setF] = useState<FormT>(orig);
  const [sair, setSair] = useState(false);
  const set = <K extends keyof FormT>(k: K, v: FormT[K]) => setF(x => ({ ...x, [k]: v }));
  const mudou = JSON.stringify(f) !== JSON.stringify(orig);
  const voltarPara = edit ? `/turmas/${edit.id}` : `/turmas/lista/${de}`;
  const tentarSair = () => (mudou ? setSair(true) : nav(voltarPara));
  const nomeDuplicado = s.turmas.some(t => t.id !== edit?.id && norm(t.nome) === norm(f.nome) && !!f.nome.trim());
  const errosHora = f.horarios.filter(h => horaValida(h.inicio) && horaValida(h.fim) && h.fim <= h.inicio).map(h => h.dia);
  const erroFim = f.encerramento && dataValida(f.encerramento) && dataValida(f.inicio) && ordemData(f.encerramento) < ordemData(f.inicio);
  const temErro = nomeDuplicado || errosHora.length > 0 || !!erroFim;
  const completo = !!f.modalidade && !!f.nome.trim() && !!f.professor.trim() && f.horarios.length > 0 && f.horarios.every(h => horaValida(h.inicio) && horaValida(h.fim)) && dataValida(f.inicio) && f.vagas > 0;
  const pronto = completo && !temErro;
  const toggleDia = (dia: string) => set('horarios', f.horarios.some(h => h.dia === dia) ? f.horarios.filter(h => h.dia !== dia) : DIAS.map(x => x[1]).flatMap(n => { const ex = f.horarios.find(h => h.dia === n); return n === dia ? [{ dia, inicio: f.horarios[0]?.inicio ?? '', fim: f.horarios[0]?.fim ?? '' }] : ex ? [ex] : []; }));
  const setHora = (dia: string, k: 'inicio' | 'fim', v: string) => set('horarios', f.horarios.map(h => (h.dia === dia ? { ...h, [k]: mascaraHora(v) } : h)));

  const salvar = () => {
    if (edit) {
      d({ t: 'salvarTurma', turma: { ...edit, ...f, modalidade: f.modalidade as Modalidade, curto: curtoDe(f.nome, f.modalidade) } });
      aviso('Alterações salvas');
      nav(`/turmas/${edit.id}?aba=dados`);
    } else {
      const nova: Turma = { ...f, id: novoId(f.nome, s.turmas), modalidade: f.modalidade as Modalidade, curto: curtoDe(f.nome, f.modalidade), ativa: true, chamadas: {} };
      d({ t: 'salvarTurma', turma: nova });
      aviso('Turma cadastrada');
      nav(`/turmas/lista/${f.modalidade}`);
    }
  };
  const status = temErro ? 'Corrija os campos em vermelho para cadastrar.' : edit ? (mudou ? 'Alterações ainda não salvas.' : 'Nenhuma alteração ainda.') : completo ? 'Tudo certo para cadastrar.' : 'Faltam campos com * para cadastrar.';
  const caminho = edit
    ? [{ nome: 'Turmas', para: '/turmas' }, { nome: FILTROS[edit.modalidade].caminho, para: `/turmas/lista/${edit.modalidade}` }, { nome: edit.nome, para: `/turmas/${edit.id}` }, { nome: 'Editar turma' }]
    : [{ nome: 'Turmas', para: '/turmas' }, { nome: 'Nova turma' }];
  return (
    <Pagina fixa className="form-turma">
      <BarraCaminho onVoltar={tentarSair} caminho={caminho} />
      <div className="titulo-bloco">
        <h1 className="titulo-40 preto">{edit ? 'Editar turma' : 'Nova turma'}</h1>
        <p className="subtitulo-18 preto">{edit ? `${edit.nome} · ` : ''}Campos com * são obrigatórios.</p>
      </div>
      <form className="cartao-form-turma" noValidate onSubmit={e => { e.preventDefault(); if (edit ? pronto && mudou : pronto) salvar(); }}>
        <div className="form-turma-grade">
          <section>
            <h2>Sobre a turma</h2>
            <GrupoOpcoes rotulo="Modalidade" obrigatorio valor={f.modalidade} onChange={v => set('modalidade', v)} opcoes={MODS} />
            <Campo rotulo="Nome da turma" obrigatorio placeholder="Ex.: Oficina de Judô" valor={f.nome} onChange={v => set('nome', v)} erro={nomeDuplicado ? 'Já existe uma turma com esse nome. Escolha outro nome.' : undefined} />
            <div className="grade-2 estreita">
              <Campo rotulo="Nome do professor" obrigatorio placeholder="Nome completo" valor={f.professor} onChange={v => set('professor', v)} />
              <Campo rotulo="Sala ou local" placeholder="Ex.: Sala 2" valor={f.sala} onChange={v => set('sala', v)} />
            </div>
            <Campo multilinha rotulo="Observações" placeholder="Opcional. Ex.: material que precisa levar" valor={f.observacoes} onChange={v => set('observacoes', v)} />
          </section>
          <section>
            <h2>Quando acontece</h2>
            <fieldset className="dias-semana">
              <legend>Dias da semana *</legend>
              <div>
                {DIAS.map(([sigla, dia]) => (
                  <button key={dia} type="button" aria-label={dia} aria-pressed={f.horarios.some(h => h.dia === dia)} className={f.horarios.some(h => h.dia === dia) ? 'sel' : ''} onClick={() => toggleDia(dia)}>{sigla}</button>
                ))}
              </div>
            </fieldset>
            <fieldset className="horarios">
              <legend>Horário de cada dia *</legend>
              {f.horarios.length === 0 && <p className="campo-ajuda">Marque os dias acima para informar o horário de cada um.</p>}
              {f.horarios.map(h => {
                const erro = errosHora.includes(h.dia);
                return (
                  <div key={h.dia}>
                    <div className="linha-horario">
                      <strong>{h.dia}</strong>
                      <input className="caixa" aria-label={`${h.dia}, início`} placeholder="00:00" value={h.inicio} onChange={e => setHora(h.dia, 'inicio', e.target.value)} />
                      <span>às</span>
                      <input className={`caixa ${erro ? 'erro' : ''}`} aria-invalid={erro || undefined} aria-label={`${h.dia}, fim`} placeholder="00:00" value={h.fim} onChange={e => setHora(h.dia, 'fim', e.target.value)} />
                    </div>
                    {erro && <p className="campo-erro">{h.dia}: o fim precisa ser depois do início.</p>}
                  </div>
                );
              })}
            </fieldset>
            <div className="grade-2 estreita">
              <Campo rotulo="Início das aulas" obrigatorio placeholder="dd/mm/aaaa" mascara={mascaraData} valor={f.inicio} onChange={v => set('inicio', v)} />
              <Campo rotulo="Encerramento" placeholder="Sem data de término" mascara={mascaraData} valor={f.encerramento} onChange={v => set('encerramento', v)} erro={erroFim ? 'O encerramento precisa ser depois do início.' : undefined} />
            </div>
            <div className="campo vagas">
              <span id="rot-vagas" className="campo-rotulo"><b>Número de vagas *</b></span>
              <div>
                <button type="button" aria-label="Diminuir vagas" onClick={() => set('vagas', Math.max(0, f.vagas - 1))}>−</button>
                <input className="caixa" aria-labelledby="rot-vagas" inputMode="numeric" value={f.vagas} onChange={e => set('vagas', Number(e.target.value.replace(/\D/g, '')) || 0)} />
                <button type="button" aria-label="Aumentar vagas" onClick={() => set('vagas', f.vagas + 1)}>+</button>
              </div>
            </div>
          </section>
        </div>
        <footer>
          <p className={temErro ? 'status-form erro' : completo && !edit ? 'status-form ok' : 'status-form'} role="status">{status}</p>
          <span className="espaco" />
          <Botao tipo="secundario" onClick={tentarSair}>Cancelar</Botao>
          <Botao submit disabled={edit ? !(pronto && mudou) : !pronto}>{edit ? 'Salvar alterações' : 'Cadastrar turma'}</Botao>
        </footer>
      </form>
      {sair && (
        <JanelaConfirmacao titulo={edit ? 'Sair sem salvar?' : 'Sair sem cadastrar?'} texto={edit ? 'Você mudou dados da turma. Se sair agora, as mudanças não serão guardadas.' : 'Você já preencheu dados da nova turma. Se sair agora, eles não serão guardados.'} icone="alerta" fechar={() => setSair(false)} largura={640}>
          <BotoesJanela>
            <Botao tipo="secundario" largo onClick={() => setSair(false)}>{edit ? 'Continuar editando' : 'Continuar preenchendo'}</Botao>
            <Botao tipo="perigo-cheio" largo onClick={() => nav(voltarPara)}>{edit ? 'Sair sem salvar' : 'Sair sem cadastrar'}</Botao>
          </BotoesJanela>
        </JanelaConfirmacao>
      )}
    </Pagina>
  );
}
