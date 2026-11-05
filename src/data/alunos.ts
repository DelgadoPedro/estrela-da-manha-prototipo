import type { Aluno, Modalidade, StatusAluno, Responsavel, Autorizado } from './tipos';

type Base = Partial<Aluno> & { id: string; nome: string; nascimento: string; sexo: string; modalidade: Modalidade; turmaIds: string[]; status?: StatusAluno };

const MAES = ['Cláudia', 'Renata', 'Patrícia', 'Simone', 'Fernanda', 'Adriana', 'Luciana', 'Tatiane', 'Camila'];

// TODO(design): só Matheus e Laura aparecem em detalhe no Figma. Os dados dos outros alunos são fictícios.
function aluno(b: Base, sobrenomeResp: string, tel: string): Aluno {
  const mae = MAES[b.nome.length % MAES.length];
  const resp: Responsavel = { nome: `${mae} ${sobrenomeResp}`, parentesco: 'Mãe', telefone: tel, documento: 'RG 22.345.678-1' };
  return {
    status: 'Ativo', cpf: '', endereco: 'Rua Episcopal, 1200, Centro', escola: '', roupa: '8 / 31',
    imagem: 'Sim · assinado em 02/02/2026', irmaos: [], responsaveis: [resp],
    autorizados: [{ nome: resp.nome, parentesco: 'mãe', documento: 'Responsável legal' }],
    emergencia: [{ nome: `${resp.nome} (mãe)`, telefone: tel }], alergia: '', condicao: '',
    documentos: [{ nome: 'Certidão de nascimento', situacao: 'Entregue' }, { nome: 'CPF da criança', situacao: 'Pendente' }],
    historico: [{ data: '02/02/2026', texto: 'Matrícula feita.' }],
    ...b,
  };
}

const anaLima: Responsavel = { nome: 'Ana Lima Santos', parentesco: 'Mãe', telefone: '(16) 98122-4410', documento: '' };
const mariaLima: Responsavel = { nome: 'Maria Lima', parentesco: 'Avó', telefone: '(16) 99843-1207', documento: 'RG 12.345.678-9' };
const joseLima: Responsavel = { nome: 'José Lima', parentesco: 'Tio', telefone: '(16) 99211-3080', documento: 'CNH 01234567890' };
const autorizadosLima: Autorizado[] = [
  { nome: 'Ana Lima', parentesco: 'mãe', documento: 'Responsável legal', telefone: anaLima.telefone },
  { nome: 'Maria Lima', parentesco: 'avó', documento: 'RG 12.345.678-9', telefone: mariaLima.telefone },
  { nome: 'José Lima', parentesco: 'tio', documento: 'CNH 01234567890', telefone: joseLima.telefone },
];
const emergenciaLima = [{ nome: 'Ana Lima (mãe)', telefone: anaLima.telefone }, { nome: 'Maria Lima (avó)', telefone: mariaLima.telefone }];

