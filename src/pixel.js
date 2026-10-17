// Pixel da Meta. Os IDs ficam em PIXELS_META (src/data.js) e cada evento vai para todos eles.
// Eventos enviados:
//   PageView        ao abrir o site
//   AddToCart       ao abrir o checkout com um kit (e ao trocar de kit lá dentro)
//   AddPaymentInfo  ao chegar na etapa de pagamento
//   Purchase        ao gerar o Pix, uma vez por pedido (o código do pedido vai como eventID)
import { PIXELS_META, PIXEL_UTMIFY } from './data'

const COMPRAS = 'mar-de-bolhas:pixel-compras'

const naPaginaDePedidos = () => window.location.pathname.endsWith('/pedidos') || window.location.hash.startsWith('#admin')

export function iniciarPixel() {
  if (!PIXELS_META.length || window.fbq || naPaginaDePedidos()) return
  // Código base da Meta, igual ao do Gerenciador de Eventos
  /* eslint-disable */
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    }
    if (!f._fbq) f._fbq = n
    n.push = n
    n.loaded = !0
    n.version = '2.0'
    n.queue = []
    t = b.createElement(e)
    t.async = !0
    t.src = v
    s = b.getElementsByTagName(e)[0]
    s.parentNode.insertBefore(t, s)
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
  /* eslint-enable */
  const fbq = window.fbq
  // As âncoras do site (#kits, #duvidas...) mudam o endereço: sem isto cada clique contaria como uma visita
  fbq.disablePushState = true
  PIXELS_META.forEach((id) => fbq('init', id))
  fbq('track', 'PageView')
}

// Mesmo script que a UTMify entrega (lá ele vem embaralhado): define window.pixelId e carrega o pixel.js.
// Carrega depois do nosso Pixel: assim a UTMify encontra o fbq pronto e não instala outro.
export function iniciarPixelUtmify() {
  if (!PIXEL_UTMIFY || window.pixelId || naPaginaDePedidos()) return
  window.pixelId = PIXEL_UTMIFY
  const script = document.createElement('script')
  script.src = 'https://cdn.utmify.com.br/scripts/pixel/pixel.js'
  script.async = true
  script.defer = true
  document.head.appendChild(script)
}

export function evento(nome, dados, eventID) {
  if (!window.fbq || naPaginaDePedidos()) return
  window.fbq('track', nome, dados, eventID ? { eventID } : undefined)
}

// Gerar o Pix de novo para o mesmo pedido não conta outra compra
export function compra(codigo, dados) {
  let feitas = []
  try {
    feitas = JSON.parse(localStorage.getItem(COMPRAS)) || []
  } catch {
    feitas = []
  }
  if (feitas.includes(codigo)) return
  evento('Purchase', dados, codigo)
  try {
    localStorage.setItem(COMPRAS, JSON.stringify([...feitas, codigo].slice(-50)))
  } catch {
    // sem localStorage o evento sai mesmo assim
  }
}
