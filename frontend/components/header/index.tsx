import { signIn, signOut, useSession } from 'next-auth/react'
import { Logo } from '../logo'
import styles from './header.module.scss'
import { useState } from 'react'
import Image from 'next/image'
import classnames from 'classnames'
import { SessionType } from './types'

const SignIn: React.FC<{ isLoggedIn: boolean }> = ({ isLoggedIn }) => {
  const [open, setOpen] = useState<boolean>(false)

  const modalStyle = classnames(styles.signInModal, { [styles.open]: open })

  return (
    <div className={styles.signIn}>
      <button className={styles.signInButton} id="sign-in-button" onClick={() => setOpen(true)}>
        <span className="material-symbols-outlined">person</span>
      </button>

      <div className={modalStyle}>
        <button className={styles.scrim} onClick={() => setOpen(false)} />
        <div className={styles.innerModal}>
          <div className={styles.scrim} />

          {isLoggedIn && (
            <button className={styles.emailButton} onClick={() => signOut()}>
              Sign out
            </button>
          )}

          {!isLoggedIn && <>
            <button className={styles.emailButton} onClick={() => signIn('auth')}>
              Sign in with email
            </button>
            <button className={styles.googleSignIn} onClick={() => signIn('google')}>
              <Image
                src={'/google-signin.png'}
                alt={'sign in with google'}
                fill={true}
                className={styles.googleIcon} />
            </button>
          </>}
          
        </div>
      </div>
    </div>
  )
}

export default function Header() {
  const response = useSession()
  const data = response.data as SessionType | null

  const isLoggedIn = !!(data && !data.error)

  const checkStyle = classnames("material-symbols-outlined", styles.check)

  return <div className={styles.header}>
    <Logo className={styles.logoContainer} />
    <p>HomeTrainers.net</p>
    {isLoggedIn ? <span className={checkStyle}>check</span> : <span />}
    <SignIn {...{ isLoggedIn }} />
  </div>
}