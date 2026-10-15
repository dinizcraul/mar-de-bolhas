import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Check,
  ChevronDown,
  Copy,
  Download,
  LogOut,
  MessageCircle,
  PackageCheck,
  RefreshCw,
  Search,
  Truck,
  Undo2,
  X,
} from 'lucide-react'
import Logo from './Logo'
import { brl } from '../compra'
import { marca } from '../data'

// Página de pedidos (/pedidos ou #admin): só abre com a senha ADMIN_SENHA cadastrada no Cloudflare.
// No iPhone, no Safari: Compartilhar > Adicionar à Tela de Início, e ela abre como um app.
// Os pedidos vêm do banco D1 pelo worker/index.js.

const GUARDA = 'mar-de-bolhas:admin'

function lerSenha() {
  try {
    return localStorage.getItem(GUARDA) || ''
  } catch {
    return ''
  }
}

function guardarSenha(senha) {
  try {
    if (senha) localStorage.setItem(GUARDA, senha)
    else localStorage.removeItem(GUARDA)
  } catch {
    // sem armazenamento: pede a senha de novo na próxima vez
  }
}

async function api(caminho, senha, opcoes = {}) {
  const resposta = await fetch(caminho, {
    ...opcoes,
    headers: { authorization: `Bearer ${senha}`, 'content-type': 'application/json', ...opcoes.headers },
  })
  const dados = await resposta.json().catch(() => ({}))
  if (!resposta.ok) throw Object.assign(new Error(dados.erro || 'falha'), { status: resposta.status, codigo: dados.erro })
  return dados
}

const mensagensErro = {
  'senha-errada': 'Senha errada.',
  'senha-nao-configurada': 'A senha ainda não foi cadastrada no Cloudflare (segredo ADMIN_SENHA).',
}

// Em que pé está cada pedido, na ordem em que o trabalho acontece
function etapaDe(p) {
  if (p.status === 'aguardando') return p.avisou_pagamento_em ? 'conferir' : 'aguardando'
  return p.status
}

const etapas = {
  conferir: { nome: 'Conferir Pix', curto: 'Conferir Pix', classe: 'st-conferir' },
  aguardando: { nome: 'Aguardando Pix', curto: 'Aguardando', classe: 'st-aguardando' },
  pago: { nome: 'Pago, falta enviar', curto: 'Para enviar', classe: 'st-pago' },
  enviado: { nome: 'Enviado', curto: 'Enviados', classe: 'st-enviado' },
  cancelado: { nome: 'Cancelado', curto: 'Cancelados', classe: 'st-cancelado' },
}

const filtros = ['conferir', 'pago', 'aguardando', 'enviado', 'cancelado']

const dataHora = (iso) =>
  iso
    ? new Date(iso).toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

function haQuanto(iso) {
  const minutos = Math.round((Date.now() - new Date(iso)) / 60000)
  if (minutos < 1) return 'agora'
  if (minutos < 60) return `há ${minutos} min`
  const horas = Math.round(minutos / 60)
  if (horas < 24) return `há ${horas} h`
  const dias = Math.round(horas / 24)
  return dias === 1 ? 'ontem' : `há ${dias} dias`
}

