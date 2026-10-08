import { useEffect, useState } from 'react'

const CONSULTA = '(prefers-reduced-motion: reduce)'

// true quando a pessoa pediu ao sistema para reduzir animações
export function useMovimentoReduzido() {
  const [reduzido, setReduzido] = useState(() => window.matchMedia(CONSULTA).matches)
  useEffect(() => {
    const mq = window.matchMedia(CONSULTA)
    const mudar = () => setReduzido(mq.matches)
    mq.addEventListener('change', mudar)
    return () => mq.removeEventListener('change', mudar)
  }, [])
  return reduzido
}
