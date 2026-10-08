import { useCallback, useEffect, useRef, useState } from 'react'
import { RotateCcw, Sparkles } from 'lucide-react'
import BathBomb from './BathBomb'
import SeaToy from './SeaToy'
import { criarMotor } from './fizzEngine'
import { bichinhos, coresBomba } from '../data'

const ANTES_MS = 280
const QUEDA_MS = 620
const FIZZ_MS = 3400
const AUTO_MS = 1300

function useMovimentoReduzido() {
  const consulta = '(prefers-reduced-motion: reduce)'
  const [reduzido, setReduzido] = useState(() => window.matchMedia(consulta).matches)
  useEffect(() => {
    const mq = window.matchMedia(consulta)
    const mudar = () => setReduzido(mq.matches)
    mq.addEventListener('change', mudar)
    return () => mq.removeEventListener('change', mudar)
  }, [])
  return reduzido
}

export default function FizzTub() {
  const [fase, setFase] = useState('pronta')
  const [rodada, setRodada] = useState(0)
  const [cor, setCor] = useState(coresBomba[0])
  const [tinta, setTinta] = useState(null)
  const [bicho, setBicho] = useState(null)
  const [achados, setAchados] = useState([])
  const reduzido = useMovimentoReduzido()

  const cenaRef = useRef(null)
  const aguaRef = useRef(null)
  const bombaRef = useRef(null)
  const canvasRef = useRef(null)
  const motorRef = useRef(null)
  const timers = useRef([])
  const jaJogou = useRef(false)

  const agendar = (fn, ms) => timers.current.push(setTimeout(fn, ms))

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  useEffect(() => {
    const cena = cenaRef.current
    const agua = aguaRef.current
    const motor = criarMotor(canvasRef.current)
    motorRef.current = motor
    const medir = () =>
      motor.ajustar(cena.clientWidth, cena.clientHeight, {
        x: agua.offsetLeft,
        y: agua.offsetTop,
        w: agua.offsetWidth,
        h: agua.offsetHeight,
      })
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(cena)
    const io = new IntersectionObserver(([e]) => motor.definirVisivel(e.isIntersecting))
    io.observe(cena)
    return () => {
      ro.disconnect()
      io.disconnect()
      motor.destruir()
    }
  }, [])

  useEffect(() => {
    motorRef.current?.definirAmbiente(!reduzido)
  }, [reduzido])

  const efervescer = (corBomba) => {
    const cena = cenaRef.current
    const bomba = bombaRef.current
    const agua = aguaRef.current
    if (!cena || !bomba || !agua || !motorRef.current) return
    const rc = cena.getBoundingClientRect()
    const rb = bomba.getBoundingClientRect()
    // A bomba pode ainda estar terminando a queda: a altura vem da superfície da água,
    // onde a linha de 42% dela para por definição
    motorRef.current.efervescer({
      x: rb.left - rc.left + rb.width / 2,
      y: agua.offsetTop,
      r: (rb.width / 2) * 0.9,
      cor: corBomba,
      duracao: FIZZ_MS * 0.85,
    })
  }

  const ocupado = fase === 'caindo' || fase === 'efervescendo' || (fase === 'pronta' && jaJogou.current)

  const jogar = useCallback(() => {
    if (fase === 'caindo' || fase === 'efervescendo') return
    if (fase === 'pronta' && jaJogou.current) return
    timers.current.forEach(clearTimeout)
    timers.current = []

    const primeira = !jaJogou.current
    jaJogou.current = true
    const restantes = bichinhos.filter((b) => !achados.includes(b.id))
    const lista = restantes.length ? restantes : bichinhos
    const proximo = lista[Math.floor(Math.random() * lista.length)]
    const outrasCores = coresBomba.filter((c) => c !== cor)
    const novaCor = primeira ? cor : outrasCores[Math.floor(Math.random() * outrasCores.length)]
    const revelar = () => {
      setFase('revelado')
      setBicho(proximo)
      setAchados((a) => (a.length >= bichinhos.length ? [proximo.id] : [...a, proximo.id]))
    }

    setCor(novaCor)
    setBicho(null)
    if (!primeira) {
      setFase('pronta')
      setRodada((r) => r + 1)
    }

    if (reduzido) {
      setTinta(novaCor)
      agendar(revelar, 150)
      return
    }
    const t0 = primeira ? 20 : ANTES_MS
    agendar(() => setFase('caindo'), t0)
    agendar(() => {
      setFase('efervescendo')
      setTinta(novaCor)
      efervescer(novaCor)
    }, t0 + QUEDA_MS)
    agendar(revelar, t0 + QUEDA_MS + FIZZ_MS)
  }, [fase, achados, cor, reduzido])

  // Uma demonstração automática quando a página abre
  useEffect(() => {
    if (reduzido) return
    const t = setTimeout(() => {
      if (!jaJogou.current) jogar()
    }, AUTO_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const completo = achados.length >= bichinhos.length

  let status
  if (fase === 'revelado' && bicho) {
    status = (
      <>
        <strong>
          Saiu {bicho.artigo} {bicho.nome.toLowerCase()}!
        </strong>{' '}
        {bicho.curiosidade}
      </>
    )
  } else if (fase === 'caindo' || fase === 'efervescendo' || jaJogou.current) {
    status = <strong>Efervescendo… olha a cor tomando conta da água.</strong>
  } else {
    status = (
      <>
        <strong>Qual bichinho vai aparecer?</strong> Solte a bombinha na banheira e descubra.
      </>
    )
  }

  return (
    <div className="demo">
      <div
        className="cena"
        ref={cenaRef}
        onClick={jogar}
        style={{ '--queda': `${QUEDA_MS}ms`, '--fizz': `${FIZZ_MS}ms` }}
        aria-hidden="true"
      >
        <div className="pe pe-esq" />
        <div className="pe pe-dir" />
        <div className="banheira" />
        <div className="bacia" />
        <div className="agua" ref={aguaRef}>
          <div
            className="tinta"
            style={{ backgroundColor: tinta ?? 'transparent', opacity: tinta ? 0.5 : 0 }}
          />
        </div>
        {fase !== 'revelado' && (
          <div key={rodada} ref={bombaRef} className={`bomba bomba-${fase}`}>
            <div className="bomba-boia">
              <BathBomb cor={cor} />
            </div>
          </div>
        )}
        <canvas ref={canvasRef} className="cena-canvas" />
        {fase === 'revelado' && bicho && (
          <div key={`${bicho.id}-${rodada}`} className="brinquedo">
            <div className="brinquedo-boia">
              <SeaToy id={bicho.id} />
            </div>
          </div>
        )}
      </div>

      <div className="demo-painel">
        <p className="demo-status" aria-live="polite">
          {status}
        </p>
        <div className="demo-acoes">
          <button type="button" id="soltar-bombinha" className="botao botao-mar" onClick={jogar} disabled={ocupado}>
            {fase === 'revelado' ? <RotateCcw size={18} aria-hidden="true" /> : <Sparkles size={18} aria-hidden="true" />}
            {ocupado ? 'Efervescendo…' : fase === 'revelado' ? (completo ? 'Começar outra coleção' : 'Soltar outra') : 'Soltar a bombinha'}
          </button>
          <div className="achados">
            <span className="achados-conta">
              {achados.length} de {bichinhos.length} achados
            </span>
            <ul className="achados-lista" aria-label="Bichinhos já achados">
              {bichinhos.map((b) => {
                const achou = achados.includes(b.id)
                return (
                  <li key={b.id} className={achou ? 'achado achado-sim' : 'achado'} title={achou ? b.nome : 'Ainda não apareceu'}>
                    <SeaToy id={b.id} titulo={achou ? b.nome : undefined} />
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
