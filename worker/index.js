// Worker do site: serve as páginas (pasta dist/) e guarda os pedidos do checkout no banco D1.
// A página de pedidos abre em /pedidos (ou #admin), com a senha ADMIN_SENHA.
//
// Rotas públicas (usadas pelo checkout):
//   POST /api/pedidos                  cria ou atualiza um pedido que ainda espera pagamento
//   POST /api/pedidos/:codigo/paguei   o cliente avisou que pagou
// Rotas da página de pedidos (pedem a senha ADMIN_SENHA, cadastrada como segredo no Cloudflare):
//   GET   /api/admin/pedidos           lista os pedidos
//   PATCH /api/admin/pedidos/:codigo   muda status, código de rastreio ou observação

import { kits, temas, fretes } from '../src/data.js'

const STATUS = ['aguardando', 'pago', 'enviado', 'cancelado']
const CODIGO = /^MB[A-Z0-9]{6}$/
const UFS = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ')

const json = (dados, status = 200) =>
  new Response(JSON.stringify(dados), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })

const texto = (valor, max = 120) => String(valor ?? '').trim().slice(0, max)
const digitos = (valor) => String(valor ?? '').replace(/\D/g, '')
const agora = () => new Date().toISOString()

async function lerCorpo(request) {
  if (Number(request.headers.get('content-length') || 0) > 8000) return null
  try {
    const corpo = await request.json()
    return corpo && typeof corpo === 'object' ? corpo : null
  } catch {
    return null
  }
}

// O total é sempre recalculado aqui com os preços de src/data.js, nunca aceito do navegador
function montarPedido(corpo) {
  const kit = kits.find((k) => k.id === corpo.kitId)
  const frete = fretes.find((f) => f.id === corpo.freteId)
  const c = corpo.cliente || {}
  if (!CODIGO.test(corpo.codigo || '') || !kit || !frete) return null
  const tema = kit.escolheTema ? temas.find((t) => t.id === corpo.tema)?.id || 'A' : null
  const pedido = {
    codigo: corpo.codigo,
    kit_id: kit.id,
    kit: kit.titulo,
    tema: kit.escolheTema ? `Tema ${tema}` : kit.detalhe,
    bombas: kit.bombas,
    frete: frete.nome,
    valor_frete: frete.valor,
    total: Math.round((kit.preco + frete.valor) * 100) / 100,
    nome: texto(c.nome),
    email: texto(c.email),
    telefone: digitos(c.telefone).slice(0, 13),
    cpf: digitos(c.cpf).slice(0, 11),
    cep: digitos(c.cep).slice(0, 8),
    rua: texto(c.rua),
    numero: c.semNumero ? 'S/N' : texto(c.numero, 20),
    complemento: texto(c.complemento),
    bairro: texto(c.bairro),
    cidade: texto(c.cidade),
    uf: texto(c.uf, 2).toUpperCase(),
  }
  const ok =
    pedido.nome.includes(' ') &&
    pedido.email.includes('@') &&
    pedido.telefone.length >= 10 &&
    pedido.cpf.length === 11 &&
    pedido.cep.length === 8 &&
    pedido.rua &&
    pedido.numero &&
    pedido.bairro &&
    pedido.cidade &&
    UFS.includes(pedido.uf)
  return ok ? pedido : null
}

async function salvarPedido(request, env) {
  const corpo = await lerCorpo(request)
  const pedido = corpo && montarPedido(corpo)
  if (!pedido) return json({ erro: 'pedido-invalido' }, 400)
  const quando = agora()
  const colunas = Object.keys(pedido)
  // Um pedido já pago, enviado ou cancelado não muda mais por aqui
  await env.DB.prepare(
    `INSERT INTO pedidos (${colunas.join(', ')}, criado_em, atualizado_em)
     VALUES (${colunas.map(() => '?').join(', ')}, ?, ?)
     ON CONFLICT (codigo) DO UPDATE SET ${colunas
       .filter((c) => c !== 'codigo')
       .map((c) => `${c} = excluded.${c}`)
       .join(', ')}, atualizado_em = excluded.atualizado_em
     WHERE pedidos.status = 'aguardando'`,
  )
    .bind(...Object.values(pedido), quando, quando)
    .run()
  return json({ codigo: pedido.codigo, total: pedido.total })
}

