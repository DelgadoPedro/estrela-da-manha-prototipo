import { useState } from 'react';
import type { Aluno, Modalidade, Turma } from '../../data/tipos';
import { Botao } from '../../components/Botao';
import { BotoesJanela, JanelaConfirmacao } from '../../components/Janela';
import { Campo, GrupoOpcoes } from '../../components/Campo';
import { Icone } from '../../components/Icone';
import { dataValida, hoje, mascaraData } from '../../utils/datas';

export const FILTROS: Record<string, { titulo: string; caminho: string; rotulo: string; mod?: Modalidade }> = {
  todos: { titulo: 'Todas as turmas', caminho: 'Todas as turmas', rotulo: 'Todas' },
  infantil: { titulo: 'Turmas · Educação Infantil', caminho: 'Educação Infantil', rotulo: 'Ed. Infantil', mod: 'infantil' },
  contraturno: { titulo: 'Turmas · Contraturno', caminho: 'Contraturno', rotulo: 'Contraturno', mod: 'contraturno' },
  oficinas: { titulo: 'Turmas · Oficinas', caminho: 'Oficinas', rotulo: 'Oficinas', mod: 'oficinas' },
};
export const alunosDaTurma = (t: Turma, alunos: Aluno[]) => alunos.filter(a => a.turmaIds.includes(t.id)).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

export const comTitulo = (p: string) => (/^Prof/.test(p) ? p : `Prof. ${p}`);
export const semTitulo = (p: string) => p.replace(/^Prof\.ª? /, '');

const MOTIVOS = ['Turma encerrada', 'Sem professor', 'Poucos alunos', 'Outro'];

function CamposMotivo({ dia, setDia, motivo, setMotivo, outro, setOutro, rotuloDia }: { dia: string; setDia: (v: string) => void; motivo: string; setMotivo: (v: string) => void; outro: string; setOutro: (v: string) => void; rotuloDia: string }) {
  return (
    <div className="pilha">
      <div className="campo-dia"><Campo rotulo={rotuloDia} obrigatorio valor={dia} onChange={setDia} mascara={mascaraData} placeholder="dd/mm/aaaa" /></div>
      <GrupoOpcoes rotulo="Motivo" obrigatorio valor={motivo} onChange={setMotivo} opcoes={MOTIVOS} />
      {motivo === 'Outro' && <Campo rotulo="Escreva o motivo" obrigatorio valor={outro} onChange={setOutro} />}
    </div>
  );
}
const prontoMotivo = (dia: string, motivo: string, outro: string) => dataValida(dia) && !!motivo && (motivo !== 'Outro' || !!outro.trim());
export const textoMotivo = (motivo: string, outro: string) => (motivo === 'Outro' ? outro : motivo);

export function JanelaDesativarTurmas({ turmas, fechar, confirmar }: { turmas: Turma[]; fechar: () => void; confirmar: (data: string, motivo: string) => void }) {
  const [dia, setDia] = useState(hoje());
  const [motivo, setMotivo] = useState('');
  const [outro, setOutro] = useState('');
  const um = turmas.length === 1;
  return (
    <JanelaConfirmacao titulo={um ? `Desativar ${turmas[0].nome}?` : `Desativar ${turmas.length} turmas?`} texto={`Dá para reativar depois. O histórico ${um ? 'da turma' : 'das turmas'} continua guardado.`} icone="arquivar" perigo fechar={fechar} largura={720}>
      <CamposMotivo dia={dia} setDia={setDia} motivo={motivo} setMotivo={setMotivo} outro={outro} setOutro={setOutro} rotuloDia="Dia da desativação" />
      <BotoesJanela>
        <Botao tipo="secundario" largo icone="voltar" onClick={fechar}>Voltar</Botao>
        <Botao tipo="perigo-cheio" largo disabled={!prontoMotivo(dia, motivo, outro)} onClick={() => confirmar(dia, textoMotivo(motivo, outro))}>{um ? 'Desativar turma' : 'Desativar turmas'}</Botao>
      </BotoesJanela>
    </JanelaConfirmacao>
  );
}

export function JanelaRemoverTurma({ turma, fechar, desativar, apagar }: { turma: Turma; fechar: () => void; desativar: (d: string, m: string) => void; apagar: () => void }) {
  const [dia, setDia] = useState(hoje());
  const [motivo, setMotivo] = useState('');
  const [outro, setOutro] = useState('');
  const [fase, setFase] = useState<'motivo' | 'nome'>('motivo');
  const [nome, setNome] = useState('');
  const pronto = prontoMotivo(dia, motivo, outro);
  if (fase === 'nome') {
    const igual = nome.trim() === turma.nome;
    return (
      <JanelaConfirmacao key="nome" titulo={`Apagar ${turma.nome}?`} texto="Essa operação é irreversível. Tem certeza que deseja excluir essa turma?" icone="lixeira" perigo fechar={fechar} largura={720}>
        <div className="confirmar-nome">
          <p>Para continuar a operação escreva:</p>
          <strong>{turma.nome}</strong>
          <Campo rotulo="Nome da turma" obrigatorio valor={nome} onChange={setNome} placeholder="Escreva o nome aqui" autoFocus />
          {igual && <p className="nome-ok"><Icone nome="feito" tam={16} />Nome conferido</p>}
        </div>
        <BotoesJanela>
          <Botao tipo="secundario" largo onClick={() => { setFase('motivo'); setNome(''); }}>Voltar</Botao>
          <Botao tipo="perigo-cheio" largo disabled={!igual} onClick={apagar}>Apagar turma</Botao>
        </BotoesJanela>
      </JanelaConfirmacao>
    );
  }
  return (
    <JanelaConfirmacao key="motivo" titulo={`Remover ${turma.nome}?`} texto="Antes de continuar, diga o dia e o motivo." icone="lixeira" perigo fechar={fechar} largura={720}>
      <CamposMotivo dia={dia} setDia={setDia} motivo={motivo} setMotivo={setMotivo} outro={outro} setOutro={setOutro} rotuloDia="Dia" />
      <BotoesJanela>
        <Botao tipo="secundario" largo onClick={fechar}>Voltar</Botao>
        <Botao tipo="secundario" largo disabled={!pronto} onClick={() => desativar(dia, textoMotivo(motivo, outro))}>Desativar turma</Botao>
        <Botao tipo="perigo-cheio" largo disabled={!pronto} onClick={() => setFase('nome')}>Remover turma</Botao>
      </BotoesJanela>
    </JanelaConfirmacao>
  );
}
