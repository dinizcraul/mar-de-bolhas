import BathBomb from './BathBomb'
import { marca } from '../data'

export default function Logo() {
  return (
    <a className="logo" href="#topo" aria-label={`${marca.nome}, voltar ao início`}>
      <BathBomb cor="#FF8FB8" className="logo-bomba" />
      <span>{marca.nome}</span>
    </a>
  )
}
