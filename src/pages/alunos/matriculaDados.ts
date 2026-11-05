import type { Aluno, DadosForm, Modalidade } from '../../data/tipos';
import { hoje, horaAgora, idade } from '../../utils/datas';
import { pad } from '../../utils/datas';

export const ETAPAS_INFANTIL = ['Criança', 'Mãe ou responsável', 'Pai', 'Moradia e família', 'Saúde', 'Busca e autorizações'];
export const ETAPAS_CONTRATURNO = ['Criança', 'Responsável', 'Família e benefícios', 'Saúde e desenvolvimento', 'Cursos e autorizações'];
export const CORES = ['Branca', 'Preta', 'Parda', 'Amarela', 'Indígena', 'Não declarada'];
export const ESTADO_CIVIL = ['Solteira(o)', 'Casada(o)', 'União estável', 'Separada(o)', 'Viúva(o)'];
export const ESCOLARIDADE = ['Não estudou', 'Fundamental incompleto', 'Fundamental completo', 'Ensino médio incompleto', 'Ensino médio completo', 'Ensino superior incompleto', 'Ensino superior completo'];
export const PARENTESCOS = ['Mãe', 'Avó', 'Tia', 'Madrasta', 'Responsável legal', 'Outro'];

export function formInicial(m: Modalidade): DadosForm {
  const base = { modalidade: m, temIrmao: 'Não', irmaoId: '', usarMesmos: false, dataMatricula: hoje(), responsavelMatricula: 'Mariana Souza', turma: '', autorizadosExtra: [], familiaExtra: [], imagem: '', observacoes: '' };
  if (m === 'infantil') return { ...base, nome: '', sexo: '', nascimento: '', sus: '', registro: '', cor: '',
    maeNome: '', maeParentesco: 'Mãe', maeNasc: '', maeTel: '', maeRG: '', maeCPF: '', maeEC: '', maeEsc: '', maeCor: '', maeProf: '', maeLocal: '', maeHor: '', maeRenda: '', maeEmerg: true, maeBusca: true,
    paiInfo: 'Sim', paiNome: '', paiNasc: '', paiTel: '', paiRG: '', paiCPF: '', paiEC: '', paiEsc: '', paiCor: '', paiProf: '', paiLocal: '', paiHor: '', paiRenda: '', paiEmerg: false, paiBusca: false,
    endereco: '', ubs: '', deficiencia: 'Não', deficienciaQual: '', convulsao: 'Não', convulsaoQual: '', restricao: 'Não', restricaoQual: '', medicamento: 'Não', medicamentoQual: '', alergia: 'Não', alergiaQual: '', cirurgia: 'Não', cirurgiaQual: '', problema: 'Não', problemaQual: '',
    edfisica: '', fluor: '' };
  return { ...base, nome: '', nascimento: '', rg: '', cpf: '', endereco: '', estuda: '', escola: '', serie: '',
    respParentesco: '', respParentescoQual: '', respNome: '', respNasc: '', respTel: '', respRecado: '', respRG: '', respCPF: '', respProf: '', respLocal: '', respHor: '', respEmerg: true, respBusca: true, respEsc: '',
    beneficios: [], beneficiosQual: '',
    deficiencia: 'Não', deficienciaQual: '', aprendizagem: 'Não', aprendizagemQual: '', fala: ['Não'], convulsao: 'Não', refeicoes: [], alergia: 'Não', alergiaQual: '', medicamento: 'Não', medicamentoQual: '', respiratoria: ['Não'],
    cursos: [], cursosQual: '', sozinho: '', respAssina: '' };
}

export const nomeResp = (d: DadosForm) => (d.modalidade === 'infantil' ? d.maeNome : d.respNome);
export const parentescoResp = (d: DadosForm) => (d.modalidade === 'infantil' ? d.maeParentesco : d.respParentesco === 'Outro' ? d.respParentescoQual : d.respParentesco);

export function familiaAuto(d: DadosForm, irmao?: Aluno) {
  const l: { parentesco: string; nome: string; idade: string; esc: string; oc: string }[] = [];
  if (d.modalidade === 'infantil') {
    if (d.maeNome) l.push({ parentesco: d.maeParentesco || 'Mãe', nome: d.maeNome, idade: String(idade(d.maeNasc) ?? ''), esc: d.maeEsc, oc: d.maeProf });
    if (d.paiInfo === 'Sim' && d.paiNome) l.push({ parentesco: 'Pai', nome: d.paiNome, idade: String(idade(d.paiNasc) ?? ''), esc: d.paiEsc, oc: d.paiProf });
  } else if (d.respNome) {
    l.push({ parentesco: parentescoResp(d) || 'Responsável', nome: d.respNome, idade: String(idade(d.respNasc) ?? ''), esc: d.respEsc, oc: d.respProf });
  }
  if (irmao) l.push({ parentesco: irmao.sexo === 'Feminino' ? 'Irmã' : 'Irmão', nome: irmao.nome, idade: String(idade(irmao.nascimento) ?? ''), esc: '', oc: 'Estudante' });
  return l;
}