async function avisarPagamento(codigo, env) {
  if (!CODIGO.test(codigo)) return json({ erro: 'codigo-invalido' }, 400)
  const quando = agora()
  const { meta } = await env.DB.prepare(
    `UPDATE pedidos SET avisou_pagamento_em = COALESCE(avisou_pagamento_em, ?), atualizado_em = ? WHERE codigo = ?`,
  )
    .bind(quando, quando, codigo)
    .run()
  return meta.changes ? json({ ok: true }) : json({ erro: 'pedido-nao-encontrado' }, 404)
}

// Compara a senha sem deixar o tempo de resposta denunciar quantas letras acertou
async function senhaConfere(request, env) {
  const enviada = (request.headers.get('authorization') || '').replace(/^Bearer /, '')
  const codificar = (s) => crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  const [a, b] = await Promise.all([codificar(enviada), codificar(env.ADMIN_SENHA)])
  return crypto.subtle.timingSafeEqual(a, b)
}

async function listarPedidos(env) {
  const { results } = await env.DB.prepare(`SELECT * FROM pedidos ORDER BY criado_em DESC LIMIT 1000`).all()
  return json({ pedidos: results })
}

async function atualizarPedido(request, codigo, env) {
  const corpo = await lerCorpo(request)
  if (!corpo || !CODIGO.test(codigo)) return json({ erro: 'pedido-invalido' }, 400)
  const mudancas = {}
  if (STATUS.includes(corpo.status)) mudancas.status = corpo.status
  if ('rastreio' in corpo) mudancas.rastreio = texto(corpo.rastreio, 60)
  if ('observacao' in corpo) mudancas.observacao = texto(corpo.observacao, 500)
  if (!Object.keys(mudancas).length) return json({ erro: 'nada-para-mudar' }, 400)
  const pedido = await env.DB.prepare(
    `UPDATE pedidos SET ${Object.keys(mudancas)
      .map((c) => `${c} = ?`)
      .join(', ')}, atualizado_em = ? WHERE codigo = ? RETURNING *`,
  )
    .bind(...Object.values(mudancas), agora(), codigo)
    .first()
  return pedido ? json({ pedido }) : json({ erro: 'pedido-nao-encontrado' }, 404)
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const caminho = url.pathname
    // Endereço curto da página de pedidos, para salvar na tela de início do celular
    if (caminho === '/pedidos/') return Response.redirect(new URL('/pedidos', url), 301)
    if (caminho === '/pedidos') return env.ASSETS.fetch(new Request(new URL('/', url), request))
    if (!caminho.startsWith('/api/')) return env.ASSETS.fetch(request)

    try {
      if (caminho === '/api/pedidos' && request.method === 'POST') return await salvarPedido(request, env)
      const paguei = caminho.match(/^\/api\/pedidos\/([A-Z0-9]+)\/paguei$/)
      if (paguei && request.method === 'POST') return await avisarPagamento(paguei[1], env)

      if (caminho.startsWith('/api/admin/')) {
        if (!env.ADMIN_SENHA) return json({ erro: 'senha-nao-configurada' }, 503)
        if (!(await senhaConfere(request, env))) return json({ erro: 'senha-errada' }, 401)
        if (caminho === '/api/admin/pedidos' && request.method === 'GET') return await listarPedidos(env)
        const um = caminho.match(/^\/api\/admin\/pedidos\/([A-Z0-9]+)$/)
        if (um && request.method === 'PATCH') return await atualizarPedido(request, um[1], env)
      }
      return json({ erro: 'nao-encontrado' }, 404)
    } catch (erro) {
      console.error(erro)
      return json({ erro: 'falha-no-servidor' }, 500)
    }
  },
}
