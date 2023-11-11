import React from 'react'
import styles from './footer.module.scss'
import Link from 'next/link'
import Image from 'next/image'

export const Footer: React.FC = () => {


  return (
    <div className={styles.footer}>
      <Link href='/contact'>contact</Link>
      <Link href='/privacy'>privacy</Link>
      <p>&copy;{new Date().getFullYear()}&nbsp;HomeTrainers.net</p>

      <div className={styles.socialContainer}>
        <Link href='https://www.linkedin.com/company/hometrainers-net' target='__blank'>
          <Image
            src={'/LI-In-Bug.png'}
            alt={'hometrainers.net linkedin'}
            height={0}
            width={0}
            className={styles.social}
          />
        </Link>
        <Link href='https://www.facebook.com/hometrainers.net' target='__blank'>
          <Image
            src={'/icons8-facebook-48.png'}
            alt={'hometrainers.net facebook'}
            height={0}
            width={0}
            className={styles.social}
          />
        </Link>
      </div>
    </div>
  )
}