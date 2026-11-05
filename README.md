# Sistema de Gestão de Alunos · protótipo

Protótipo navegável da Casa da Infância Estrela da Manhã. Sem backend: os dados são fictícios e ficam no navegador.

## Como rodar

```bash
npm install
npm run dev      # abre em http://localhost:5173
npm run build    # gera dist/
```

Melhor visto em tela de 1440 px. O protótipo foi feito só para computador.

## Rotas principais

| Rota | Tela |
| --- | --- |
| `#/` | Home |
| `#/alunos` | Lista, busca, seleção, desativar e remover |
| `#/alunos/:id` | Ficha (`?aba=responsaveis`, `turmas`, `documentos`, `historico`) |
| `#/alunos/:id/editar` | Editar cadastro (`?parte=dados`, `saude`…) |
| `#/alunos/matricula` | Escolher modalidade |
| `#/alunos/matricula/:modalidade` | Formulário (`infantil`, `contraturno`, `oficinas`) |
| `#/alunos/:id/concluida` | Matrícula feita |
| `#/alunos/:id/impressao` | Ficha para assinatura |
| `#/turmas`, `#/turmas/lista/:filtro` | Início e listas (`todos`, `infantil`, `contraturno`, `oficinas`) |
| `#/turmas/nova`, `#/turmas/:id/editar` | Nova turma e editar turma |
| `#/turmas/:id` | Turma (`?aba=chamada`, `alunos`, `frequencia`, `dados`) |
| `#/relatorios`, `/personalizado`, `/pronto` | Atalhos, personalizado e relatório pronto |

## O que é simulado

- Usuária fixa: Mariana Souza, Coordenação. "Sair" só volta para a Home.
- O estado fica em memória, com cópia no `localStorage`. "Restaurar dados de exemplo" volta ao início.
- Anexar ficha e documentos guardam só o nome do arquivo.
- "Baixar PDF" da ficha abre a impressão do navegador.
- "Baixar relatório" gera um PDF simples de texto ou, em Excel, um CSV.
- A chamada e a frequência partem de dados gerados na primeira abertura, com as datas de aula mais recentes.

## Decisões sobre os dados

32 alunos fictícios: os 16 da lista do Figma e os da Oficina de Karatê, com mais alguns para popular as turmas. Por isso as contagens e os nomes de turma diferem dos exemplos do Figma: todos os números vêm do store.

## Onde o Figma foi seguido em vez do prompt ou do guia

- Campos com 52 px, não 56 px.
- Janelas de Turmas e Relatórios usam "Voltar" e "Não, manter atalho", não "Cancelar ação".
- Barra de caminho só onde o frame mostra. "Fixar no acesso rápido" só no Relatório personalizado.

## Pontos em aberto (TODO design)

1. **Edição dos atalhos da Home:** sem frame. Usa uma janela no padrão de Relatórios.
2. **"Chamada de hoje":** a nota não diz o destino. Leva para Todas as turmas.
3. **"Sair":** sem tela de login.
4. **Abas da ficha:** Turmas e frequência, Documentos e Histórico não têm frame.
5. **Partes do Editar cadastro:** Modalidade e turma, Saúde, Responsáveis e Documentos não têm frame.
6. **Motivos de desativar aluno:** o Figma só mostra "Mudou de cidade". Os outros são provisórios.
7. **Mensagens de erro da matrícula:** "Preencha este campo.", "Escolha uma opção." e o erro de data são provisórios.
8. **Retomar matrícula pendente:** o clique no aluno volta ao formulário, na etapa salva.
9. **Reativar turma:** sem frame. O botão aparece na aba Dados de uma turma inativa.
10. **Janelas de relatório sem frame:** Declarações, Autorizações, Alunos inativos e Lista de oficinas só confirmam a geração.
11. **Outros tipos no Relatório personalizado:** só Frequência de turma tem frame. Os demais escondem os campos de turma.
12. **Foto da criança:** o cartão aparece nas camadas do Figma, mas não nos screenshots, e ficou de fora.
13. **Ícone de confirmação:** não existe como `Ícone/…` na página 00 Guia. O traço foi feito à parte.
14. **Logo:** usa o `logo 1.png` do projeto, não o vetor do Figma.
