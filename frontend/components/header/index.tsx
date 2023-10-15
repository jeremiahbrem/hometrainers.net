import { Logo } from '../logo'
import styles from './header.module.scss'
import classnames from 'classnames'
import { useIsLoggedIn } from '@/utils/useIsLoggedIn'
import { useProfile } from '../profile-provider'
import Link from 'next/link'

export default function Header() {
  const isLoggedIn = useIsLoggedIn()

  const { openAllowClose, profile, profileLoading } = useProfile()

  const checkStyle = classnames('material-symbols-outlined', styles.check)

  return <div className={styles.header} id='header'>
    <Logo className={styles.logoContainer} />
    <p>HomeTrainers.net</p>

    {isLoggedIn && profile?.type === 'trainer' ? <Link
      className={styles.pageLink}
      href={'/my-page'}>
      My Page
    </Link> : <span className={styles.pageLink} />}

    {isLoggedIn && profile?.email ?
      <Link
        className={styles.pageLink}
        id='my-profile-link'
        href={`/profiles/${profile.type}`}>
        My Profile
    </Link> : <span className={styles.pageLink} />}

    {isLoggedIn && !profileLoading ? <span className={checkStyle} id='login-checked'>check</span> : <span />}

    <button className={styles.signInButton} id='sign-in-button' onClick={openAllowClose}>
      <span className='material-symbols-outlined'>person</span>
    </button>
  </div>
}