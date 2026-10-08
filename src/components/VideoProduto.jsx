import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { useMovimentoReduzido } from '../hooks'

const LIMIAR = 0.3
const ESPERA_MS = 300

// Vídeo vertical do produto: sem som, em loop, tocando só enquanto aparece na tela.
// A espera evita baixar vídeos que só passam pela tela quando a página rola até um link.
// Com "reduzir movimento" ligado, ou se o navegador bloquear o autoplay, mostra os controles.
export default function VideoProduto({ video, className = '', primeiro = false }) {
  const ref = useRef(null)
  const reduzido = useMovimentoReduzido()
  const [pausado, setPausado] = useState(false)
  const [bloqueado, setBloqueado] = useState(false)
  const comControles = reduzido || bloqueado
  const automatico = !comControles && !pausado

  useEffect(() => {
    const el = ref.current
    if (!el || !automatico) return
    let t
    const io = new IntersectionObserver(
      ([e]) => {
        clearTimeout(t)
        if (e.isIntersecting && e.intersectionRatio >= LIMIAR - 0.01) {
          t = setTimeout(
            () =>
              el.play().catch((erro) => {
                if (erro.name === 'NotAllowedError') setBloqueado(true)
              }),
            primeiro ? 0 : ESPERA_MS,
          )
        } else el.pause()
      },
      { threshold: LIMIAR },
    )
    io.observe(el)
    return () => {
      clearTimeout(t)
      io.disconnect()
      el.pause()
    }
  }, [automatico, primeiro])

  return (
    <figure className={`video ${className}`}>
      <video
        ref={ref}
        src={video.src}
        poster={video.poster}
        muted
        loop
        playsInline
        preload={primeiro && !reduzido ? 'auto' : 'none'}
        controls={comControles}
        aria-label={video.descricao}
      />
      <figcaption className="video-selo">Vídeo real</figcaption>
      {!comControles && (
        <button
          type="button"
          className="video-pausa"
          onClick={() => setPausado((p) => !p)}
          aria-label={pausado ? 'Tocar vídeo' : 'Pausar vídeo'}
        >
          {pausado ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}
        </button>
      )}
    </figure>
  )
}
