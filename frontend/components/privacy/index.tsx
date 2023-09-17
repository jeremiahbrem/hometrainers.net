import React from 'react'
import parse from 'html-react-parser'
import { policy } from './policy'
import styles from './privacy.module.css'

export const Privacy: React.FC = () => {


  return (
    <section className={styles.privacyPolicy}>
      {parse(policy)}
    </section>
  )
}