export function alunosIniciais(): Aluno[] {
  return [
    aluno({ id: 'andre-rodrigues', nome: 'André Rodrigues', nascimento: '11/06/2017', sexo: 'Masculino', modalidade: 'contraturno', turmaIds: ['manha-a'], escola: 'EMEF Prof. Ana Maria (tarde)' }, 'Rodrigues', '(16) 99120-3341'),
    aluno({ id: 'beatriz-oliveira', nome: 'Beatriz Oliveira', nascimento: '02/09/2022', sexo: 'Feminino', modalidade: 'infantil', turmaIds: ['1b'] }, 'Oliveira', '(16) 99305-1180'),
    aluno({ id: 'caio-costa', nome: 'Caio Costa', nascimento: '25/01/2015', sexo: 'Masculino', modalidade: 'oficinas', turmaIds: ['teatro', 'karate'] }, 'Costa', '(16) 99412-7765'),
    aluno({ id: 'davi-nascimento', nome: 'Davi Nascimento', nascimento: '19/04/2023', sexo: 'Masculino', modalidade: 'infantil', turmaIds: ['1a'], status: 'Pendente' }, 'Nascimento', '(16) 99740-2219'),
    aluno({ id: 'eduarda-santos', nome: 'Eduarda Santos', nascimento: '30/08/2016', sexo: 'Feminino', modalidade: 'contraturno', turmaIds: ['tarde-b'] }, 'Santos', '(16) 98877-0043'),
    aluno({ id: 'gabriel-moreira', nome: 'Gabriel Moreira', nascimento: '07/12/2014', sexo: 'Masculino', modalidade: 'oficinas', turmaIds: ['musica'], status: 'Inativo', desativacao: { data: '15/09/2026', motivo: 'mudou de escola' } }, 'Moreira', '(16) 99230-5512'),
    aluno({ id: 'isabela-ferreira', nome: 'Isabela Ferreira', nascimento: '13/02/2021', sexo: 'Feminino', modalidade: 'infantil', turmaIds: ['2a'], alergia: 'Leite de vaca.' }, 'Ferreira', '(16) 99611-8820'),
    aluno({ id: 'joana-martins', nome: 'Joana Martins', nascimento: '21/10/2017', sexo: 'Feminino', modalidade: 'contraturno', turmaIds: ['tarde-b'] }, 'Martins', '(16) 99188-3307'),
    aluno({ id: 'joao-pedro-silva', nome: 'João Pedro Silva', nascimento: '05/05/2016', sexo: 'Masculino', modalidade: 'contraturno', turmaIds: ['manha-a'], status: 'Pendente' }, 'Silva', '(16) 99502-6631'),
    {
      ...aluno({ id: 'laura-lima', nome: 'Laura Lima', nascimento: '09/06/2017', sexo: 'Feminino', modalidade: 'contraturno', turmaIds: ['tarde-b', 'karate'], irmaos: ['matheus-lima-santos'], endereco: 'Rua das Flores, 120, Jardim Paulista', escola: 'EMEF Jardim Paulista (manhã)' }, 'Lima', anaLima.telefone),
      responsaveis: [anaLima, mariaLima, joseLima], autorizados: autorizadosLima, emergencia: emergenciaLima,
    },
    aluno({ id: 'lucas-bernardo-souza', nome: 'Lucas Bernardo Souza', nascimento: '17/03/2014', sexo: 'Masculino', modalidade: 'oficinas', turmaIds: ['musica'], status: 'Inativo', desativacao: { data: '20/08/2026', motivo: 'mudou de cidade' } }, 'Souza', '(16) 98440-9921'),
    aluno({ id: 'maria-jose-fernandes', nome: 'Maria José Fernandes', nascimento: '28/07/2015', sexo: 'Feminino', modalidade: 'oficinas', turmaIds: ['artes'] }, 'Fernandes', '(16) 99731-4410'),
    {
      ...aluno({ id: 'matheus-lima-santos', nome: 'Matheus Lima Santos', nascimento: '14/03/2020', sexo: 'Masculino', modalidade: 'infantil', turmaIds: ['2a', 'musica'], irmaos: ['laura-lima'], endereco: 'Rua das Flores, 120, Jardim Paulista', escola: 'EMEI Jardim Paulista (manhã)', roupa: '6 / 29', alergia: 'Picada de abelha. Reação forte.', condicao: 'Asma. Bombinha fica na mochila.' }, 'Lima', anaLima.telefone),
      responsaveis: [anaLima, mariaLima, joseLima], autorizados: autorizadosLima, emergencia: emergenciaLima,
      historico: [{ data: '02/02/2026', texto: 'Matrícula feita na Turma 2A.' }, { data: '02/02/2026', texto: 'Uso de imagem autorizado.' }, { data: '09/03/2026', texto: 'Entrou na Oficina de Música.' }],
    },
    aluno({ id: 'pedro-henrique-alves', nome: 'Pedro Henrique Alves', nascimento: '12/02/2017', sexo: 'Masculino', modalidade: 'contraturno', turmaIds: ['manha-a'] }, 'Alves', '(16) 99624-1188'),
    aluno({ id: 'sofia-ribeiro', nome: 'Sofia Ribeiro', nascimento: '01/11/2022', sexo: 'Feminino', modalidade: 'infantil', turmaIds: ['1b'] }, 'Ribeiro', '(16) 99417-2206'),
    aluno({ id: 'victor-pereira', nome: 'Victor Pereira', nascimento: '23/06/2022', sexo: 'Masculino', modalidade: 'infantil', turmaIds: ['1b'] }, 'Pereira', '(16) 98230-1175'),
    aluno({ id: 'ana-beatriz-souza', nome: 'Ana Beatriz Souza', nascimento: '10/04/2015', sexo: 'Feminino', modalidade: 'oficinas', turmaIds: ['karate'] }, 'Souza', '(16) 99321-4550'),
    aluno({ id: 'bruno-henrique-lima', nome: 'Bruno Henrique Lima', nascimento: '03/07/2014', sexo: 'Masculino', modalidade: 'oficinas', turmaIds: ['karate'] }, 'Lima', '(16) 99210-8843'),
    aluno({ id: 'camila-ferreira', nome: 'Camila Ferreira', nascimento: '22/11/2015', sexo: 'Feminino', modalidade: 'oficinas', turmaIds: ['karate', 'artes'] }, 'Ferreira', '(16) 98765-2201'),
    aluno({ id: 'davi-oliveira', nome: 'Davi Oliveira', nascimento: '16/02/2016', sexo: 'Masculino', modalidade: 'oficinas', turmaIds: ['karate'] }, 'Oliveira', '(16) 99188-7012'),
    aluno({ id: 'eduarda-martins', nome: 'Eduarda Martins', nascimento: '29/05/2014', sexo: 'Feminino', modalidade: 'oficinas', turmaIds: ['karate', 'teatro'] }, 'Martins', '(16) 99455-3390'),
    aluno({ id: 'felipe-costa', nome: 'Felipe Costa', nascimento: '08/08/2015', sexo: 'Masculino', modalidade: 'oficinas', turmaIds: ['karate'] }, 'Costa', '(16) 99660-1278'),
    aluno({ id: 'gabriela-rocha', nome: 'Gabriela Rocha', nascimento: '14/10/2016', sexo: 'Feminino', modalidade: 'oficinas', turmaIds: ['karate', 'circo'] }, 'Rocha', '(16) 99104-6631'),
    aluno({ id: 'heitor-almeida', nome: 'Heitor Almeida', nascimento: '31/01/2015', sexo: 'Masculino', modalidade: 'oficinas', turmaIds: ['karate'] }, 'Almeida', '(16) 98812-4407'),
    aluno({ id: 'isabela-nunes', nome: 'Isabela Nunes', nascimento: '26/03/2016', sexo: 'Feminino', modalidade: 'oficinas', turmaIds: ['karate', 'circo'] }, 'Nunes', '(16) 99372-1195'),
    aluno({ id: 'joao-pedro-santos', nome: 'João Pedro Santos', nascimento: '18/09/2014', sexo: 'Masculino', modalidade: 'oficinas', turmaIds: ['karate', 'teatro'] }, 'Santos', '(16) 99540-7762'),
    aluno({ id: 'sofia-martins', nome: 'Sofia Martins', nascimento: '06/12/2020', sexo: 'Feminino', modalidade: 'infantil', turmaIds: ['2a'] }, 'Martins', '(16) 99823-0041'),
    aluno({ id: 'lucas-barbosa', nome: 'Lucas Barbosa', nascimento: '12/07/2016', sexo: 'Masculino', modalidade: 'contraturno', turmaIds: ['tarde-a'] }, 'Barbosa', '(16) 99276-5583'),
    aluno({ id: 'helena-duarte', nome: 'Helena Duarte', nascimento: '20/04/2019', sexo: 'Feminino', modalidade: 'oficinas', turmaIds: ['teatro'] }, 'Duarte', '(16) 99631-2274'),
    aluno({ id: 'theo-azevedo', nome: 'Theo Azevedo', nascimento: '15/08/2023', sexo: 'Masculino', modalidade: 'infantil', turmaIds: ['1a'] }, 'Azevedo', '(16) 99158-3320'),
    aluno({ id: 'alice-mendes', nome: 'Alice Mendes', nascimento: '27/01/2017', sexo: 'Feminino', modalidade: 'contraturno', turmaIds: ['manha-b', 'artes'] }, 'Mendes', '(16) 99407-6615'),
    aluno({ id: 'rafael-teixeira', nome: 'Rafael Teixeira', nascimento: '04/03/2016', sexo: 'Masculino', modalidade: 'contraturno', turmaIds: ['manha-b'] }, 'Teixeira', '(16) 98963-2048'),
  ];
}
