import type { ReactNode } from 'react';
import type { Aluno, DadosForm } from '../data/tipos';
import { CORES, autorizadosAuto, familiaAuto } from '../pages/alunos/matriculaDados';
import { useStore } from '../store/store';
import { dataPorExtenso, hoje, horaAgora } from '../utils/datas';
import './ficha.css';

const V = ({ children }: { children: ReactNode }) => <b className="v">{children}</b>;
function C({ r, v, s = 1 }: { r: string; v?: string; s?: number }) {
  return <div className="c" style={{ gridColumn: `span ${s}` }}><small>{r}</small>{v ? <V>{v}</V> : <span className="vz">&nbsp;</span>}</div>;
}
const M = ({ on }: { on: boolean }) => <>( {on ? <b className="v x">X</b> : <>&nbsp;&nbsp;</>} )</>;
function Cor({ valor }: { valor?: string }) {
  return (
    <div className="ln cor">
      <span>Cor/Raça:</span>
      {CORES.map(c => <span key={c} className="o"><M on={valor === c} /> {c}</span>)}
    </div>
  );
}
const G = ({ cols, children }: { cols: string; children: ReactNode }) => <div className="ln g" style={{ gridTemplateColumns: cols }}>{children}</div>;

function Pessoa({ d, p, titulo, nomeSufixo }: { d: DadosForm; p: 'mae' | 'pai'; titulo: string; nomeSufixo?: string }) {
  const nome = d[`${p}Nome`];
  const vis = p === 'mae' || d.paiInfo === 'Sim';
  const g = (k: string) => (vis ? d[`${p}${k}`] : '');
  return (
    <>
      <h3>{titulo}</h3>
      <div className="box">
        <G cols="1fr"><C r="Nome" v={vis && nome ? `${nome}${nomeSufixo ?? ''}` : ''} /></G>
        <G cols="380px 1fr"><C r="Data de Nascimento" v={g('Nasc')} /><C r="Telefone para contato:" v={g('Tel')} /></G>
        <G cols="196px 210px 1fr"><C r="RG" v={g('RG')} /><C r="CPF" v={g('CPF')} /><C r="Estado civil" v={g('EC')} /></G>
        <Cor valor={g('Cor')} />
        <G cols="196px 210px 1fr"><C r="Escolaridade" v={g('Esc')} /><C r="Profissão" v={g('Prof')} /><C r="Local de trabalho" v={g('Local')} /></G>
        <G cols="569px 1fr"><C r="Horário de trabalho" v={g('Hor')} /><C r="Renda R$" v={g('Renda')} /></G>
      </div>
    </>
  );
}

function Cabecalho() {
  return <header><h1>Casa da Infância Estrela da Manhã</h1></header>;
}

/** Junta os dados da matrícula ou, para quem não passou pelo formulário, os dados da ficha. */
function dadosDe(a: Aluno): DadosForm {
  if (a.matricula) return a.matricula.dados;
  const r = a.responsaveis[0];
  const sim = (v: string) => (v ? 'Sim' : 'Não');
  return {
    modalidade: 'infantil', nome: a.nome, sexo: a.sexo, nascimento: a.nascimento, endereco: a.endereco, maeNome: r?.nome, maeParentesco: r?.parentesco, maeTel: r?.telefone, maeBusca: true,
    maeRG: r?.documento.startsWith('RG') ? r.documento.slice(3) : '', paiInfo: 'Não informar', alergia: sim(a.alergia), alergiaQual: a.alergia, problema: sim(a.condicao), problemaQual: a.condicao,
    deficiencia: 'Não', convulsao: 'Não', restricao: 'Não', medicamento: 'Não', cirurgia: 'Não', familiaExtra: [], autorizadosExtra: a.autorizados.slice(1).map(x => ({ nome: x.nome, parentesco: x.parentesco, telefone: x.telefone ?? '' })),
    imagem: a.imagem.startsWith('Sim') ? 'Sim' : 'Não', edfisica: '', fluor: '', dataMatricula: a.historico[0]?.data ?? hoje(), observacoes: '',
  };
}

