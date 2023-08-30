import { Logo } from '../logo'
import styles from './header.module.scss'

export default function Header() {
  return <div className={styles.header}>
    <Logo className={styles.logoContainer} />
    <p>HomePersonalTrainers.net</p>
  </div>
}