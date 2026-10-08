// Desenha no canvas da banheira: bolhas, nuvens de cor, respingos, espuma e ondinhas.
// As posições vêm em pixels CSS, relativas à cena.

const aleatorio = (a, b) => a + Math.random() * (b - a)

function hexParaRgb(hex) {
  const n = parseInt(hex.slice(1), 16)
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`
}

// Cantos de baixo da água: precisam bater com o border-radius de .agua no CSS
const RAIO_X = 0.28
const RAIO_Y = 0.46

export function criarMotor(canvas) {
  const ctx = canvas.getContext('2d')
  let w = 0
  let h = 0
  let agua = { x: 0, y: 0, w: 0, h: 0 }
  let bolhas = []
  let nuvens = []
  let gotas = []
  let espuma = []
  let aneis = []
  let fonte = null
  let ambiente = true
  let visivel = true
  let raf = 0
  let ultimo = 0
  let acumBolha = 0
  let acumNuvem = 0
  let acumAmbiente = 0

  const escala = () => Math.max(agua.w / 420, 0.6)

  function pedirQuadro() {
    if (!raf && visivel) raf = requestAnimationFrame(quadro)
  }

  function novaBolha(x, y, tamanho, daBomba) {
    return {
      x,
      x0: x,
      y,
      r: aleatorio(1.4, daBomba ? 4.6 : 3) * tamanho,
      sobe: aleatorio(daBomba ? 40 : 18, daBomba ? 110 : 42) * tamanho,
      amp: aleatorio(1, 5) * tamanho,
      freq: aleatorio(2, 5),
      fase: aleatorio(0, 6.3),
      idade: 0,
      daBomba,
    }
  }

  function caminhoAgua() {
    const { x, y, w: aw, h: ah } = agua
    const rx = aw * RAIO_X
    const ry = ah * RAIO_Y
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + aw, y)
    ctx.lineTo(x + aw, y + ah - ry)
    ctx.ellipse(x + aw - rx, y + ah - ry, rx, ry, 0, 0, Math.PI / 2)
    ctx.lineTo(x + rx, y + ah)
    ctx.ellipse(x + rx, y + ah - ry, rx, ry, 0, Math.PI / 2, Math.PI)
    ctx.closePath()
  }

  function quadro(t) {
    raf = 0
    const dt = Math.min((t - (ultimo || t)) / 1000, 0.05)
    ultimo = t
    const s = escala()

    if (fonte && t > fonte.fim) fonte = null
    if (fonte) {
      acumBolha += dt * 95
      for (; acumBolha >= 1; acumBolha--) {
        bolhas.push(novaBolha(fonte.x + aleatorio(-0.8, 0.8) * fonte.r, fonte.y + aleatorio(0, 0.9) * fonte.r, s, true))
      }
      acumNuvem += dt * 9
      for (; acumNuvem >= 1; acumNuvem--) {
        nuvens.push({
          x: fonte.x + aleatorio(-0.5, 0.5) * fonte.r,
          y: fonte.y + fonte.r * 0.4,
          r: fonte.r * aleatorio(0.4, 0.7),
          vx: aleatorio(-55, 55) * s,
          vy: aleatorio(12, 55) * s,
          cresce: aleatorio(16, 34) * s,
          a: aleatorio(0.28, 0.42),
          cor: fonte.cor,
        })
      }
      if (Math.random() < dt * 16) {
        espuma.push({ x: fonte.x + aleatorio(-1.5, 1.5) * fonte.r, r: aleatorio(3, 7) * s, vida: aleatorio(2, 3.6), t: 0 })
      }
    }

    if (ambiente) {
      acumAmbiente += dt * 2.4
      for (; acumAmbiente >= 1; acumAmbiente--) {
        bolhas.push(novaBolha(agua.x + agua.w * aleatorio(0.18, 0.82), agua.y + agua.h * aleatorio(0.7, 0.9), s * 0.75, false))
      }
    }

    const superficie = agua.y + 1
    const sobreviventes = []
    for (const b of bolhas) {
      b.idade += dt
      b.y -= b.sobe * dt
      b.x = b.x0 + Math.sin(b.idade * b.freq + b.fase) * b.amp
      if (b.y - b.r > superficie) sobreviventes.push(b)
      else if (b.daBomba && Math.random() < 0.3) espuma.push({ x: b.x, r: aleatorio(2.5, 5) * s, vida: aleatorio(1.2, 2.4), t: 0 })
    }
    bolhas = sobreviventes

    for (const n of nuvens) {
      n.x += n.vx * dt
      n.y += n.vy * dt
      n.vx *= 1 - dt * 0.6
      n.vy *= 1 - dt * 0.5
      n.r += n.cresce * dt
      n.a -= dt * 0.07
    }
    nuvens = nuvens.filter((n) => n.a > 0)

    for (const g of gotas) {
      g.vy += 900 * s * dt
      g.x += g.vx * dt
      g.y += g.vy * dt
    }
    gotas = gotas.filter((g) => !(g.vy > 0 && g.y > superficie))

    for (const e of espuma) e.t += dt
    espuma = espuma.filter((e) => e.t < e.vida)

    for (const a of aneis) {
      if (a.espera > 0) a.espera -= dt
      else {
        a.r += 130 * s * dt
        a.a -= dt * 0.55
      }
    }
    aneis = aneis.filter((a) => a.a > 0)

    ctx.clearRect(0, 0, w, h)

    // Embaixo d'água: tudo recortado no formato da água
    ctx.save()
    caminhoAgua()
    ctx.clip()
    for (const n of nuvens) {
      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r)
      g.addColorStop(0, `rgba(${n.cor},${n.a.toFixed(3)})`)
      g.addColorStop(1, `rgba(${n.cor},0)`)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.lineWidth = 1
    for (const b of bolhas) {
      ctx.beginPath()
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,.2)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,.75)'
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.28, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,.85)'
      ctx.fill()
    }
    ctx.restore()

    // Na superfície e acima dela
    ctx.save()
    ctx.beginPath()
    ctx.rect(agua.x, 0, agua.w, agua.y + agua.h * 0.2)
    ctx.clip()
    for (const a of aneis) {
      if (a.espera > 0) continue
      ctx.beginPath()
      ctx.ellipse(a.x, agua.y + 1, a.r, a.r * 0.16, 0, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(255,255,255,${a.a.toFixed(3)})`
      ctx.lineWidth = 2
      ctx.stroke()
    }
    ctx.restore()

    for (const e of espuma) {
      const vida = 1 - e.t / e.vida
      ctx.beginPath()
      ctx.arc(e.x, agua.y + 1, e.r * (0.55 + 0.45 * Math.min(1, e.t * 4)), 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${(vida * 0.85).toFixed(3)})`
      ctx.fill()
    }
    for (const g of gotas) {
      ctx.beginPath()
      ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2)
      ctx.fillStyle = g.branca ? 'rgba(255,255,255,.9)' : `rgba(${g.cor},.9)`
      ctx.fill()
    }

    const temAlgo = fonte || bolhas.length || nuvens.length || gotas.length || espuma.length || aneis.length
    if (temAlgo || ambiente) pedirQuadro()
    else ultimo = 0
  }

  return {
    ajustar(largura, altura, caixaAgua) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = largura
      h = altura
      agua = caixaAgua
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      pedirQuadro()
    },
    efervescer({ x, y, r, cor, duracao }) {
      const rgb = hexParaRgb(cor)
      const s = escala()
      fonte = { x, y, r, cor: rgb, fim: performance.now() + duracao }
      for (let i = 0; i < 20; i++) {
        gotas.push({
          x: x + aleatorio(-0.6, 0.6) * r,
          y: agua.y,
          vx: aleatorio(-150, 150) * s,
          vy: aleatorio(-320, -150) * s,
          r: aleatorio(1.6, 3.8) * s,
          cor: rgb,
          branca: Math.random() < 0.55,
        })
      }
      aneis.push({ x, r: r * 0.7, a: 0.8, espera: 0 })
      aneis.push({ x, r: r * 0.5, a: 0.6, espera: 0.28 })
      pedirQuadro()
    },
    definirAmbiente(ligado) {
      ambiente = ligado
      if (ligado) pedirQuadro()
    },
    definirVisivel(v) {
      visivel = v
      if (v) {
        ultimo = 0
        pedirQuadro()
      } else if (raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    },
    destruir() {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      visivel = false
    },
  }
}