export function FichaEdInfantil({ aluno }: { aluno: Aluno }) {
  const { s } = useStore();
  const d = dadosDe(aluno);
  const irmao = d.temIrmao === 'Sim' ? s.alunos.find(a => a.id === d.irmaoId) : undefined;
  const fam = [...familiaAuto(d, irmao), ...(d.familiaExtra ?? [])];
  const aut = [...autorizadosAuto(d), ...(d.autorizadosExtra ?? [])];
  const data = aluno.matricula?.preenchidaEm ?? hoje();
  const hora = aluno.matricula?.preenchidaHora ?? horaAgora();
  const numero = aluno.matricula?.numero ?? `${data.slice(6)}-0000`;
  const rodape = (n: number) => (
    <footer>
      <p>Ficha preenchida digitalmente em {data} às {hora}, por Mariana Souza (Coordenação), no Sistema de Gestão de Alunos.</p>
      <p>Matrícula nº {numero}. Página {n} de 2.</p>
    </footer>
  );
  const sn = (k: string, qual: string) => (
    <div className="ln saude" key={k}>
      <span>{SAUDE[k]}</span>
      <span>Sim <M on={d[k] === 'Sim'} /></span>
      <span>Não <M on={d[k] !== 'Sim'} /></span>
      <span>{qual}{d[k] === 'Sim' && d[`${k}Qual`] ? <>&nbsp; <V>{d[`${k}Qual`]}</V></> : null}</span>
    </div>
  );
  const SN2 = (k: string) => <><M on={d[k] === 'Sim'} /> Sim &nbsp; <M on={d[k] === 'Não'} /> Não</>;
  return (
    <div className="ficha-a4s">
      <article className="a4">
        <Cabecalho />
        <h2>CADASTRO DE INTERESSE DE VAGA PARA EDUCAÇÃO INFANTIL E MATRÍCULA</h2>
        <h3>DADOS DA CRIANÇA</h3>
        <div className="box">
          <G cols="579px 1fr"><C r="Nome da criança" v={d.nome} /><C r="Sexo" v={d.sexo} /></G>
          <G cols="164px 1fr"><C r="Data de nascimento" v={d.nascimento} /><C r="Nº registro de nascimento" v={d.registro} /></G>
          <G cols="1fr"><C r="Cartão SUS" v={d.sus} /></G>
          <Cor valor={d.cor} />
        </div>
        <Pessoa d={d} p="mae" titulo="CADASTRO DA MÃE OU RESPONSÁVEL" nomeSufixo={d.maeParentesco ? ` (${d.maeParentesco.toLowerCase()})` : ''} />
        <Pessoa d={d} p="pai" titulo="CADASTRO DO PAI" />
        <h3>MORADIA</h3>
        <div className="box"><G cols="1fr"><C r="Endereço" v={d.endereco} /></G></div>
        <h2 className="sec">COMPOSIÇÃO FAMILIAR E SITUAÇÃO SÓCIA-ECONÔMICA</h2>
        <table className="fam">
          <thead><tr><th>Parentesco</th><th>Nome</th><th>Idade</th><th>Escolaridade</th><th>Ocupação</th></tr></thead>
          <tbody>
            {Array.from({ length: Math.max(6, fam.length) }, (_, i) => {
              const x = fam[i] as Record<string, string> | undefined;
              return <tr key={i}><td>{x?.parentesco}</td><td>{x?.nome}</td><td>{x?.idade}</td><td>{x?.esc}</td><td>{x?.oc}</td></tr>;
            })}
          </tbody>
        </table>
        {rodape(1)}
      </article>
      <article className="a4">
        <Cabecalho />
        <h2>HISTÓRICO MÉDICO</h2>
        <div className="box">
          <div className="ln pad"><b>UBS/USF UTILIZADA</b>&nbsp; <V>{d.ubs}</V></div>
          {sn('deficiencia', 'Se sim, qual?')}
          <div className="ln saude"><span>{SAUDE.convulsao}</span><span>Sim <M on={d.convulsao === 'Sim'} /></span><span>Não <M on={d.convulsao !== 'Sim'} /></span><span /></div>
          {sn('restricao', 'Qual?/Quais?')}
          {sn('medicamento', 'Qual?/Quais?')}
          {sn('alergia', 'Qual?/Quais?')}
          {sn('cirurgia', 'Qual?/Quais?')}
          {sn('problema', 'Qual?/Quais?')}
        </div>
        <div className="box mt">
          <div className="ln pad"><b>Pessoas autorizadas a buscar a criança na escola:</b></div>
          {[0, 1, 2, 3].map(i => {
            const x = aut[i] as Record<string, string> | undefined;
            return (
              <G key={i} cols="290px 140px 1fr">
                <div className="c mid"><b>{i + 1}.</b>&nbsp; {x?.nome && <V>{x.nome}</V>}</div>
                <div className="c"><small><b>Parentesco</b></small>{x?.parentesco ? <V>{x.parentesco}</V> : <span className="vz">&nbsp;</span>}</div>
                <div className="c"><small><b>Telefone</b></small><V>{x?.telefone || '(    )'}</V></div>
              </G>
            );
          })}
          <div className="ln pad"><b>Observações:</b>&nbsp; <V>{d.observacoes}</V></div>
        </div>
        <h3 className="gr">AUTORIZAÇÃO</h3>
        <div className="box negrito">
          <div className="ln pad"><span className="w1">Educação Física</span> {SN2('edfisica')}</div>
          <div className="ln pad"><span className="w1">Aplicação tópica de Flúor</span> {SN2('fluor')}</div>
          <div className="ln pad">Utilização de imagens para a divulgação de atividades promovidas pela unidade escolar:</div>
          <div className="ln pad">{SN2('imagem')} &nbsp;&nbsp; Assinatura Responsável:</div>
        </div>
        <h3 className="gr">Matrícula</h3>
        <div className="box negrito">
          <G cols="340px 1fr"><C r="Data de matricula" v={d.dataMatricula} /><C r="Responsável" v="Mariana Souza" /></G>
        </div>
        <h3 className="gr">Desligamento e transferência</h3>
        <div className="box negrito">
          <G cols="340px 1fr"><div className="c"><small>Desligamento</small><V>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp; 20</V></div><C r="Responsável" /></G>
          <div className="ln pad">Motivo</div>
          <G cols="340px 1fr"><div className="c"><small>Transferência</small><V>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp; 20</V></div><C r="Responsável" /></G>
          <div className="ln pad">Para</div>
        </div>
        <p className="cidade">São Carlos, {dataPorExtenso(aluno.matricula?.preenchidaEm ?? hoje())}.</p>
        <div className="assinaturas"><span>Assinatura mãe/responsável</span><span>Assinatura do dirigente/ Pedagoga</span></div>
        {rodape(2)}
      </article>
    </div>
  );
}
const SAUDE: Record<string, string> = {
  deficiencia: 'A criança possui alguma deficiência?', convulsao: 'Tem ou teve crise convulsiva', restricao: 'Tem restrição alimentar',
  medicamento: 'Toma medicamento de forma contínua', alergia: 'Tem alergia', cirurgia: 'Sofreu cirurgia', problema: 'Problema de saúde',
};
