import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Copy,
  Lock,
  MessageCircle,
  PartyPopper,
  Pencil,
  QrCode as IconeQr,
  ShieldCheck,
  Truck,
  Zap,
} from 'lucide-react'
import Logo from './Logo'
import BathBomb from './BathBomb'
import QrCode from './QrCode'
import { kits, temas, fretes, coresBomba, PIX, WHATSAPP, marca } from '../data'
import { brl } from '../compra'
import { codigoPix, novoCodigoPedido } from '../pix'
import { evento, compra } from '../pixel'
import { utmsDoCliente } from '../utms'

const GUARDA = 'mar-de-bolhas:checkout'
// A API de pedidos só existe no site publicado (Cloudflare), não no arquivo aberto direto do computador
const API = window.location.protocol.startsWith('http')

const vazio = {
  nome: '',
  email: '',
  telefone: '',
  cpf: '',
  cep: '',
  rua: '',
  numero: '',
  semNumero: false,
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
}

// ---------- máscaras e validações ----------

const digitos = (v) => v.replace(/\D/g, '')

const mascaras = {
  cpf: (v) =>
    digitos(v)
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2'),
  telefone: (v) => {
    const d = digitos(v).slice(0, 11)
    if (d.length <= 2) return d.replace(/(\d{1,2})/, '($1')
    if (d.length <= 6) return d.replace(/(\d{2})(\d+)/, '($1) $2')
    if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3')
    return d.replace(/(\d{2})(\d{5})(\d+)/, '($1) $2-$3')
  },
  cep: (v) => digitos(v).slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2'),
  uf: (v) => v.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase(),
}

function cpfValido(valor) {
  const d = digitos(valor)
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false
  const dv = (n) => {
    let soma = 0
    for (let i = 0; i < n; i++) soma += Number(d[i]) * (n + 1 - i)
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }
  return dv(9) === Number(d[9]) && dv(10) === Number(d[10])
}

const UFS = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ')

const erros = {
  nome: (f) => (f.nome.trim().split(/\s+/).length < 2 ? 'Escreva nome e sobrenome.' : ''),
  email: (f) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim()) ? '' : 'Confira o e-mail.'),
  telefone: (f) => (digitos(f.telefone).length >= 10 ? '' : 'Escreva o celular com DDD.'),
  cpf: (f) => (cpfValido(f.cpf) ? '' : 'Esse CPF não parece certo. Confira os números.'),
  cep: (f) => (digitos(f.cep).length === 8 ? '' : 'O CEP tem 8 números.'),
  rua: (f) => (f.rua.trim() ? '' : 'Escreva a rua.'),
  numero: (f) => (f.semNumero || f.numero.trim() ? '' : 'Escreva o número ou marque "Sem número".'),
  bairro: (f) => (f.bairro.trim() ? '' : 'Escreva o bairro.'),
  cidade: (f) => (f.cidade.trim() ? '' : 'Escreva a cidade.'),
  uf: (f) => (UFS.includes(f.uf) ? '' : 'Use a sigla, ex.: MG.'),
}

const camposEtapa = {
  1: ['nome', 'email', 'telefone', 'cpf'],
  2: ['cep', 'rua', 'numero', 'bairro', 'cidade', 'uf'],
}

// Sugere o domínio certo quando o e-mail tem um erro de digitação comum (gmial.com, hotmal.com...)
const DOMINIOS = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com.br', 'yahoo.com', 'icloud.com', 'live.com', 'uol.com.br', 'bol.com.br']

function distancia(a, b) {
  const linha = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let anterior = linha[0]
    linha[0] = i
    for (let j = 1; j <= b.length; j++) {
      const guardado = linha[j]
      linha[j] = Math.min(linha[j] + 1, linha[j - 1] + 1, anterior + (a[i - 1] === b[j - 1] ? 0 : 1))
      anterior = guardado
    }
  }
  return linha[b.length]
}

