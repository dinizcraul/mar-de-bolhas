import { useEffect, useState } from 'react'
import { ArrowRight, Bath, Check, Droplets, Gift, Leaf, Plus, Shell, ShieldCheck, Sparkles } from 'lucide-react'
import Logo from './components/Logo'
import FizzTub from './components/FizzTub'
import BathBomb from './components/BathBomb'
import SeaToy from './components/SeaToy'
import Oferta from './components/Oferta'
import {
  marca,
  kits,
  bichinhos,
  coresBomba,
  naCaixa,
  passos,
  beneficios,
  cuidados,
  perguntas,
  depoimentos,
  midia,
} from './data'
import { brl } from './compra'

const icones = { bath: Bath, sparkles: Sparkles, droplets: Droplets, shell: Shell, leaf: Leaf, gift: Gift }
const aPartirDe = brl(Math.min(...kits.map((k) => k.preco)))

function Cabecalho() {
  return (
    <header className="topo">
      <div className="envelope topo-linha">
        <Logo />
        <nav className="menu" aria-label="Seções">
          <a href="#como-funciona">Como funciona</a>
          <a href="#bichinhos">Bichinhos</a>
          <a href="#kits">Kits</a>
          <a href="#duvidas">Dúvidas</a>
        </nav>
        <a className="botao botao-coral botao-pequeno" href="#kits">
          Comprar
        </a>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="hero azulejo" id="topo" aria-labelledby="hero-titulo">
      <div className="envelope hero-grade">
        <div className="hero-intro">
          <p className="sobretitulo">Bombinhas de banho com surpresa</p>
          <h1 id="hero-titulo">
            Toda bombinha esconde um <span className="grifo">bichinho do mar</span>.
          </h1>
          <p className="lead">
            Solte na banheira, veja a água ganhar cor e bolhas, e descubra qual amigo do fundo do mar vai aparecer. São 12
            bombas efervescentes por caixa, cada uma com um brinquedo diferente.
          </p>
        </div>
        <FizzTub />
        <div className="hero-extra">
          <div className="hero-acoes">
            <a className="botao botao-coral" href="#kits">
              Escolher meu kit <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a className="botao botao-linha" href="#como-funciona">
              Como funciona
            </a>
          </div>
          <p className="hero-preco">A partir de {aPartirDe} a caixa com 12 bombinhas</p>
          <ul className="hero-fatos">
            <li>
              <strong>12</strong> bombinhas por caixa
            </li>
            <li>
              <strong>1</strong> bichinho em cada
            </li>
            <li>
              <strong>2</strong> temas para colecionar
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}

function NaCaixa() {
  return (
    <section className="secao azulejo" aria-labelledby="caixa-titulo">
      <div className="envelope duas-colunas">
        <div className="caixa" aria-hidden="true">
          <div className="caixa-tampa">
            <span>{marca.nome}</span>
            <span>12 bombinhas · tema A</span>
          </div>
          <div className="caixa-grade">
            {Array.from({ length: 12 }, (_, i) => (
              <div className="caixa-nicho" key={i}>
                {i === 6 ? <SeaToy id="polvo" className="caixa-bicho" /> : <BathBomb cor={coresBomba[i % coresBomba.length]} />}
              </div>
            ))}
          </div>
        </div>
        <div className="caixa-texto">
          <p className="sobretitulo">O que vem na caixa</p>
          <h2 id="caixa-titulo">Doze banhos, doze surpresas</h2>
          <p className="secao-intro">
            A caixa vem arrumada como uma coleção: cada bombinha no seu lugar, cada uma com um bichinho escondido.
          </p>
          <ul className="lista-check">
            {naCaixa.map((item) => (
              <li key={item.titulo}>
                <Check size={20} aria-hidden="true" />
                <span>
                  <strong>{item.titulo}</strong> {item.texto}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function ComoFunciona() {
  return (
    <section className="secao azulejo secao-colada" id="como-funciona" aria-labelledby="passos-titulo">
      <div className="envelope">
        <header className="secao-cabeca">
          <p className="sobretitulo">Como funciona</p>
          <h2 id="passos-titulo">Do pacote ao bichinho em quatro passos</h2>
        </header>
        <ol className="passos">
          {passos.map((p, i) => (
            <li key={p.titulo} className="passo">
              <span className="passo-numero" style={{ '--cor': coresBomba[i] }}>
                {i + 1}
              </span>
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Galeria() {
  if (!midia.length) return null
  return (
    <section className="secao azulejo secao-colada" aria-labelledby="galeria-titulo">
      <div className="envelope">
        <header className="secao-cabeca">
          <p className="sobretitulo">De perto</p>
          <h2 id="galeria-titulo">Veja as bombinhas em ação</h2>
        </header>
        <div className="galeria">
          {midia.map((m) =>
            m.tipo === 'video' ? (
              <video key={m.src} src={m.src} aria-label={m.alt} controls muted playsInline loop preload="metadata" />
            ) : (
              <img key={m.src} src={m.src} alt={m.alt} loading="lazy" />
            ),
          )}
        </div>
      </div>
    </section>
  )
}

function Bichinhos() {
  return (
    <section className="secao mar" id="bichinhos" aria-labelledby="bichos-titulo">
      <div className="envelope">
        <header className="secao-cabeca">
          <p className="sobretitulo">A coleção</p>
          <h2 id="bichos-titulo">Doze amigos do fundo do mar</h2>
          <p className="secao-intro">
            Cada bombinha esconde um deles. Quando o bichinho aparecer, conte a curiosidade dele para a criança.
          </p>
        </header>
        <ul className="bichos">
          {bichinhos.map((b) => (
            <li key={b.id} className="bicho">
              <SeaToy id={b.id} className="bicho-arte" />
              <h3>{b.nome}</h3>
              <p>{b.curiosidade}</p>
            </li>
          ))}
        </ul>
        <p className="nota">Ilustrações. Os brinquedos variam conforme o tema e o lote.</p>
      </div>
    </section>
  )
}

function Beneficios() {
  return (
    <section className="secao azulejo" aria-labelledby="beneficios-titulo">
      <div className="envelope">
        <header className="secao-cabeca">
          <p className="sobretitulo">Para os pais</p>
          <h2 id="beneficios-titulo">Por que o banho fica mais fácil</h2>
        </header>
        <ul className="beneficios">
          {beneficios.map((b) => {
            const Icone = icones[b.icone]
            return (
              <li key={b.titulo} className="beneficio">
                <Icone size={26} aria-hidden="true" />
                <h3>{b.titulo}</h3>
                <p>{b.texto}</p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

function Cuidados() {
  return (
    <section className="secao azulejo secao-colada" aria-labelledby="cuidados-titulo">
      <div className="envelope duas-colunas cuidados-grade">
        <div>
          <p className="sobretitulo">Segurança</p>
          <h2 id="cuidados-titulo">Cuidados na hora do banho</h2>
          <p className="secao-intro">Bombinha de banho é brinquedo de banheira, e alguns cuidados deixam tudo mais tranquilo.</p>
        </div>
        <ul className="cuidados">
          {cuidados.map((c) => (
            <li key={c}>
              <ShieldCheck size={20} aria-hidden="true" />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Depoimentos() {
  if (!depoimentos.length) return null
  return (
    <section className="secao azulejo secao-colada" aria-labelledby="depoimentos-titulo">
      <div className="envelope">
        <header className="secao-cabeca">
          <p className="sobretitulo">Quem já comprou</p>
          <h2 id="depoimentos-titulo">O que as famílias contam</h2>
        </header>
        <ul className="depoimentos">
          {depoimentos.map((d) => (
            <li key={d.nome + d.texto}>
              <blockquote>{d.texto}</blockquote>
              <p>
                {d.nome}
                {d.cidade && `, ${d.cidade}`}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Duvidas() {
  return (
    <section className="secao azulejo secao-colada" id="duvidas" aria-labelledby="duvidas-titulo">
      <div className="envelope estreito">
        <header className="secao-cabeca">
          <p className="sobretitulo">Dúvidas</p>
          <h2 id="duvidas-titulo">Perguntas que os pais fazem</h2>
        </header>
        <div className="faq">
          {perguntas.map((q) => (
            <details key={q.p}>
              <summary>
                {q.p}
                <Plus size={20} aria-hidden="true" />
              </summary>
              <p>{q.r}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function Final() {
  return (
    <section className="secao mar final" aria-labelledby="final-titulo">
      <div className="envelope final-conteudo">
        <div className="final-bichos" aria-hidden="true">
          {['tartaruga', 'baiacu', 'golfinho'].map((id) => (
            <SeaToy key={id} id={id} />
          ))}
        </div>
        <h2 id="final-titulo">O próximo banho já pode ter surpresa</h2>
        <p className="secao-intro">Caixa com 12 bombinhas a partir de {aPartirDe}.</p>
        <a className="botao botao-coral" href="#kits">
          Escolher meu kit <ArrowRight size={18} aria-hidden="true" />
        </a>
      </div>
      <footer className="envelope rodape">
        <Logo />
        <p>
          Imagens ilustrativas. Indicado a partir de 3 anos, com um adulto por perto. © {new Date().getFullYear()}{' '}
          {marca.nome}.
        </p>
      </footer>
    </section>
  )
}

function BarraCompra() {
  const [mostrar, setMostrar] = useState(false)
  useEffect(() => {
    const topo = document.getElementById('topo')
    const kitsSecao = document.getElementById('kits')
    const vistos = new Map()
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => vistos.set(e.target.id, e.isIntersecting))
      setMostrar(!vistos.get('topo') && !vistos.get('kits'))
    })
    io.observe(topo)
    io.observe(kitsSecao)
    return () => io.disconnect()
  }, [])
  return (
    <div className={mostrar ? 'barra-compra barra-visivel' : 'barra-compra'} aria-hidden={!mostrar}>
      <BathBomb cor="#6EDCB9" className="barra-bomba" />
      <p>
        <strong>12 bombinhas</strong>
        <span>a partir de {aPartirDe}</span>
      </p>
      <a className="botao botao-coral botao-pequeno" href="#kits" tabIndex={mostrar ? 0 : -1}>
        Comprar
      </a>
    </div>
  )
}

export default function App() {
  return (
    <>
      <Cabecalho />
      <main>
        <Hero />
        <NaCaixa />
        <ComoFunciona />
        <Galeria />
        <Bichinhos />
        <Beneficios />
        <Oferta />
        <Cuidados />
        <Depoimentos />
        <Duvidas />
      </main>
      <Final />
      <BarraCompra />
    </>
  )
}
