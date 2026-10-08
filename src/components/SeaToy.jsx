import { useId } from 'react'

// Bichinhos desenhados como brinquedos de borracha, todos no mesmo viewBox 100x100
const TINTA = '#14242c'

const cores = {
  polvo: ['#FF8FB8', '#E0608F'],
  tartaruga: ['#5CCB8A', '#2F9A60'],
  tubarao: ['#86AECF', '#527FA6'],
  golfinho: ['#6EC6FF', '#3E97D6'],
  baleia: ['#5B86E5', '#3459B8'],
  estrela: ['#FFB13D', '#E0820F'],
  cavalo: ['#FFD45C', '#DDA21C'],
  caranguejo: ['#FF6B5A', '#D4433A'],
  palhaco: ['#FF8A3D', '#DB631A'],
  aguaviva: ['#B9A4FF', '#8C73F0'],
  arraia: ['#7AD0C4', '#3F9F92'],
  baiacu: ['#B5E35D', '#82B52F'],
}

const rad = (g) => (g * Math.PI) / 180
const ponto = (cx, cy, r, g) => `${(cx + r * Math.cos(rad(g))).toFixed(2)} ${(cy + r * Math.sin(rad(g))).toFixed(2)}`

function estrela(cx, cy, fora, dentro, pontas = 5) {
  const pts = []
  for (let i = 0; i < pontas * 2; i++) {
    pts.push(ponto(cx, cy, i % 2 ? dentro : fora, -90 + (180 / pontas) * i))
  }
  return pts.join(' ')
}

function hexagono(cx, cy, r) {
  return Array.from({ length: 6 }, (_, i) => ponto(cx, cy, r, 30 + i * 60)).join(' ')
}

// Garra aberta: círculo com uma "boca" na direção indicada
function garra(cx, cy, r, direcao, abertura) {
  const a = ponto(cx, cy, r, direcao + abertura / 2)
  const b = ponto(cx, cy, r, direcao - abertura / 2)
  return `M${cx} ${cy} L${a} A${r} ${r} 0 1 1 ${b} Z`
}

function Olho({ x, y, r = 5 }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#fff" />
      <circle cx={x + r * 0.12} cy={y + r * 0.12} r={r * 0.6} fill={TINTA} />
      <circle cx={x + r * 0.34} cy={y - r * 0.18} r={r * 0.22} fill="#fff" />
    </g>
  )
}

function Sorriso({ x, y, w = 8 }) {
  return (
    <path
      d={`M${x - w / 2} ${y} Q${x} ${y + w * 0.55} ${x + w / 2} ${y}`}
      fill="none"
      stroke={TINTA}
      strokeWidth="2"
      strokeLinecap="round"
    />
  )
}

function Bochecha({ x, y }) {
  return <ellipse cx={x} cy={y} rx="4" ry="2.5" fill="#FF6F9F" opacity=".5" />
}

function Brilho({ x, y, rx = 9, ry = 4.5, rot = -28 }) {
  return <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#fff" opacity=".38" transform={`rotate(${rot} ${x} ${y})`} />
}