const formataCpf = (d) => d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
const formataTel = (d) => d.replace(/(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3')
const formataCep = (d) => d.replace(/(\d{5})(\d{3})/, '$1-$2')
const enderecoDe = (p) =>
  `${p.rua}, ${p.numero}${p.complemento ? `, ${p.complemento}` : ''} - ${p.bairro}, ${p.cidade}/${p.uf}, CEP ${formataCep(p.cep)}`

function linkWhats(p) {
  const primeiro = p.nome.split(' ')[0]
  const textos = {
    conferir: `Oi, ${primeiro}! Aqui é da ${marca.nome}. Recebemos o seu pedido ${p.codigo}, estou conferindo o Pix e já te aviso.`,
    aguardando: `Oi, ${primeiro}! Aqui é da ${marca.nome}. Vi que o seu pedido ${p.codigo} (${brl(p.total)}) ficou aguardando o Pix. Posso te ajudar com alguma coisa?`,
    pago: `Oi, ${primeiro}! Aqui é da ${marca.nome}. Pagamento do pedido ${p.codigo} confirmado, obrigado! Já estamos separando o seu kit.`,
    enviado: `Oi, ${primeiro}! Aqui é da ${marca.nome}. O seu pedido ${p.codigo} foi enviado${p.rastreio ? `. Código de rastreio: ${p.rastreio}` : ''}. Boas bolhas!`,
    cancelado: `Oi, ${primeiro}! Aqui é da ${marca.nome}, sobre o pedido ${p.codigo}.`,
  }
  return `https://wa.me/55${p.telefone}?text=${encodeURIComponent(textos[etapaDe(p)])}`
}

function baixarCsv(pedidos) {
  const colunas = [
    ['codigo', 'Pedido'],
    ['criado_em', 'Data'],
    ['status', 'Status'],
    ['total', 'Total'],
    ['kit', 'Kit'],
    ['tema', 'Tema'],
    ['frete', 'Entrega'],
    ['nome', 'Nome'],
    ['cpf', 'CPF'],
    ['telefone', 'Celular'],
    ['email', 'E-mail'],
    ['endereco', 'Endereço'],
    ['rastreio', 'Rastreio'],
    ['observacao', 'Observação'],
  ]
  const celula = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const linhas = pedidos.map((p) =>
    colunas
      .map(([c]) =>
        celula(c === 'endereco' ? enderecoDe(p) : c === 'criado_em' ? dataHora(p.criado_em) : c === 'total' ? String(p.total).replace('.', ',') : p[c]),
      )
      .join(';'),
  )
  const csv = '﻿' + [colunas.map(([, n]) => celula(n)).join(';'), ...linhas].join('\n')
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  link.download = `pedidos-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

// ---------- peças ----------

function Entrar({ onEntrar }) {
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [entrando, setEntrando] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setEntrando(true)
    setErro('')
    try {
      const dados = await api('/api/admin/pedidos', senha)
      guardarSenha(senha)
      onEntrar(senha, dados.pedidos)
    } catch (falha) {
      setErro(mensagensErro[falha.codigo] || 'Não deu para abrir os pedidos agora. Confira a internet e tente de novo.')
    } finally {
      setEntrando(false)
    }
  }

  return (
    <main className="adm-entrar">
      <form className="adm-entrar-caixa" onSubmit={enviar}>
        <Logo />
        <h1>Pedidos</h1>
        <div className="campo">
          <label htmlFor="adm-senha">Senha</label>
          <input
            id="adm-senha"
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            aria-invalid={!!erro}
            aria-describedby={erro ? 'adm-erro' : undefined}
            required
          />
          {erro && (
            <p className="campo-erro" id="adm-erro">
              {erro}
            </p>
          )}
        </div>
        <button type="submit" className="botao botao-coral botao-largo" disabled={entrando || !senha}>
          {entrando ? 'Entrando...' : 'Entrar'}
        </button>
        <a href="./" className="ck-link">
          Voltar para o site
        </a>
      </form>
    </main>
  )
}

function Copiar({ texto, rotulo }) {
  const [ok, setOk] = useState(false)
  return (
    <button
      type="button"
      className="adm-copiar"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texto)
          setOk(true)
          setTimeout(() => setOk(false), 2000)
        } catch {
          // sem permissão de copiar: o texto continua visível para selecionar à mão
        }
      }}
    >
      {ok ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
      {ok ? 'Copiado' : rotulo}
    </button>
  )
}

function Pedido({ p, onMudar }) {
  const [rastreio, setRastreio] = useState(p.rastreio || '')
  const [observacao, setObservacao] = useState(p.observacao || '')
  const [salvando, setSalvando] = useState(false)
  const etapa = etapaDe(p)

  async function mudar(dados) {
    setSalvando(true)
    await onMudar(p.codigo, dados)
    setSalvando(false)
  }

  return (
    <details className={`adm-pedido ${etapas[etapa].classe}`}>
      <summary>
        <span className="adm-pedido-linha">
          <strong>{p.nome}</strong>
          <span className="adm-total">{brl(p.total)}</span>
        </span>
        <span className="adm-pedido-linha adm-pedido-meta">
          <span className="adm-selo">{etapas[etapa].nome}</span>
          <span>
            {p.codigo} · {haQuanto(p.criado_em)}
          </span>
          <ChevronDown size={18} aria-hidden="true" className="adm-seta" />
        </span>
      </summary>

      <div className="adm-pedido-corpo">
        {etapa === 'conferir' && (
          <p className="adm-alerta">
            O cliente avisou que pagou em {dataHora(p.avisou_pagamento_em)}. Procure no extrato um Pix de{' '}
            <strong>{brl(p.total)}</strong> com o identificador <strong>{p.codigo}</strong>.
          </p>
        )}

        <dl className="adm-dados">
          <div>
            <dt>Kit</dt>
            <dd>
              {p.kit} · {p.bombas} bombinhas · {p.tema}
            </dd>
          </div>
          <div>
            <dt>Entrega</dt>
            <dd>
              {p.frete} · {p.valor_frete ? brl(p.valor_frete) : 'grátis'}
            </dd>
          </div>
          <div>
            <dt>Feito em</dt>
            <dd>{dataHora(p.criado_em)}</dd>
          </div>
          <div>
            <dt>Celular</dt>
            <dd>
              <a href={`tel:+55${p.telefone}`}>{formataTel(p.telefone)}</a>
            </dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>
              <a href={`mailto:${p.email}`}>{p.email}</a>
            </dd>
          </div>
          <div>
            <dt>CPF</dt>
            <dd>
              {formataCpf(p.cpf)} <Copiar texto={p.cpf} rotulo="Copiar" />
            </dd>
          </div>
          <div className="adm-dados-largo">
            <dt>Endereço</dt>
            <dd>
              {enderecoDe(p)}
              <span className="adm-endereco-acoes">
                <Copiar texto={`${p.nome}\n${enderecoDe(p)}`} rotulo="Copiar endereço" />
              </span>
            </dd>
          </div>
        </dl>

        {(etapa === 'pago' || etapa === 'enviado') && (
          <div className="campo">
            <label htmlFor={`rastreio-${p.codigo}`}>Código de rastreio</label>
            <input
              id={`rastreio-${p.codigo}`}
              value={rastreio}
              onChange={(e) => setRastreio(e.target.value.toUpperCase())}
              onBlur={() => etapa === 'enviado' && rastreio !== (p.rastreio || '') && mudar({ rastreio })}
              placeholder="AA123456789BR"
              autoCapitalize="characters"
            />
          </div>
        )}

        <div className="adm-acoes">
          {(etapa === 'conferir' || etapa === 'aguardando') && (
            <button type="button" className="botao botao-mar" disabled={salvando} onClick={() => mudar({ status: 'pago' })}>
              <Check size={18} aria-hidden="true" /> Pix recebido
            </button>
          )}
          {etapa === 'pago' && (
            <button
              type="button"
              className="botao botao-mar"
              disabled={salvando}
              onClick={() => mudar({ status: 'enviado', rastreio })}
            >
              <Truck size={18} aria-hidden="true" /> Marcar como enviado
            </button>
          )}
          <a className="botao botao-linha" href={linkWhats(p)} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={18} aria-hidden="true" />
            {etapa === 'enviado' ? 'Mandar rastreio' : 'WhatsApp do cliente'}
          </a>
        </div>

        <div className="campo">
          <label htmlFor={`obs-${p.codigo}`}>Anotações</label>
          <textarea
            id={`obs-${p.codigo}`}
            rows={2}
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            onBlur={() => observacao !== (p.observacao || '') && mudar({ observacao })}
            placeholder="Só você vê"
          />
        </div>

        <div className="adm-acoes-menores">
          {etapa === 'pago' && (
            <button type="button" className="ck-link" onClick={() => mudar({ status: 'aguardando' })}>
              <Undo2 size={15} aria-hidden="true" /> Voltar para aguardando Pix
            </button>
          )}
          {etapa === 'enviado' && (
            <button type="button" className="ck-link" onClick={() => mudar({ status: 'pago' })}>
              <Undo2 size={15} aria-hidden="true" /> Voltar para falta enviar
            </button>
          )}
          {etapa === 'cancelado' ? (
            <button type="button" className="ck-link" onClick={() => mudar({ status: 'aguardando' })}>
              <Undo2 size={15} aria-hidden="true" /> Reabrir pedido
            </button>
          ) : (
            etapa !== 'enviado' && (
              <button
                type="button"
                className="ck-link adm-cancelar"
                onClick={() => window.confirm(`Cancelar o pedido ${p.codigo} de ${p.nome}?`) && mudar({ status: 'cancelado' })}
              >
                <X size={15} aria-hidden="true" /> Cancelar pedido
              </button>
            )
          )}
        </div>
      </div>
    </details>
  )
}

// ---------- página ----------

export default function Pedidos() {
  const [senha, setSenha] = useState(lerSenha)
  const [pedidos, setPedidos] = useState(null)
  const [filtro, setFiltro] = useState('todos')
  const [busca, setBusca] = useState('')
  const [atualizando, setAtualizando] = useState(false)
  const [aviso, setAviso] = useState('')

  // Atalho na tela inicial do celular, com cara de app, só nesta página
  useEffect(() => {
    const extras = [
      ['link', { rel: 'manifest', href: 'pedidos.webmanifest' }],
      ['link', { rel: 'apple-touch-icon', href: 'icones/pedidos-180.png' }],
      ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
      ['meta', { name: 'mobile-web-app-capable', content: 'yes' }],
      ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }],
      ['meta', { name: 'apple-mobile-web-app-title', content: 'Pedidos' }],
      ['meta', { name: 'robots', content: 'noindex' }],
    ].map(([tag, atributos]) => {
      const el = Object.assign(document.createElement(tag), atributos)
      if (atributos.name) el.setAttribute('name', atributos.name)
      document.head.appendChild(el)
      return el
    })
    const titulo = document.title
    document.title = `Pedidos | ${marca.nome}`
    window.scrollTo(0, 0)
    return () => {
      extras.forEach((el) => el.remove())
      document.title = titulo
    }
  }, [])

  const carregar = useCallback(
    async (silencioso) => {
      if (!senha) return
      if (!silencioso) setAtualizando(true)
      try {
        const dados = await api('/api/admin/pedidos', senha)
        setPedidos(dados.pedidos)
        setAviso('')
      } catch (falha) {
        if (falha.status === 401 || falha.status === 503) {
          guardarSenha('')
          setSenha('')
        } else setAviso('Sem conexão com os pedidos agora. Tentando de novo em instantes.')
      } finally {
        setAtualizando(false)
      }
    },
    [senha],
  )

  // Atualiza ao abrir, a cada minuto e sempre que o app volta para a tela
  useEffect(() => {
    if (!senha) return
    carregar(true)
    const relogio = setInterval(() => document.visibilityState === 'visible' && carregar(true), 60000)
    const voltar = () => document.visibilityState === 'visible' && carregar(true)
    document.addEventListener('visibilitychange', voltar)
    return () => {
      clearInterval(relogio)
      document.removeEventListener('visibilitychange', voltar)
    }
  }, [senha, carregar])

  async function mudar(codigo, dados) {
    try {
      const { pedido } = await api(`/api/admin/pedidos/${codigo}`, senha, { method: 'PATCH', body: JSON.stringify(dados) })
      setPedidos((lista) => lista.map((p) => (p.codigo === codigo ? pedido : p)))
    } catch {
      setAviso('Não deu para salvar a mudança. Confira a internet e tente de novo.')
    }
  }

  const contagem = useMemo(() => {
    const c = Object.fromEntries(Object.keys(etapas).map((e) => [e, 0]))
    let recebido = 0
    for (const p of pedidos || []) {
      c[etapaDe(p)]++
      if (p.status === 'pago' || p.status === 'enviado') recebido += p.total
    }
    return { ...c, recebido }
  }, [pedidos])

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const termoDigitos = termo.replace(/\D/g, '')
    return (pedidos || []).filter((p) => {
      if (filtro !== 'todos' && etapaDe(p) !== filtro) return false
      if (!termo) return true
      return (
        p.nome.toLowerCase().includes(termo) ||
        p.codigo.toLowerCase().includes(termo) ||
        p.email.toLowerCase().includes(termo) ||
        (termoDigitos.length >= 3 && (p.cpf.includes(termoDigitos) || p.telefone.includes(termoDigitos)))
      )
    })
  }, [pedidos, filtro, busca])

  if (!senha)
    return (
      <Entrar
        onEntrar={(s, lista) => {
          setSenha(s)
          setPedidos(lista)
        }}
      />
    )

  return (
    <div className="adm">
      <header className="adm-topo">
        <div className="adm-topo-linha">
          <h1>Pedidos</h1>
          <button
            type="button"
            className="adm-icone"
            onClick={() => carregar(false)}
            aria-label="Atualizar pedidos"
            disabled={atualizando}
          >
            <RefreshCw size={20} aria-hidden="true" className={atualizando ? 'adm-girando' : ''} />
          </button>
          <button
            type="button"
            className="adm-icone"
            aria-label="Sair"
            onClick={() => {
              guardarSenha('')
              setSenha('')
              setPedidos(null)
            }}
          >
            <LogOut size={20} aria-hidden="true" />
          </button>
        </div>
      </header>

      <main className="adm-conteudo">
        {aviso && (
          <p className="adm-aviso" role="status">
            {aviso}
          </p>
        )}

        <ul className="adm-numeros">
          <li className={contagem.conferir ? 'adm-numero-destaque' : ''}>
            <strong>{contagem.conferir}</strong> Pix para conferir
          </li>
          <li>
            <strong>{contagem.pago}</strong> para enviar
          </li>
          <li>
            <strong>{contagem.aguardando}</strong> aguardando Pix
          </li>
          <li>
            <strong>{brl(contagem.recebido)}</strong> recebido
          </li>
        </ul>

        <div className="adm-busca">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            placeholder="Buscar nome, pedido, CPF ou celular"
            aria-label="Buscar pedidos"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="adm-filtros" role="group" aria-label="Filtrar pedidos">
          {['todos', ...filtros].map((f) => (
            <button key={f} type="button" aria-pressed={filtro === f} onClick={() => setFiltro(f)}>
              {f === 'todos' ? 'Todos' : etapas[f].curto}
              <span>{f === 'todos' ? pedidos?.length || 0 : contagem[f]}</span>
            </button>
          ))}
        </div>

        {pedidos === null ? (
          <p className="adm-vazio">Carregando pedidos...</p>
        ) : visiveis.length ? (
          <div className="adm-lista">
            {visiveis.map((p) => (
              <Pedido key={p.codigo} p={p} onMudar={mudar} />
            ))}
          </div>
        ) : (
          <div className="adm-vazio">
            <PackageCheck size={32} aria-hidden="true" />
            <p>{pedidos.length ? 'Nenhum pedido neste filtro.' : 'Os pedidos do site aparecem aqui assim que o cliente gera o Pix.'}</p>
          </div>
        )}

        {pedidos?.length > 0 && (
          <button type="button" className="botao botao-linha adm-csv" onClick={() => baixarCsv(visiveis)}>
            <Download size={18} aria-hidden="true" /> Baixar planilha ({visiveis.length})
          </button>
        )}
      </main>
    </div>
  )
}
