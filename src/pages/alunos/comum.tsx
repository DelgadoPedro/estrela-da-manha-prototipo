import { useState } from 'react';
import type { Aluno, Turma } from '../../data/tipos';
import { Botao } from '../../components/Botao';
import { BotoesJanela, JanelaConfirmacao } from '../../components/Janela';
import { Campo, CampoSelect } from '../../components/Campo';
import { Icone } from '../../components/Icone';
import { dataValida, hoje, mascaraData } from '../../utils/datas';

export const turmaPrincipal = (a: Aluno, turmas: Turma[]) =>
  turmas.find(t => t.id === a.turmaIds.find(id => turmas.find(x => x.id === id)?.modalidade === a.modalidade)) ?? turmas.find(t => a.turmaIds.includes(t.id));

export const turmasDoAluno = (a: Aluno, turmas: Turma[]) => a.turmaIds.map(id => turmas.find(t => t.id === id)).filter(Boolean) as Turma[];

export function rotuloEtiquetaTurma(t: Turma) {
  if (t.modalidade === 'infantil') return `Ed. Infantil · ${t.curto}`;
  if (t.modalidade === 'contraturno') return `Contraturno · ${t.curto}`;
  return t.nome;
}
export function juntarNomes(l: string[]) {
  if (l.length <= 1) return l[0] ?? '';
  return `${l.slice(0, -1).join(', ')} e ${l[l.length - 1]}`;
}
export function linhaIrmao(a: Aluno, turmas: Turma[]) {
  const t = turmaPrincipal(a, turmas);
  return t ? `${a.nome} · ${rotuloEtiquetaTurma(t)}` : a.nome;
}
// TODO(design): o Figma só mostra "Mudou de cidade" como motivo. As outras opções são provisórias.
const MOTIVOS = ['Mudou de cidade', 'Mudou de escola', 'Família pediu a saída', 'Outro'];

export function JanelaDesativar({ alunos, turmas, fechar, confirmar }: { alunos: Aluno[]; turmas: Turma[]; fechar: () => void; confirmar: (data: string, motivo: string) => void }) {
  const [data, setData] = useState(hoje());
  const [motivo, setMotivo] = useState('');
  const [erros, setErros] = useState<Record<string, string>>({});
  const [lista, setLista] = useState(false);
  const um = alunos.length === 1;
  const enviar = () => {
    const e: Record<string, string> = {};
    if (!dataValida(data)) e.data = 'Escreva a data no formato dd/mm/aaaa.';
    if (!motivo) e.motivo = 'Escolha um motivo.';
    setErros(e);
    if (!Object.keys(e).length) confirmar(data, motivo);
  };
  return (
    <JanelaConfirmacao titulo={um ? `Desativar ${alunos[0].nome}?` : `Desativar ${alunos.length} alunos?`} texto="Dá para reativar depois." icone="arquivar" perigo fechar={fechar}>
      {!um && <ListaExibir alunos={alunos} turmas={turmas} aberta={lista} alternar={() => setLista(!lista)} />}
      <div className="linha-2">
        <Campo rotulo="Data da saída" obrigatorio valor={data} onChange={setData} mascara={mascaraData} erro={erros.data} />
        <CampoSelect rotulo="Motivo" obrigatorio valor={motivo} onChange={setMotivo} opcoes={MOTIVOS} vazio="Escolha um motivo" erro={erros.motivo} />
      </div>
      <BotoesJanela>
        <Botao tipo="secundario" largo onClick={fechar}>Cancelar ação</Botao>
        <Botao tipo="perigo-cheio" largo onClick={enviar}>{um ? 'Desativar aluno' : 'Desativar alunos'}</Botao>
      </BotoesJanela>
    </JanelaConfirmacao>
  );
}
function ListaExibir({ alunos, turmas, aberta, alternar }: { alunos: Aluno[]; turmas: Turma[]; aberta: boolean; alternar: () => void }) {
  return (
    <div className="exibir-alunos">
      <button type="button" className="link-botao" aria-expanded={aberta} onClick={alternar}><Icone nome="abaixo" tam={18} />{aberta ? 'Ocultar alunos' : `Exibir alunos (${alunos.length})`}</button>
      {aberta && <ul>{alunos.map(a => <li key={a.id}>{a.nome} · {turmaPrincipal(a, turmas)?.curto ?? 'Sem turma'}</li>)}</ul>}
    </div>
  );
}
export function JanelaRemover({ alunos, turmas, fechar, confirmar, desativar }: { alunos: Aluno[]; turmas: Turma[]; fechar: () => void; confirmar: () => void; desativar: () => void }) {
  const [lista, setLista] = useState(false);
  const um = alunos.length === 1;
  return (
    <JanelaConfirmacao titulo={um ? `Remover ${alunos[0].nome}?` : `Remover ${alunos.length} alunos?`} texto="Essa ação é permanente e apaga todas as informações desses alunos." icone="lixeira" perigo fechar={fechar}>
      <ListaExibir alunos={alunos} turmas={turmas} aberta={lista} alternar={() => setLista(!lista)} />
      <BotoesJanela>
        <Botao tipo="secundario" largo onClick={fechar}>Cancelar ação</Botao>
        <Botao tipo="secundario" largo onClick={desativar}>Desativar em vez disso</Botao>
        <Botao tipo="perigo-cheio" largo onClick={confirmar}>Remover alunos</Botao>
      </BotoesJanela>
    </JanelaConfirmacao>
  );
}
