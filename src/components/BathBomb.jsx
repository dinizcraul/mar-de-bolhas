import { useId } from 'react'

// Pontinhos fixos (gerados uma vez) para imitar a textura de pó prensado
const pontinhos = (() => {
  let s = 7
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  return Array.from({ length: 46 }, () => {
    const a = rnd() * Math.PI * 2
    const d = Math.sqrt(rnd()) * 40
    return { x: 50 + Math.cos(a) * d, y: 50 + Math.sin(a) * d, r: 0.7 + rnd() * 1.5, claro: rnd() > 0.45 }
  })
})()

export default function BathBomb({ cor = '#FF8FB8', className }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`b${uid}luz`} cx="36%" cy="30%" r="78%">
          <stop offset="0" stopColor="#fff" stopOpacity=".6" />
          <stop offset=".42" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#0b2a30" stopOpacity=".28" />
        </radialGradient>
        <clipPath id={`b${uid}forma`}>
          <circle cx="50" cy="50" r="44" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="44" fill={cor} />
      <g clipPath={`url(#b${uid}forma)`}>
        {pontinhos.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={p.claro ? '#fff' : '#0b2a30'} opacity={p.claro ? 0.55 : 0.14} />
        ))}
        {/* a emenda das duas metades da forma */}
        <ellipse cx="50" cy="50" rx="46" ry="7" fill="none" stroke="#0b2a30" strokeOpacity=".16" strokeWidth="2.4" />
        <ellipse cx="50" cy="48.6" rx="46" ry="7" fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth="1.2" />
      </g>
      <circle cx="50" cy="50" r="44" fill={`url(#b${uid}luz)`} />
    </svg>
  )
}