const desenhos = {
  polvo: ([c, e]) => (
    <>
      {['M30 58 Q20 74 28 88', 'M40 62 Q34 80 42 92', 'M50 63 Q53 80 47 94', 'M60 62 Q67 79 59 92', 'M70 58 Q81 72 73 88'].map((d) => (
        <path key={d} d={d} fill="none" stroke={c} strokeWidth="9" strokeLinecap="round" />
      ))}
      <ellipse cx="50" cy="42" rx="28" ry="26" fill={c} />
      <circle cx="34" cy="30" r="3" fill={e} opacity=".6" />
      <circle cx="64" cy="26" r="4" fill={e} opacity=".6" />
      <circle cx="70" cy="36" r="2.5" fill={e} opacity=".6" />
      <Olho x={41} y={46} r={6} />
      <Olho x={59} y={46} r={6} />
      <Bochecha x={32} y={55} />
      <Bochecha x={68} y={55} />
      <Sorriso x={50} y={56} />
      <Brilho x={40} y={26} />
    </>
  ),
  tartaruga: ([c, e]) => (
    <>
      <ellipse cx="26" cy="74" rx="11" ry="6" fill={e} transform="rotate(-18 26 74)" />
      <ellipse cx="64" cy="76" rx="12" ry="6" fill={e} transform="rotate(16 64 76)" />
      <circle cx="84" cy="56" r="11" fill={c} />
      <path d="M12 68 Q14 30 47 28 Q78 30 80 68 Z" fill={c} />
      <polygon points={hexagono(46, 44, 8)} fill={e} opacity=".55" />
      <polygon points={hexagono(30, 55, 6.5)} fill={e} opacity=".55" />
      <polygon points={hexagono(62, 55, 6.5)} fill={e} opacity=".55" />
      <rect x="10" y="63" width="73" height="9" rx="4.5" fill={e} />
      <Olho x={87} y={53} r={4} />
      <Sorriso x={88} y={60} w={6} />
      <Brilho x={32} y={38} rx={10} ry={4.5} />
    </>
  ),
  tubarao: ([c, e], id) => {
    const corpo = 'M12 56 Q28 32 60 34 Q86 38 94 56 Q86 72 60 74 Q28 76 12 56 Z'
    return (
      <>
        <defs>
          <clipPath id={`${id}corpo`}>
            <path d={corpo} />
          </clipPath>
        </defs>
        <path d="M18 56 L4 38 Q9 56 4 74 Z" fill={e} />
        <path d="M44 36 L54 14 Q60 26 65 36 Z" fill={e} />
        <path d={corpo} fill={c} />
        <ellipse cx="62" cy="76" rx="36" ry="12" fill="#fff" clipPath={`url(#${id}corpo)`} />
        <path d="M54 66 L45 84 L66 70 Z" fill={e} />
        {[62, 67, 72].map((x) => (
          <path key={x} d={`M${x} 49 Q${x - 2} 54 ${x} 59`} fill="none" stroke={e} strokeWidth="2" strokeLinecap="round" />
        ))}
        <Olho x={78} y={49} r={4.5} />
        <path d="M80 61 Q85 64 90 59" fill="none" stroke={TINTA} strokeWidth="2" strokeLinecap="round" />
        <Brilho x={44} y={43} rx={11} ry={4} rot={-12} />
      </>
    )
  },
  golfinho: ([c, e], id) => {
    const corpo = 'M10 64 Q22 36 54 34 Q74 33 84 44 Q92 46 96 50 Q90 55 84 54 Q76 66 54 68 Q32 70 22 64 Q16 62 10 64 Z'
    return (
      <>
        <defs>
          <clipPath id={`${id}corpo`}>
            <path d={corpo} />
          </clipPath>
        </defs>
        <path d="M14 64 L2 52 Q9 62 6 66 Q9 70 2 78 Z" fill={e} />
        <path d="M48 36 Q53 20 65 17 Q60 26 62 36 Z" fill={e} />
        <path d={corpo} fill={c} />
        <ellipse cx="62" cy="72" rx="36" ry="11" fill="#D4EEFF" clipPath={`url(#${id}corpo)`} />
        <path d="M52 64 Q47 79 59 81 Q59 72 64 66 Z" fill={e} />
        <Olho x={76} y={45} r={4} />
        <path d="M84 52 Q88 55 93 51" fill="none" stroke={TINTA} strokeWidth="2" strokeLinecap="round" />
        <Brilho x={42} y={42} rx={11} ry={4} rot={-18} />
      </>
    )
  },
  baleia: ([c, e], id) => {
    const corpo = 'M18 60 Q18 36 52 34 Q88 34 90 60 Q90 80 56 80 Q24 80 18 60 Z'
    return (
      <>
        <defs>
          <clipPath id={`${id}corpo`}>
            <path d={corpo} />
          </clipPath>
        </defs>
        <path d="M24 58 Q10 52 7 36 Q16 40 20 46 Q23 37 32 35 Q26 46 30 56 Z" fill={c} />
        <path d={corpo} fill={c} />
        <ellipse cx="60" cy="84" rx="36" ry="15" fill="#C9DAFF" clipPath={`url(#${id}corpo)`} />
        {[48, 56, 64, 72].map((x) => (
          <line key={x} x1={x} y1="72" x2={x} y2="80" stroke={e} strokeWidth="1.8" strokeLinecap="round" opacity=".5" />
        ))}
        <g fill="none" stroke="#6EC6FF" strokeWidth="3.5" strokeLinecap="round">
          <path d="M54 30 Q53 21 47 15" />
          <path d="M54 30 V12" />
          <path d="M54 30 Q55 21 61 15" />
        </g>
        <Olho x={72} y={55} r={4.5} />
        <Bochecha x={66} y={64} />
        <Sorriso x={78} y={64} w={7} />
        <Brilho x={40} y={44} rx={12} ry={5} rot={-20} />
      </>
    )
  },
  estrela: ([c, e]) => (
    <>
      <polygon points={estrela(50, 54, 38, 18)} fill={c} stroke={c} strokeWidth="10" strokeLinejoin="round" />
      {[0, 1, 2, 3, 4].map((i) => {
        const g = -90 + 72 * i
        return (
          <g key={i} fill={e} opacity=".55">
            <circle cx={50 + 26 * Math.cos(rad(g))} cy={54 + 26 * Math.sin(rad(g))} r="2.6" />
            <circle cx={50 + 34 * Math.cos(rad(g))} cy={54 + 34 * Math.sin(rad(g))} r="1.8" />
          </g>
        )
      })}
      <Olho x={43} y={50} r={5} />
      <Olho x={57} y={50} r={5} />
      <Sorriso x={50} y={60} w={7} />
      <Brilho x={38} y={30} rx={6} ry={3} rot={-60} />
    </>
  ),
  cavalo: ([c, e]) => (
    <>
      <path d="M54 62 Q63 76 57 86 Q51 95 42 89 Q37 83 46 80" fill="none" stroke={c} strokeWidth="9" strokeLinecap="round" />
      <path d="M61 42 Q75 44 71 58 Q65 53 60 56 Z" fill={e} />
      <path d="M44 30 Q66 34 63 52 Q61 67 50 71 Q39 69 39 56 Q38 43 44 30 Z" fill={c} />
      {[48, 54, 60].map((y) => (
        <line key={y} x1="42" y1={y} x2="53" y2={y} stroke={e} strokeWidth="2.2" strokeLinecap="round" opacity=".7" />
      ))}
      <path d="M38 15 L42 5 L46 14 Z M46 13 L52 5 L53 15 Z" fill={e} />
      <rect x="17" y="21" width="20" height="9" rx="4.5" fill={c} />
      <circle cx="44" cy="26" r="13" fill={c} />
      <circle cx="18" cy="25.5" r="2.4" fill={e} />
      <Olho x={45} y={24} r={4.6} />
      <Bochecha x={50} y={32} />
      <Brilho x={54} y={42} rx={6} ry={3} rot={-70} />
    </>
  ),
  caranguejo: ([c, e]) => (
    <>
      <g fill="none" stroke={e} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M28 60 L14 66 L10 76" />
        <path d="M30 66 L18 76 L17 86" />
        <path d="M36 70 L28 82 L30 90" />
        <path d="M72 60 L86 66 L90 76" />
        <path d="M70 66 L82 76 L83 86" />
        <path d="M64 70 L72 82 L70 90" />
      </g>
      <g fill="none" stroke={c} strokeWidth="6" strokeLinecap="round">
        <path d="M32 52 L22 38" />
        <path d="M68 52 L78 38" />
        <path d="M42 44 V30" strokeWidth="4" />
        <path d="M58 44 V30" strokeWidth="4" />
      </g>
      <path d={garra(20, 30, 11, -125, 55)} fill={c} />
      <path d={garra(80, 30, 11, -55, 55)} fill={c} />
      <ellipse cx="50" cy="58" rx="29" ry="18" fill={c} />
      <Olho x={42} y={27} r={5} />
      <Olho x={58} y={27} r={5} />
      <Bochecha x={37} y={61} />
      <Bochecha x={63} y={61} />
      <Sorriso x={50} y={61} />
      <Brilho x={38} y={49} rx={9} ry={3.6} rot={-14} />
    </>
  ),
  palhaco: ([c, e], id) => (
    <>
      <defs>
        <clipPath id={`${id}corpo`}>
          <ellipse cx="54" cy="52" rx="34" ry="22" />
        </clipPath>
      </defs>
      <path d="M43 34 Q53 19 67 33 Z" fill={c} stroke={TINTA} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M24 52 L6 37 Q11 52 6 67 Z" fill={c} stroke={TINTA} strokeWidth="1.6" strokeLinejoin="round" />
      <ellipse cx="54" cy="52" rx="34" ry="22" fill={c} />
      <g clipPath={`url(#${id}corpo)`} fill="#fff" stroke={TINTA} strokeWidth="1.8">
        <rect x="69" y="20" width="8" height="70" rx="3" />
        <rect x="49" y="20" width="9" height="70" rx="3" />
        <rect x="30" y="20" width="7" height="70" rx="3" />
      </g>
      <ellipse cx="54" cy="52" rx="34" ry="22" fill="none" stroke={TINTA} strokeWidth="1.6" />
      <path d="M50 72 Q57 84 65 72 Z" fill={e} />
      <Olho x={80} y={47} r={4.5} />
      <path d="M83 58 Q86 60 89 57" fill="none" stroke={TINTA} strokeWidth="2" strokeLinecap="round" />
      <Brilho x={44} y={40} rx={8} ry={3.4} rot={-16} />
    </>
  ),
  aguaviva: ([c, e]) => (
    <>
      <g fill="none" stroke={e} strokeWidth="4" strokeLinecap="round">
        <path d="M32 58 Q27 68 33 76 Q39 84 32 93" />
        <path d="M44 60 Q40 71 46 79 Q52 87 45 95" />
        <path d="M56 60 Q60 71 54 79 Q48 87 55 95" />
        <path d="M68 58 Q73 68 67 76 Q61 84 68 93" />
      </g>
      <path d="M18 56 Q18 18 50 18 Q82 18 82 56 Z" fill={c} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle key={i} cx={22 + i * 11.2} cy="56" r="6" fill={c} />
      ))}
      <Olho x={41} y={41} r={5} />
      <Olho x={59} y={41} r={5} />
      <Bochecha x={33} y={49} />
      <Bochecha x={67} y={49} />
      <Sorriso x={50} y={49} w={7} />
      <Brilho x={36} y={29} rx={9} ry={4} />
    </>
  ),
  arraia: ([c, e]) => (
    <>
      <path d="M50 70 Q55 84 66 95" fill="none" stroke={e} strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="44" cy="71" rx="5" ry="3.5" fill={e} />
      <ellipse cx="56" cy="71" rx="5" ry="3.5" fill={e} />
      <path d="M50 22 Q62 30 93 46 Q71 58 56 70 Q50 76 44 70 Q29 58 7 46 Q38 30 50 22 Z" fill={c} />
      <circle cx="28" cy="47" r="3" fill={e} opacity=".5" />
      <circle cx="72" cy="47" r="3" fill={e} opacity=".5" />
      <circle cx="50" cy="34" r="2.4" fill={e} opacity=".5" />
      <Olho x={43} y={45} r={4.5} />
      <Olho x={57} y={45} r={4.5} />
      <Sorriso x={50} y={55} w={7} />
      <Brilho x={34} y={40} rx={9} ry={3.4} rot={-22} />
    </>
  ),
  baiacu: ([c, e], id) => (
    <>
      <defs>
        <clipPath id={`${id}corpo`}>
          <circle cx="50" cy="52" r="30" />
        </clipPath>
      </defs>
      {Array.from({ length: 14 }, (_, i) => {
        const g = (360 / 14) * i
        return <polygon key={i} points={`${ponto(50, 52, 27, g - 7)} ${ponto(50, 52, 39, g)} ${ponto(50, 52, 27, g + 7)}`} fill={e} />
      })}
      <ellipse cx="18" cy="60" rx="8" ry="5" fill={e} transform="rotate(-30 18 60)" />
      <ellipse cx="82" cy="60" rx="8" ry="5" fill={e} transform="rotate(30 82 60)" />
      <circle cx="50" cy="52" r="30" fill={c} />
      <ellipse cx="50" cy="76" rx="27" ry="14" fill="#F2FFD8" clipPath={`url(#${id}corpo)`} />
      <Olho x={40} y={46} r={6} />
      <Olho x={60} y={46} r={6} />
      <circle cx="50" cy="61" r="3.6" fill={TINTA} />
      <Bochecha x={31} y={56} />
      <Bochecha x={69} y={56} />
      <Brilho x={38} y={33} rx={9} ry={4} />
    </>
  ),
}

export default function SeaToy({ id, className, titulo }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const desenho = desenhos[id]
  if (!desenho) return null
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role={titulo ? 'img' : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
    >
      {desenho(cores[id], `t${uid}`)}
    </svg>
  )
}