export function autorizadosAuto(d: DadosForm) {
  const l: { nome: string; parentesco: string; telefone: string }[] = [];
  if (d.modalidade === 'infantil') {
    if (d.maeNome && d.maeBusca) l.push({ nome: d.maeNome, parentesco: d.maeParentesco, telefone: d.maeTel });
    if (d.paiInfo === 'Sim' && d.paiNome && d.paiBusca) l.push({ nome: d.paiNome, parentesco: 'Pai', telefone: d.paiTel });
  } else if (d.respNome && d.respBusca) l.push({ nome: d.respNome, parentesco: parentescoResp(d), telefone: d.respTel });
  return l;
}

export function pendenciasDe(d: DadosForm): string[] {
  if (d.modalidade === 'infantil') return [...(d.sus ? [] : ['Cartão SUS da criança']), ...(d.maeCPF ? [] : [d.maeParentesco === 'Mãe' ? 'CPF da mãe' : 'CPF do responsável'])];
  return [...(d.cpf ? [] : ['CPF da criança']), ...(d.respCPF ? [] : ['CPF do responsável'])];
}

const rendaNum = (s?: string) => Number((s ?? '').replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '')) || 0;
export const rendaFamilia = (d: DadosForm) => rendaNum(d.maeRenda) + (d.paiInfo === 'Sim' ? rendaNum(d.paiRenda) : 0);
export const reais = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function respostaSaude(d: DadosForm, k: string) { return d[k] === 'Sim' ? d[`${k}Qual`] : ''; }

export function montarAluno(d: DadosForm, id: string, numero: number, status: 'Ativo' | 'Pendente', etapa: number, base?: Aluno): Aluno {
  const infantil = d.modalidade === 'infantil';
  const resps = infantil
    ? [{ nome: d.maeNome, parentesco: d.maeParentesco || 'Mãe', telefone: d.maeTel, documento: d.maeCPF ? `CPF ${d.maeCPF}` : d.maeRG ? `RG ${d.maeRG}` : '' }, ...(d.paiInfo === 'Sim' && d.paiNome ? [{ nome: d.paiNome, parentesco: 'Pai', telefone: d.paiTel, documento: d.paiCPF ? `CPF ${d.paiCPF}` : d.paiRG ? `RG ${d.paiRG}` : '' }] : [])]
    : [{ nome: d.respNome, parentesco: parentescoResp(d), telefone: d.respTel, documento: d.respCPF ? `CPF ${d.respCPF}` : d.respRG ? `RG ${d.respRG}` : '' }];
  const emerg = infantil
    ? [...(d.maeEmerg && d.maeNome ? [{ nome: `${d.maeNome} (${(d.maeParentesco || 'mãe').toLowerCase()})`, telefone: d.maeTel }] : []), ...(d.paiInfo === 'Sim' && d.paiEmerg && d.paiNome ? [{ nome: `${d.paiNome} (pai)`, telefone: d.paiTel }] : [])]
    : (d.respEmerg && d.respNome ? [{ nome: `${d.respNome} (${(parentescoResp(d) || 'responsável').toLowerCase()})`, telefone: d.respTel }] : []);
  const aut = [...autorizadosAuto(d), ...d.autorizadosExtra.filter((x: { nome: string }) => x.nome)].map((x: { nome: string; parentesco: string; telefone: string }, i: number) => ({ nome: x.nome, parentesco: (x.parentesco || '').toLowerCase(), documento: i === 0 ? 'Responsável legal' : '', telefone: x.telefone }));
  const condicao = infantil
    ? [respostaSaude(d, 'problema'), respostaSaude(d, 'deficiencia'), respostaSaude(d, 'restricao'), respostaSaude(d, 'medicamento') && `Medicamento: ${d.medicamentoQual}`].filter(Boolean).join('. ')
    : [respostaSaude(d, 'deficiencia'), respostaSaude(d, 'medicamento') && `Medicamento: ${d.medicamentoQual}`].filter(Boolean).join('. ');
  const pend = pendenciasDe(d);
  const agora = hoje();
  const irmaos = d.temIrmao === 'Sim' && d.irmaoId ? [d.irmaoId] : [];
  return {
    id, nome: d.nome || 'Criança sem nome', nascimento: d.nascimento, sexo: d.sexo ?? '', status, modalidade: d.modalidade, turmaIds: status === 'Ativo' && d.turma ? [d.turma] : [],
    cpf: d.cpf ?? '', endereco: d.endereco, escola: d.estuda === 'Sim' ? `${d.escola}${d.serie ? ` · ${d.serie}` : ''}` : '', roupa: '',
    imagem: d.imagem === 'Sim' ? `Sim · assinado em ${agora}` : d.imagem === 'Não' ? 'Não' : '',
    irmaos, responsaveis: resps, autorizados: aut, emergencia: emerg, alergia: d.alergia === 'Sim' ? d.alergiaQual : '', condicao,
    documentos: [...pend.map(p => ({ nome: p, situacao: 'Pendente' as const }))],
    historico: base?.historico ?? [{ data: agora, texto: status === 'Ativo' ? 'Matrícula feita.' : 'Matrícula começada.' }],
    ...(status === 'Ativo'
      ? { matricula: { numero: `${new Date().getFullYear()}-${pad(Math.floor(numero / 100))}${pad(numero % 100)}`, preenchidaEm: agora, preenchidaHora: horaAgora(), dados: d } }
      : { rascunho: { etapa, dados: d } }),
  };
}
