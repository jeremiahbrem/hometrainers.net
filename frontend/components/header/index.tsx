import { Logo } from '../logo'
import styles from './header.module.scss'
import classnames from 'classnames'
import { useIsLoggedIn } from '@/utils/useIsLoggedIn'
import { useProfile } from '../profile-provider'
import Link from 'next/link'

export default function Header() {
  const isLoggedIn = useIsLoggedIn()

  const { openAllowClose, profile } = useProfile()

  const checkStyle = classnames("material-symbols-outlined", styles.check)

  return <div className={styles.header}>
    <Logo className={styles.logoContainer} />
    <p>HomeTrainers.net</p>

    {isLoggedIn && profile ?
      <Link
        className={styles.pageLink}
        href={`/profiles/${profile.type}`}>
        My Profile
    </Link> : <span />}

    {isLoggedIn && profile ? <Link
      className={styles.pageLink}
      href={'/my-page'}>
      My Page
    </Link> : <span />}

    {isLoggedIn ? <span className={checkStyle}>check</span> : <span />}

    <button className={styles.signInButton} id="sign-in-button" onClick={openAllowClose}>
      <span className="material-symbols-outlined">person</span>
    </button>
  </div>
}