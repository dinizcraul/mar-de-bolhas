// Manda os pedidos do checkout para a UTMify, que liga cada venda à campanha, ao conjunto e ao anúncio
// que trouxe o cliente. Usa a "Credencial de API" da UTMify, cadastrada no Cloudflare como o segredo
// UTMIFY_TOKEN. Sem o segredo, nada é enviado. Documentação: https://docs.utmify.com.br/envio-de-vendas
//
// Status na UTMify:
//   aguardando                       waiting_payment (Pix gerado)
//   pago ou enviado                  paid
//   cancelado sem ter sido pago      refused
//   cancelado depois de pago         refunded

const ENDERECO = 'https://api.utmify.com.br/api-credentials/orders'
export const CAMPOS_UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'src', 'sck']

export function statusUtmify(pedido) {
  if (pedido.status === 'aguardando') return 'waiting_payment'
  if (pedido.status === 'pago' || pedido.status === 'enviado') return 'paid'
  return pedido.pago_em ? 'refunded' : 'refused'
}

// A UTMify pede as datas em UTC no formato 2026-10-16 14:35:13
const data = (iso) => (iso ? iso.slice(0, 19).replace('T', ' ') : null)
const centavos = (reais) => Math.round(reais * 100)

export function vendaUtmify(pedido) {
  const status = statusUtmify(pedido)
  const total = centavos(pedido.total)
  let utms = {}
  try {
    utms = JSON.parse(pedido.utms) || {}
  } catch {
    utms = {}
  }
  return {
    orderId: pedido.codigo,
    platform: 'MarDeBolhas',
    paymentMethod: 'pix',
    status,
    createdAt: data(pedido.criado_em),
    approvedDate: status === 'paid' || status === 'refunded' ? data(pedido.pago_em || pedido.atualizado_em) : null,
    refundedAt: status === 'refunded' ? data(pedido.atualizado_em) : null,
    customer: {
      name: pedido.nome,
      email: pedido.email,
      phone: pedido.telefone || null,
      document: pedido.cpf || null,
      country: 'BR',
      ...(pedido.ip ? { ip: pedido.ip } : {}),
    },
    products: [
      {
        id: 'mar-de-bolhas',
        name: 'Mar de Bolhas',
        planId: pedido.kit_id,
        planName: pedido.tema?.startsWith('Tema ') ? `${pedido.kit} (${pedido.tema})` : pedido.kit,
        quantity: 1,
        priceInCents: total - centavos(pedido.valor_frete),
      },
    ],
    trackingParameters: Object.fromEntries(CAMPOS_UTM.map((c) => [c, utms[c] || null])),
    // Pix direto na conta, sem intermediário: o valor inteiro fica com a loja
    commission: { totalPriceInCents: total, gatewayFeeInCents: 0, userCommissionInCents: total, currency: 'BRL' },
  }
}

// Roda depois da resposta ao cliente (ctx.waitUntil): se a UTMify falhar, o pedido segue normal
export async function enviarParaUtmify(pedido, env) {
  if (!env.UTMIFY_TOKEN || !pedido) return
  try {
    const resposta = await fetch(ENDERECO, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-token': env.UTMIFY_TOKEN },
      body: JSON.stringify(vendaUtmify(pedido)),
    })
    if (!resposta.ok) console.error('UTMify recusou o pedido', pedido.codigo, resposta.status, (await resposta.text()).slice(0, 500))
  } catch (erro) {
    console.error('UTMify fora do ar', pedido.codigo, erro)
  }
}