function sugestaoEmail(email) {
  const [usuario, dominio] = email.trim().toLowerCase().split('@')
  if (!usuario || !dominio || DOMINIOS.includes(dominio)) return ''
  const perto = DOMINIOS.find((d) => distancia(dominio, d) <= 2)
  return perto ? `${usuario}@${perto}` : ''
}

// ---------- estado guardado no navegador ----------

function lerGuardado() {
  try {
    return JSON.parse(localStorage.getItem(GUARDA)) || {}
  } catch {
    return {}
  }
}

function guardar(estado) {
  try {
    localStorage.setItem(GUARDA, JSON.stringify(estado))
  } catch {
    // navegação privada ou armazenamento cheio: o checkout segue funcionando sem guardar
  }
}

function lerParametros() {
  const busca = new URLSearchParams(window.location.hash.split('?')[1] || '')
  return { kit: busca.get('kit'), tema: busca.get('tema') }
}

// ---------- peças ----------

function Campo({ id, rotulo, erro, dica, className = '', children, ...props }) {
  return (
    <div className={`campo ${className}`}>
      <label htmlFor={id}>{rotulo}</label>
      {children || <input id={id} aria-invalid={!!erro} aria-describedby={erro ? `${id}-erro` : undefined} {...props} />}
      {erro ? (
        <p className="campo-erro" id={`${id}-erro`}>
          {erro}
        </p>
      ) : (
        dica && <p className="campo-dica">{dica}</p>
      )}
    </div>
  )
}

function Etapa({ numero, titulo, Icone, estado, resumo, onEditar, children }) {
  // estado: 'aberta' | 'feita' | 'futura'
  return (
    <section className={`etapa etapa-${estado}`} aria-labelledby={`etapa-${numero}`}>
      <header className="etapa-cabeca">
        <span className="etapa-numero" aria-hidden="true">
          {estado === 'feita' ? <Check size={18} /> : numero}
        </span>
        <h2 id={`etapa-${numero}`}>
          <Icone size={20} aria-hidden="true" /> {titulo}
        </h2>
        {estado === 'feita' && onEditar && (
          <button type="button" className="etapa-editar" onClick={onEditar}>
            <Pencil size={15} aria-hidden="true" /> Editar
          </button>
        )}
      </header>
      {estado === 'feita' && resumo && <div className="etapa-resumo">{resumo}</div>}
      {estado === 'aberta' && <div className="etapa-corpo">{children}</div>}
      {estado === 'futura' && <p className="etapa-espera">Preencha a etapa anterior para continuar.</p>}
    </section>
  )
}

