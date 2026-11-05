import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EstrelaCheia, Icone } from '../../components/Icone';
import { Ilustracao } from '../../components/Ilustracao';
import { Botao } from '../../components/Botao';
import { BotoesJanela, JanelaConfirmacao } from '../../components/Janela';
import { CampoSelect } from '../../components/Campo';
import { Pagina } from '../../components/Layout';
import { ATALHOS_HOME, useStore } from '../../store/store';
import type { NomeIcone } from '../../components/icones';

/** TODO(design): o Figma não desenha a edição dos atalhos da Home. Usa o mesmo padrão das janelas de atalho de Relatórios. */
export function EditarAtalhosHome({ fechar }: { fechar: () => void }) {
  const { s, d, aviso } = useStore();
  const [ids, setIds] = useState([...s.atalhosHome, '', '', ''].slice(0, 3));
  const opcoes = ATALHOS_HOME.map(a => ({ v: a.id, t: a.nome }));
  const salvar = () => {
    const unicos = [...new Set(ids.filter(Boolean))];
    d({ t: 'atalhosHome', ids: unicos });
    aviso('Atalhos salvos');
    fechar();
  };
  return (
    <JanelaConfirmacao titulo="Editar atalhos" icone="estrela" fechar={fechar} largura={560}>
      <div className="pilha">
        {ids.map((v, i) => (
          <CampoSelect key={i} rotulo={`Atalho ${i + 1}`} valor={v} vazio="Sem atalho" opcoes={opcoes} onChange={nv => setIds(ids.map((x, j) => (j === i ? nv : x)))} />
        ))}
      </div>
      <BotoesJanela>
        <Botao tipo="secundario" largo onClick={fechar}>Cancelar ação</Botao>
        <Botao largo onClick={salvar}>Salvar atalhos</Botao>
      </BotoesJanela>
    </JanelaConfirmacao>
  );
}

export default function Home() {
  const { s } = useStore();
  const [editando, setEditando] = useState(false);
  const atalhos = s.atalhosHome.map(id => ATALHOS_HOME.find(a => a.id === id)).filter(Boolean) as typeof ATALHOS_HOME;
  return (
    <Pagina fixa className="home">
      <h1 className="sr-only">Home</h1>
      <div className="secoes-home">
        <Link className="botao-secao" to="/alunos"><Ilustracao nome="Alunos" /><span>Alunos</span></Link>
        <Link className="botao-secao" to="/turmas"><Ilustracao nome="Turmas" /><span>Turmas</span></Link>
        <Link className="botao-secao" to="/relatorios"><Ilustracao nome="Relatorios" /><span>Relatórios</span></Link>
      </div>
      <section className="acesso-rapido" aria-label="Acesso rápido">
        <span className="acesso-titulo"><EstrelaCheia />Acesso rápido</span>
        {atalhos.map(a => <Link key={a.id} className="atalho" to={a.para}><Icone nome={a.icone as NomeIcone} tam={18} />{a.nome}</Link>)}
        <span className="espaco" />
        <button type="button" className="botao botao-discreto editar-atalhos" onClick={() => setEditando(true)}><Icone nome="editar" tam={18} />Editar atalhos</button>
      </section>
      {editando && <EditarAtalhosHome fechar={() => setEditando(false)} />}
    </Pagina>
  );
}
