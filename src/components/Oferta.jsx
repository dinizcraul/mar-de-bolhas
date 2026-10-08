import { useState } from 'react'
import { ArrowRight, Check, Gift } from 'lucide-react'
import BathBomb from './BathBomb'
import { kits, temas, ocasioes, coresBomba } from '../data'
import { brl, linkCompra, abreFora } from '../compra'

const precoCaixa = kits[0].preco

export default function Oferta() {
  const [kitId, setKitId] = useState('duas')
  const [tema, setTema] = useState('A')
  const kit = kits.find((k) => k.id === kitId)
  const caixas = kit.bombas / 12
  const economia = precoCaixa * caixas - kit.preco
  const resumoTema = kit.escolheTema ? `Tema ${tema}` : kit.detalhe
  const mensagem = `Olá! Quero o kit ${kit.titulo} (${kit.bombas} bombinhas, ${resumoTema}) por ${brl(kit.preco)}.`
  const href = linkCompra(mensagem)

  return (
    <section className="secao azulejo secao-colada" id="kits" aria-labelledby="kits-titulo">
      <div className="envelope">
        <header className="secao-cabeca">
          <p className="sobretitulo">Kits</p>
          <h2 id="kits-titulo">Escolha seu kit</h2>
          <p className="secao-intro">Toda caixa traz 12 bombinhas e 12 bichinhos. Quanto mais caixas, menor o preço de cada bombinha.</p>
        </header>

        <div className="oferta">
          <div className="oferta-escolhas">
            <fieldset className="kits">
              <legend className="rotulo">Quantidade</legend>
              {kits.map((k) => (
                <label key={k.id} className={k.id === kitId ? 'kit kit-ativo' : 'kit'} htmlFor={`kit-${k.id}`}>
                  <input
                    type="radio"
                    id={`kit-${k.id}`}
                    name="kit"
                    value={k.id}
                    checked={k.id === kitId}
                    onChange={() => setKitId(k.id)}
                  />
                  <span className="kit-pilha" aria-hidden="true">
                    {Array.from({ length: k.bombas / 12 }, (_, i) => (
                      <span key={i} className="kit-caixinha" />
                    ))}
                  </span>
                  <span className="kit-texto">
                    <span className="kit-titulo">
                      {k.titulo}
                      {k.selo && <span className="selo">{k.selo}</span>}
                    </span>
                    <span className="kit-detalhe">
                      {k.bombas} bombinhas · {k.detalhe}
                    </span>
                  </span>
                  <span className="kit-preco">
                    <strong>{brl(k.preco)}</strong>
                    <span>{brl(k.preco / k.bombas)} cada</span>
                  </span>
                </label>
              ))}
            </fieldset>

            {kit.escolheTema && (
              <fieldset className="temas">
                <legend className="rotulo">Tema da caixa</legend>
                {temas.map((t) => (
                  <label key={t.id} className={t.id === tema ? 'tema tema-ativo' : 'tema'} htmlFor={`tema-${t.id}`}>
                    <input
                      type="radio"
                      id={`tema-${t.id}`}
                      name="tema"
                      value={t.id}
                      checked={t.id === tema}
                      onChange={() => setTema(t.id)}
                    />
                    <span className="tema-nome">{t.nome}</span>
                    <span className="tema-texto">{t.texto}</span>
                  </label>
                ))}
              </fieldset>
            )}
          </div>

          <aside className="resumo" aria-live="polite">
            <div className="resumo-bombas" aria-hidden="true">
              {coresBomba.slice(0, 5).map((c) => (
                <BathBomb key={c} cor={c} />
              ))}
            </div>
            <p className="resumo-kit">
              {kit.titulo} · {kit.bombas} bombinhas
              <span>{resumoTema}</span>
            </p>
            <p className="resumo-preco">{brl(kit.preco)}</p>
            <ul className="resumo-lista">
              <li>
                <Check size={18} aria-hidden="true" /> {brl(kit.preco / kit.bombas)} por bombinha
              </li>
              {economia > 0.5 && (
                <li>
                  <Check size={18} aria-hidden="true" /> {brl(economia)} a menos que {caixas} caixas avulsas
                </li>
              )}
              <li>
                <Check size={18} aria-hidden="true" /> {kit.bombas} bichinhos do mar, um em cada bomba
              </li>
              <li>
                <Check size={18} aria-hidden="true" /> Caixa de presente
              </li>
            </ul>
            <a className="botao botao-coral botao-largo" href={href} {...abreFora(href)}>
              Comprar agora <ArrowRight size={18} aria-hidden="true" />
            </a>
            <div className="ocasioes">
              <span className="ocasioes-rotulo">
                <Gift size={16} aria-hidden="true" /> Presente para
              </span>
              <ul>
                {ocasioes.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
