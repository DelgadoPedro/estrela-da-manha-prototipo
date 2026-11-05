import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/store';
import { BarraCaminho, Pagina } from '../../components/Layout';
import { Botao } from '../../components/Botao';
import { Icone } from '../../components/Icone';
import { CaixaAviso } from '../../components/Lista';
import { BotoesJanela, JanelaConfirmacao } from '../../components/Janela';
import { Campo, GrupoOpcoes } from '../../components/Campo';
import { CATALOGO, tipoDe } from '../../data/relatorios';
import { JanelaAdicionarAtalho, JanelaGerar, useGerar } from './comum';
import type { AtalhoRel } from '../../data/tipos';

function JanelaMudar({ atalho, fechar, tirar }: { atalho: AtalhoRel; fechar: () => void; tirar: () => void }) {
  const { s, d, aviso } = useStore();
  const [nome, setNome] = useState(atalho.nome);
  const [tipo, setTipo] = useState(atalho.tipo);
  const opcoes = CATALOGO.filter(c => c.tipo === atalho.tipo || !s.atalhosRel.some(a => a.tipo === c.tipo)).map(c => ({ v: c.tipo, t: c.nome }));
  return (
    <JanelaConfirmacao titulo={`Mudar atalho ${atalho.nome}`} texto="Troque o nome ou o relatório deste atalho." icone="editar" fechar={fechar} largura={720}>
      <div className="pilha">
        <Campo rotulo="Nome no atalho" obrigatorio valor={nome} onChange={setNome} />
        <GrupoOpcoes rotulo="Qual relatório?" obrigatorio valor={tipo} opcoes={opcoes} onChange={v => { setTipo(v); if (nome === tipoDe(tipo).nome) setNome(tipoDe(v).nome); }} />
      </div>
      <BotoesJanela>
        <Botao tipo="perigo" largo icone="lixeira" onClick={tirar}>Tirar atalho</Botao>
        <Botao tipo="secundario" largo icone="voltar" onClick={fechar}>Voltar</Botao>
        <Botao largo icone="salvar" disabled={!nome.trim()} onClick={() => { d({ t: 'atalhosRel', lista: s.atalhosRel.map(a => (a.id === atalho.id ? { ...a, nome: nome.trim(), tipo } : a)) }); aviso('Atalho salvo'); fechar(); }}>Salvar atalho</Botao>
      </BotoesJanela>
    </JanelaConfirmacao>
  );
}

export default function RelatoriosInicio() {
  const { s, d, aviso } = useStore();
  const nav = useNavigate();
  const gerar = useGerar();
  const [editando, setEditando] = useState(false);
  const [gerarTipo, setGerarTipo] = useState<string | null>(null);
  const [adicionar, setAdicionar] = useState(false);
  const [mudar, setMudar] = useState<AtalhoRel | null>(null);
  const [tirar, setTirar] = useState<AtalhoRel | null>(null);
  return (
    <Pagina fixa className={`relatorios-inicio ${editando ? 'editando' : ''}`}>
      <BarraCaminho onVoltar={() => (editando ? setEditando(false) : nav('/'))} />
      <div className="linha-titulo">
        <div>
          <h1 className="titulo-40">Relatórios</h1>
          <p className="subtitulo-18">{editando ? 'Mude ou tire os atalhos que você não usa mais' : 'Escolha um atalho para gerar o relatório na hora'}</p>
        </div>
        {editando ? <Botao icone="documento" onClick={() => setEditando(false)}>Concluir edição</Botao> : <Botao icone="relatorios" para="/relatorios/personalizado">Relatório personalizado</Botao>}
      </div>
      {editando && <CaixaAviso icone="info" texto="Toque em Mudar para trocar o relatório do atalho, ou em Tirar para tirá-lo desta tela." />}
      <div className="atalhos-area">
        <div className="atalhos-grupo">
          <div className="atalhos-cabecalho">
            <h2><Icone nome="estrela" tam={22} />Relatórios mais pedidos</h2>
            {!editando && <Botao tipo="discreto" icone="editar" onClick={() => setEditando(true)}>Editar atalhos</Botao>}
          </div>
          <div className="atalhos-grade">
            {s.atalhosRel.map(a => {
              const c = tipoDe(a.tipo);
              const corpo = <><span className="atalho-icone"><Icone nome={c.icone} tam={38} largura={1.6} /></span><span className="atalho-textos"><b>{a.nome}</b><small>{c.sub}</small></span></>;
              return editando ? (
                <div className="atalho-rel edicao" key={a.id}>
                  <div className="atalho-conteudo">{corpo}</div>
                  <div className="atalho-acoes">
                    <Botao tipo="secundario" icone="editar" largo onClick={() => setMudar(a)} rotulo={`Mudar ${a.nome}`}>Mudar</Botao>
                    <Botao tipo="perigo" icone="lixeira" largo onClick={() => setTirar(a)} rotulo={`Tirar ${a.nome}`}>Tirar</Botao>
                  </div>
                </div>
              ) : (
                <button type="button" className="atalho-rel" key={a.id} onClick={() => setGerarTipo(a.tipo)}><span className="atalho-conteudo">{corpo}</span></button>
              );
            })}
            <button type="button" className="atalho-rel adicionar" onClick={() => setAdicionar(true)}>
              <span className="atalho-conteudo">
                <span className="atalho-icone"><Icone nome="adicionar" tam={38} largura={1.6} /></span>
                <span className="atalho-textos"><b>Adicionar atalho</b><small>Escolher um relatório</small></span>
              </span>
            </button>
          </div>
        </div>
      </div>
      {gerarTipo && <JanelaGerar tipo={gerarTipo} fechar={() => setGerarTipo(null)} gerar={p => { gerar(p); nav('/relatorios/pronto'); }} />}
      {adicionar && <JanelaAdicionarAtalho fechar={() => setAdicionar(false)} />}
      {mudar && <JanelaMudar atalho={mudar} fechar={() => setMudar(null)} tirar={() => { setTirar(mudar); setMudar(null); }} />}
      {tirar && (
        <JanelaConfirmacao titulo={`Tirar o atalho ${tirar.nome}?`} texto="O atalho some desta tela. Você ainda pode gerar esse relatório em Relatório personalizado." icone="lixeira" perigo fechar={() => setTirar(null)} largura={720}>
          <BotoesJanela>
            <Botao tipo="secundario" largo onClick={() => setTirar(null)}>Não, manter atalho</Botao>
            <Botao tipo="perigo-cheio" largo onClick={() => { d({ t: 'atalhosRel', lista: s.atalhosRel.filter(a => a.id !== tirar.id) }); aviso('Atalho tirado'); setTirar(null); }}>Sim, tirar atalho</Botao>
          </BotoesJanela>
        </JanelaConfirmacao>
      )}
    </Pagina>
  );
}
