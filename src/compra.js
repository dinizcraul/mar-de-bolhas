import { LINK_LOJA, WHATSAPP } from './data'

export const brl = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// Link do botão de compra: loja, WhatsApp com a mensagem pronta, ou a seção de kits
export function linkCompra(mensagem) {
  if (LINK_LOJA) return LINK_LOJA
  if (WHATSAPP) return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`
  return '#kits'
}

export const abreFora = (href) => (href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})