function Resumo({ kit, kitId, setKitId, tema, setTema, frete, total, travado }) {
  return (
    <div className="ck-resumo">
      <div className="ck-produto">
        <div className="ck-produto-arte" aria-hidden="true">
          {coresBomba.slice(0, 3).map((c) => (
            <BathBomb key={c} cor={c} />
          ))}
          <span className="ck-produto-qtd">{kit.bombas / 12}</span>
        </div>
        <div>
          <p className="ck-produto-nome">
            {marca.nome} · {kit.titulo}
          </p>
          <p className="ck-produto-detalhe">
            {kit.bombas} bombinhas · {kit.escolheTema ? `Tema ${tema}` : kit.detalhe}
          </p>
        </div>
        <strong className="ck-produto-preco">{brl(kit.preco)}</strong>
      </div>

      {!travado && (
        <div className="ck-trocar">
          <label>
            <span>Kit</span>
            <select value={kitId} onChange={(e) => setKitId(e.target.value)}>
              {kits.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.titulo} ({k.bombas} bombinhas) · {brl(k.preco)}
                </option>
              ))}
            </select>
          </label>
          {kit.escolheTema && (
            <label>
              <span>Tema</span>
              <select value={tema} onChange={(e) => setTema(e.target.value)}>
                {temas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}

      <dl className="ck-contas">
        <div>
          <dt>Produtos</dt>
          <dd>{brl(kit.preco)}</dd>
        </div>
        <div>
          <dt>Entrega</dt>
          <dd>{frete ? (frete.valor ? brl(frete.valor) : 'Grátis') : 'Na etapa 2'}</dd>
        </div>
        <div className="ck-total">
          <dt>Total no Pix</dt>
          <dd>{brl(total)}</dd>
        </div>
      </dl>
      <p className="ck-por-bomba">{brl(kit.preco / kit.bombas)} por bombinha, com bichinho surpresa</p>
    </div>
  )
}

// ---------- checkout ----------

export default function Checkout() {
  const inicial = useMemo(() => {
    const salvo = lerGuardado()
    const url = lerParametros()
    const kitUrl = kits.find((k) => k.id === url.kit)?.id
    const temaUrl = temas.find((t) => t.id === url.tema)?.id
    const veioDoSite = kitUrl || temaUrl
    return {
      kitId: kitUrl || salvo.kitId || 'duas',
      tema: temaUrl || salvo.tema || 'A',
      form: { ...vazio, ...salvo.form },
      freteId: salvo.freteId || (fretes.length === 1 ? fretes[0].id : ''),
      // Um pedido novo vindo dos botões do site começa sem Pix gerado
      pedido: veioDoSite ? null : salvo.pedido || null,
      // O código só muda depois que o cliente avisa que pagou: gerar o Pix de novo mantém o mesmo pedido
      codigo: salvo.codigo || null,
    }
  }, [])

  const [kitId, setKitId] = useState(inicial.kitId)
  const [tema, setTema] = useState(inicial.tema)
  const [form, setForm] = useState(inicial.form)
  const [freteId, setFreteId] = useState(inicial.freteId)
  const [pedido, setPedido] = useState(inicial.pedido)
  const [codigo, setCodigo] = useState(inicial.codigo)
  const [tocados, setTocados] = useState({})
  const [etapa, setEtapa] = useState(() => {
    if (inicial.pedido) return 3
    if (camposEtapa[1].some((c) => erros[c](inicial.form))) return 1
    if (camposEtapa[2].some((c) => erros[c](inicial.form))) return 2
    return 3
  })
  const [buscaCep, setBuscaCep] = useState('')
  const [copiado, setCopiado] = useState(false)
  const numeroRef = useRef(null)
  const topoRef = useRef(null)

  const kit = kits.find((k) => k.id === kitId) || kits[0]
  const frete = fretes.find((f) => f.id === freteId)
  const total = kit.preco + (frete?.valor || 0)
  const resumoTema = kit.escolheTema ? `Tema ${tema}` : kit.detalhe
  const pagamentoMarcado = useRef(false)

  // Dados do pedido para o Pixel da Meta (src/pixel.js)
  const dadosPixel = (valor) => ({
    content_ids: [kit.id],
    content_name: `${kit.titulo} (${kit.bombas} bombinhas)`,
    content_type: 'product',
    num_items: kit.bombas / 12,
    value: Math.round(valor * 100) / 100,
    currency: 'BRL',
  })

  useEffect(() => {
    if (!pedido) evento('AddToCart', dadosPixel(kit.preco))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kitId])

  useEffect(() => {
    if (etapa !== 3 || pedido || pagamentoMarcado.current) return
    pagamentoMarcado.current = true
    evento('AddPaymentInfo', dadosPixel(total))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etapa, pedido])

  useEffect(() => {
    guardar({ kitId, tema, form, freteId, pedido, codigo })
  }, [kitId, tema, form, freteId, pedido, codigo])

  useEffect(() => {
    window.scrollTo(0, 0)
    // Tira kit e tema do endereço: recarregar a página continua o mesmo pedido
    if (window.location.hash.includes('?')) history.replaceState(null, '', '#checkout')
  }, [])

  const mudar = (campo) => (e) => {
    const bruto = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    const valor = mascaras[campo] ? mascaras[campo](bruto) : bruto
    setForm((f) => ({ ...f, [campo]: valor }))
    if (campo === 'cep' && digitos(valor).length === 8 && digitos(valor) !== digitos(form.cep)) procurarCep(digitos(valor))
  }
  const tocar = (campo) => () => setTocados((t) => ({ ...t, [campo]: true }))
  const erroDe = (campo) => (tocados[campo] ? erros[campo](form) : '')

  const ligar = (campo) => ({
    id: `ck-${campo}`,
    value: form[campo],
    onChange: mudar(campo),
    onBlur: tocar(campo),
  })

  // Endereço pelo CEP (ViaCEP, serviço público e gratuito). Se falhar, o cliente preenche à mão.
  async function procurarCep(cep) {
    setBuscaCep('buscando')
    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const dados = await resposta.json()
      if (dados.erro) throw new Error('cep')
      setForm((f) => ({
        ...f,
        rua: dados.logradouro || f.rua,
        bairro: dados.bairro || f.bairro,
        cidade: dados.localidade || f.cidade,
        uf: dados.uf || f.uf,
      }))
      setBuscaCep('')
      requestAnimationFrame(() => numeroRef.current?.focus())
    } catch {
      setBuscaCep('falhou')
    }
  }

  function avancar(numero) {
    const campos = camposEtapa[numero]
    setTocados((t) => ({ ...t, ...Object.fromEntries(campos.map((c) => [c, true])) }))
    const primeiroErro = campos.find((c) => erros[c](form))
    if (primeiroErro) {
      document.getElementById(`ck-${primeiroErro}`)?.focus()
      return
    }
    if (numero === 2 && !frete) return
    setEtapa(numero + 1)
    requestAnimationFrame(() => document.getElementById(`etapa-${numero + 1}`)?.scrollIntoView({ block: 'start' }))
  }

  function gerarPix() {
    const novo = codigo || novoCodigoPedido()
    setCodigo(novo)
    setPedido({ codigo: novo, criadoEm: Date.now() })
    enviarPedido(novo)
    compra(novo, dadosPixel(total))
    requestAnimationFrame(() => topoRef.current?.scrollIntoView({ block: 'start' }))
  }

  // Guarda o pedido no banco do site (worker/index.js), para aparecer na página de pedidos.
  // Se não der (site aberto direto do computador, sem internet), o checkout segue igual.
  function enviarPedido(codigoPedido) {
    if (!API) return
    fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ codigo: codigoPedido, kitId: kit.id, tema, freteId, cliente: form, utms: utmsDoCliente() }),
      keepalive: true,
    }).catch(() => {})
  }

  function avisarPagamento() {
    if (API) fetch(`/api/pedidos/${pedido.codigo}/paguei`, { method: 'POST', keepalive: true }).catch(() => {})
    setPedido((p) => ({ ...p, avisou: true }))
    setCodigo(null)
  }

  const pix = useMemo(
    () =>
      pedido && PIX.chave
        ? codigoPix({ chave: PIX.chave, nome: PIX.nome, cidade: PIX.cidade, valor: total, txid: pedido.codigo })
        : '',
    [pedido, total],
  )

  async function copiar() {
    try {
      await navigator.clipboard.writeText(pix)
    } catch {
      const area = document.getElementById('ck-pix-codigo')
      area?.select()
      document.execCommand?.('copy')
    }
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  const endereco = `${form.rua}, ${form.semNumero ? 'S/N' : form.numero}${form.complemento ? `, ${form.complemento}` : ''} - ${form.bairro}, ${form.cidade}/${form.uf}, CEP ${form.cep}`
  const mensagemPedido = pedido
    ? [
        `Olá! Fiz o pedido ${pedido.codigo} no site e paguei ${brl(total)} no Pix.`,
        '',
        `Kit: ${kit.titulo} (${kit.bombas} bombinhas, ${resumoTema})`,
        `Entrega: ${frete?.nome} (${frete?.valor ? brl(frete.valor) : 'grátis'})`,
        '',
        `Nome: ${form.nome.trim()}`,
        `CPF: ${form.cpf}`,
        `Celular: ${form.telefone}`,
        `E-mail: ${form.email.trim()}`,
        `Endereço: ${endereco}`,
        '',
        'Vou mandar o comprovante aqui.',
      ].join('\n')
    : ''
  const linkWhats = WHATSAPP ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagemPedido)}` : ''

  const sugestao = sugestaoEmail(form.email)
  const estadoDe = (n) => (pedido ? 'feita' : etapa === n ? 'aberta' : etapa > n ? 'feita' : 'futura')
  const editar = (n) => () => {
    setPedido(null)
    setEtapa(n)
  }

  return (
    <div className="checkout" ref={topoRef}>
      <header className="ck-topo">
        <div className="envelope ck-topo-linha">
          <a href="#kits" className="ck-voltar" aria-label="Voltar para a loja">
            <ArrowLeft size={20} aria-hidden="true" />
          </a>
          <Logo />
          <p className="ck-seguro">
            <Lock size={16} aria-hidden="true" /> Compra segura
          </p>
        </div>
      </header>

      <main className="envelope ck-grade">
        <details className="ck-resumo-movel">
          <summary>
            <span>
              Resumo do pedido <ChevronDown size={18} aria-hidden="true" />
            </span>
            <strong>{brl(total)}</strong>
          </summary>
          <Resumo
            kit={kit}
            kitId={kitId}
            setKitId={setKitId}
            tema={tema}
            setTema={setTema}
            frete={frete}
            total={total}
            travado={!!pedido}
          />
        </details>

        <div className="ck-etapas">
          {pedido ? (
            <section className="ck-pix" aria-labelledby="pix-titulo">
              {PIX.chave ? (
                <>
                  <p className="sobretitulo">Pedido {pedido.codigo}</p>
                  <h1 id="pix-titulo">Falta só pagar o Pix</h1>
                  <p className="ck-pix-valor">
                    <span>Valor</span>
                    <strong>{brl(total)}</strong>
                  </p>
                  <div className="ck-pix-grade">
                    <div className="ck-pix-qr">
                      <QrCode texto={pix} rotulo={`QR code do Pix de ${brl(total)}`} />
                      <p>Aponte a câmera do app do banco</p>
                    </div>
                    <div className="ck-pix-copia">
                      <label htmlFor="ck-pix-codigo" className="rotulo">
                        Pix copia e cola
                      </label>
                      <textarea id="ck-pix-codigo" readOnly value={pix} rows={4} onFocus={(e) => e.target.select()} />
                      <button type="button" className="botao botao-coral botao-largo" onClick={copiar}>
                        {copiado ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
                        {copiado ? 'Código copiado' : 'Copiar código Pix'}
                      </button>
                      <p className="sr-only" aria-live="polite">
                        {copiado ? 'Código Pix copiado' : ''}
                      </p>
                      <ol className="ck-pix-passos">
                        <li>Abra o app do seu banco e escolha Pix.</li>
                        <li>Toque em &quot;Pix copia e cola&quot; e cole o código, ou leia o QR code.</li>
                        <li>Confira o valor de {brl(total)} e confirme.</li>
                      </ol>
                    </div>
                  </div>
                  <div className="ck-pix-depois" aria-live="polite">
                    {pedido.avisou ? (
                      <div className="ck-pix-ok">
                        <h2>
                          <PartyPopper size={20} aria-hidden="true" /> Recebemos seu aviso
                        </h2>
                        <p>
                          Assim que o Pix aparecer na conta, separamos o seu kit e te avisamos com o código de
                          rastreio. Guarde o comprovante e o código do pedido, <strong>{pedido.codigo}</strong>.
                        </p>
                        {linkWhats && (
                          <a className="botao botao-linha botao-largo" href={linkWhats} target="_blank" rel="noopener noreferrer">
                            <MessageCircle size={18} aria-hidden="true" /> Mandar o comprovante pelo WhatsApp
                          </a>
                        )}
                      </div>
                    ) : (
                      <>
                        <h2>Depois de pagar</h2>
                        <p>
                          {linkWhats
                            ? 'Toque abaixo para avisar e mandar o comprovante pelo WhatsApp. O pedido já vai escrito, com seus dados e o endereço.'
                            : 'Toque abaixo para avisar que pagou. Conferimos o Pix pelo código do pedido, que aparece no comprovante.'}
                        </p>
                        {linkWhats ? (
                          <a
                            className="botao botao-mar botao-largo"
                            href={linkWhats}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={avisarPagamento}
                          >
                            <MessageCircle size={18} aria-hidden="true" /> Já paguei, enviar comprovante
                          </a>
                        ) : (
                          <button type="button" className="botao botao-mar botao-largo" onClick={avisarPagamento}>
                            <Check size={18} aria-hidden="true" /> Já paguei
                          </button>
                        )}
                        <button type="button" className="ck-link" onClick={editar(3)}>
                          Alterar o pedido
                        </button>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="ck-aviso" role="alert">
                  <h1 id="pix-titulo">Pix ainda não configurado</h1>
                  <p>
                    Para receber pagamentos, preencha a chave aleatória em <code>PIX.chave</code> no arquivo{' '}
                    <code>src/data.js</code>. Esta tela aparece só enquanto a chave estiver vazia.
                  </p>
                  <button type="button" className="botao botao-linha" onClick={editar(3)}>
                    Voltar
                  </button>
                </div>
              )}
            </section>
          ) : (
            <ol className="ck-progresso" aria-label="Etapas da compra">
              {['Seus dados', 'Entrega', 'Pagamento'].map((nome, i) => (
                <li key={nome} className={etapa > i + 1 ? 'feito' : etapa === i + 1 ? 'atual' : ''} aria-current={etapa === i + 1 ? 'step' : undefined}>
                  <span>{i + 1}</span> {nome}
                </li>
              ))}
            </ol>
          )}

          {!pedido && (
            <>
              <Etapa
                numero={1}
                titulo="Seus dados"
                Icone={ShieldCheck}
                estado={estadoDe(1)}
                onEditar={editar(1)}
                resumo={
                  <>
                    <p>{form.nome}</p>
                    <p>{form.email}</p>
                    <p>
                      {form.telefone} · CPF {form.cpf}
                    </p>
                  </>
                }
              >
                <form
                  className="ck-form"
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault()
                    avancar(1)
                  }}
                >
                  <Campo rotulo="Nome completo" erro={erroDe('nome')} autoComplete="name" {...ligar('nome')} />
                  <Campo
                    rotulo="E-mail"
                    erro={erroDe('email')}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    dica="Para avisar sobre o envio."
                    {...ligar('email')}
                  />
                  {sugestao && (
                    <p className="ck-sugestao">
                      Você quis dizer{' '}
                      <button type="button" onClick={() => setForm((f) => ({ ...f, email: sugestao }))}>
                        {sugestao}
                      </button>
                      ?
                    </p>
                  )}
                  <div className="ck-linha">
                    <Campo
                      rotulo="Celular com DDD"
                      erro={erroDe('telefone')}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      placeholder="(31) 99999-9999"
                      {...ligar('telefone')}
                    />
                    <Campo
                      rotulo="CPF"
                      erro={erroDe('cpf')}
                      inputMode="numeric"
                      placeholder="000.000.000-00"
                      dica="Vai na nota do envio."
                      {...ligar('cpf')}
                    />
                  </div>
                  <button type="submit" className="botao botao-coral botao-largo">
                    Ir para a entrega
                  </button>
                </form>
              </Etapa>

              <Etapa
                numero={2}
                titulo="Entrega"
                Icone={Truck}
                estado={estadoDe(2)}
                onEditar={editar(2)}
                resumo={
                  <>
                    <p>{endereco}</p>
                    {frete && (
                      <p>
                        {frete.nome} · {frete.valor ? brl(frete.valor) : 'Grátis'} · {frete.prazo}
                      </p>
                    )}
                  </>
                }
              >
                <form
                  className="ck-form"
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault()
                    avancar(2)
                  }}
                >
                  <Campo
                    rotulo="CEP"
                    erro={erroDe('cep')}
                    className="campo-cep"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    placeholder="00000-000"
                    dica={
                      buscaCep === 'buscando'
                        ? 'Procurando o endereço...'
                        : buscaCep === 'falhou'
                          ? 'Não achamos esse CEP. Preencha o endereço abaixo.'
                          : ''
                    }
                    {...ligar('cep')}
                  />
                  <Campo rotulo="Rua" erro={erroDe('rua')} autoComplete="address-line1" {...ligar('rua')} />
                  <div className="ck-linha ck-linha-numero">
                    <div className="campo">
                      <label htmlFor="ck-numero">Número</label>
                      <input
                        ref={numeroRef}
                        inputMode="numeric"
                        disabled={form.semNumero}
                        aria-invalid={!!erroDe('numero')}
                        aria-describedby={erroDe('numero') ? 'ck-numero-erro' : undefined}
                        {...ligar('numero')}
                      />
                      <label className="ck-check">
                        <input type="checkbox" checked={form.semNumero} onChange={mudar('semNumero')} /> Sem número
                      </label>
                      {erroDe('numero') && (
                        <p className="campo-erro" id="ck-numero-erro">
                          {erroDe('numero')}
                        </p>
                      )}
                    </div>
                    <Campo rotulo="Complemento (opcional)" autoComplete="address-line2" placeholder="Apto, bloco, casa" {...ligar('complemento')} />
                  </div>
                  <Campo rotulo="Bairro" erro={erroDe('bairro')} {...ligar('bairro')} />
                  <div className="ck-linha ck-linha-cidade">
                    <Campo rotulo="Cidade" erro={erroDe('cidade')} autoComplete="address-level2" {...ligar('cidade')} />
                    <Campo rotulo="UF" erro={erroDe('uf')} autoComplete="address-level1" placeholder="MG" {...ligar('uf')} />
                  </div>

                  <fieldset className="ck-fretes">
                    <legend className="rotulo">Forma de entrega</legend>
                    {fretes.map((f) => (
                      <label key={f.id} className={f.id === freteId ? 'ck-opcao ck-opcao-ativa' : 'ck-opcao'}>
                        <input type="radio" name="frete" checked={f.id === freteId} onChange={() => setFreteId(f.id)} />
                        <span>
                          <strong>{f.nome}</strong>
                          <span>{f.prazo}</span>
                        </span>
                        <strong>{f.valor ? brl(f.valor) : 'Grátis'}</strong>
                      </label>
                    ))}
                  </fieldset>

                  <button type="submit" className="botao botao-coral botao-largo">
                    Ir para o pagamento
                  </button>
                </form>
              </Etapa>

              <Etapa numero={3} titulo="Pagamento" Icone={IconeQr} estado={estadoDe(3)}>
                <div className="ck-opcao ck-opcao-ativa ck-metodo">
                  <IconeQr size={26} aria-hidden="true" />
                  <span>
                    <strong>Pix</strong>
                    <span>QR code ou copia e cola, direto do app do seu banco.</span>
                  </span>
                  <strong>{brl(total)}</strong>
                </div>
                <ul className="ck-vantagens">
                  <li>
                    <Zap size={18} aria-hidden="true" /> Pagamento confirmado na hora, sem boleto para esperar
                  </li>
                  <li>
                    <ShieldCheck size={18} aria-hidden="true" /> Você confere o recebedor no app do banco antes de pagar
                  </li>
                </ul>
                <button type="button" className="botao botao-coral botao-largo" onClick={gerarPix}>
                  Gerar Pix de {brl(total)}
                </button>
              </Etapa>
            </>
          )}
        </div>

        <aside className="ck-lateral" aria-label="Resumo do pedido">
          <h2 className="rotulo">Resumo do pedido</h2>
          <Resumo
            kit={kit}
            kitId={kitId}
            setKitId={setKitId}
            tema={tema}
            setTema={setTema}
            frete={frete}
            total={total}
            travado={!!pedido}
          />
          <ul className="ck-selos">
            <li>
              <Lock size={16} aria-hidden="true" /> Pagamento direto para a nossa conta, pelo app do seu banco
            </li>
            <li>
              <ShieldCheck size={16} aria-hidden="true" /> Seus dados servem só para entregar o pedido
            </li>
          </ul>
        </aside>
      </main>
    </div>
  )
}
