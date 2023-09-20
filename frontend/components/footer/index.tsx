import React from 'react'
import styles from './footer.module.scss'
import Link from 'next/link'

export const Footer: React.FC = () => {


  return (
    <section className={styles.footer}>
      <div />
      <Link href='/privacy'>privacy</Link>
    </section>
  )
}