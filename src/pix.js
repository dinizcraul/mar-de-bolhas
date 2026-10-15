// Pix estático (BR Code / padrão EMV do Banco Central), gerado no próprio navegador.
// Não passa por nenhum serviço: o código vira o QR e o "copia e cola" que o banco do cliente lê.

// Campo EMV: id de 2 dígitos + tamanho com 2 dígitos + valor
const campo = (id, valor) => `${id}${String(valor.length).padStart(2, '0')}${valor}`

// CRC16-CCITT (polinômio 0x1021, início 0xFFFF), exigido no fim do código
export function crc16(texto) {
  let crc = 0xffff
  for (let i = 0; i < texto.length; i++) {
    crc ^= texto.charCodeAt(i) << 8
    for (let b = 0; b < 8; b++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
      crc &= 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

// Nome e cidade: sem acento, em maiúsculas e no tamanho máximo que os bancos aceitam
const limpa = (texto, max) =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .trim()
    .toUpperCase()
    .slice(0, max)

export function codigoPix({ chave, nome, cidade, valor, txid, descricao }) {
  const conta =
    campo('00', 'br.gov.bcb.pix') + campo('01', chave.trim()) + (descricao ? campo('02', limpa(descricao, 40)) : '')
  const id = (txid || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 25) || '***'
  const semCrc =
    campo('00', '01') +
    campo('26', conta) +
    campo('52', '0000') +
    campo('53', '986') +
    (valor > 0 ? campo('54', valor.toFixed(2)) : '') +
    campo('58', 'BR') +
    campo('59', limpa(nome, 25)) +
    campo('60', limpa(cidade, 15)) +
    campo('62', campo('05', id)) +
    '6304'
  return semCrc + crc16(semCrc)
}

// Código curto do pedido, que também vai como identificador (txid) no Pix
export function novoCodigoPedido() {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const sorteio = crypto.getRandomValues(new Uint8Array(6))
  return 'MB' + Array.from(sorteio, (n) => letras[n % letras.length]).join('')
}
