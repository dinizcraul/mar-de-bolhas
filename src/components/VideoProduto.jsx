import { useEffect, useRef } from 'react'
import { useMovimentoReduzido } from '../hooks'

// Vídeo vertical do produto: sem som, em loop, tocando só enquanto aparece na tela.
// Com "reduzir movimento" ligado, fica parado no pôster e mostra os controles.
export default function VideoProduto({ video, className = '', primeiro = false }) {
  const ref = useRef(null)
  const reduzido = useMovimentoReduzido()

  useEffect(() => {
    const el = ref.current
    if (!el || reduzido) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) el.play().catch(() => {})
        else el.pause()
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      el.pause()
    }
  }, [reduzido])

  return (
    <figure className={`video ${className}`}>
      <video
        ref={ref}
        src={video.src}
        poster={video.poster}
        muted
        loop
        playsInline
        preload={primeiro ? 'auto' : 'none'}
        controls={reduzido}
        aria-label={video.descricao}
      />
      <figcaption className="video-selo">Vídeo real</figcaption>
    </figure>
  )
}
