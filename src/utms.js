// Guarda de onde o cliente veio (os parâmetros utm_* do link do anúncio) para mandar junto com o pedido.
// A UTMify usa isso para saber qual campanha, conjunto e anúncio trouxe cada venda.
const CHAVE = 'mar-de-bolhas:utms'
const CAMPOS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'src', 'sck']
// Mesma janela da Meta: a venda conta para o anúncio clicado nos últimos 7 dias
const VALIDADE = 7 * 24 * 60 * 60 * 1000

// Lê também o que vem depois do # (ex.: um link para #checkout?kit=duas&utm_source=FB),
// antes que o checkout limpe o endereço. Cada valor é cortado no mesmo tamanho que o worker guarda.
const doEndereco = () => {
  const busca = new URLSearchParams(window.location.hash.split('?')[1] || '')
  new URLSearchParams(window.location.search).forEach((valor, campo) => busca.set(campo, valor))
  const utms = Object.fromEntries(CAMPOS.filter((c) => busca.get(c)).map((c) => [c, busca.get(c).slice(0, 500)]))
  return Object.keys(utms).length ? utms : null
}

// Chamado ao abrir o site. Uma visita sem UTMs não apaga as do último anúncio clicado.
export function guardarUtms() {
  const utms = doEndereco()
  if (!utms) return
  try {
    localStorage.setItem(CHAVE, JSON.stringify({ ...utms, em: Date.now() }))
  } catch {
    // sem localStorage, utmsDoCliente ainda lê do endereço
  }
}

export function utmsDoCliente() {
  try {
    const { em, ...utms } = JSON.parse(localStorage.getItem(CHAVE)) || {}
    if (em && Date.now() - em < VALIDADE) return utms
  } catch {
    // segue para o endereço
  }
  return doEndereco()
}
