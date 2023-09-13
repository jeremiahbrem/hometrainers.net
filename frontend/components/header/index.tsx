import { signIn, signOut, useSession } from 'next-auth/react'
import { Logo } from '../logo'
import styles from './header.module.scss'
import { Session } from 'next-auth'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import classnames from 'classnames'

type SessionType = Session & { idToken: string; error?: string }

const SignIn: React.FC = () => {
  const response = useSession()
  const data = response.data as SessionType | null

  const [open, setOpen] = useState<boolean>(false)

  const modalStyle = classnames(styles.signInModal, { [styles.open]: open })

  const isLoggedIn = data && !data.error

  const signInFunc = isLoggedIn
    ? () => signOut()
    : () => setOpen(true)

  const signInText = isLoggedIn ? 'Sign out' : 'Sign in'

  return (<div className={styles.signIn}>
    <button className={styles.signInButton} onClick={signInFunc}>
      <span className="material-symbols-outlined">person</span>
      <span className={styles.signInText}>{signInText}</span>
    </button>

    <div className={modalStyle}>
      <button className={styles.scrim} onClick={() => setOpen(false)} />
      <div className={styles.innerModal}>
        <div className={styles.scrim} />
        <button className={styles.emailSignIn} onClick={() => signIn('auth')}>
          Sign in with email
        </button>
        <button className={styles.googleSignIn} onClick={() => signIn('google')}>
          <Image src={'/google-signin.png'} alt={'sign in with google'} fill={true} objectFit={'contain'} />
        </button>
      </div>
    </div>
  </div>
  )
}

export default function Header() {
  return <div className={styles.header}>
    <Logo className={styles.logoContainer} />
    <p>HomeTrainers.net</p>
    <SignIn />
  </div>
}