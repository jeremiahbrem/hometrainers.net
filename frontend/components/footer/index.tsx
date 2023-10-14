import React from 'react'
import styles from './footer.module.scss'
import Link from 'next/link'

export const Footer: React.FC = () => {


  return (
    <div className={styles.footer}>
      <Link href='/contact'>contact</Link>
      <Link href='/privacy'>privacy</Link>
    </div>
  )
}