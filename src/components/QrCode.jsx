import { useMemo } from 'react'
import { qrcode } from 'qrcode-generator'

// QR code em SVG, sempre preto no branco para qualquer câmera ler (também no tema escuro)
export default function QrCode({ texto, rotulo, className }) {
  const { tamanho, caminho } = useMemo(() => {
    const qr = qrcode(0, 'M')
    qr.addData(texto)
    qr.make()
    const n = qr.getModuleCount()
    let d = ''
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (qr.isDark(r, c)) d += `M${c},${r}h1v1h-1z`
      }
    }
    return { tamanho: n, caminho: d }
  }, [texto])
  const margem = 4
  const total = tamanho + margem * 2

  return (
    <svg
      className={className}
      viewBox={`${-margem} ${-margem} ${total} ${total}`}
      role="img"
      aria-label={rotulo}
      shapeRendering="crispEdges"
    >
      <rect x={-margem} y={-margem} width={total} height={total} fill="#ffffff" />
      <path d={caminho} fill="#000000" />
    </svg>
  )
}
