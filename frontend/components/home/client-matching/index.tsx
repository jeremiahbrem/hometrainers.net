import React from 'react'
import Image from 'next/image'
import styles from './clientMatching.module.scss'
import { useProfile } from '@/components/profile-provider'
import { Button } from '@/components/button'
import { Oswald } from 'next/font/google'

const oswald = Oswald({
  weight: '600',
  subsets: ['latin'],
})

export const ClientMatching: React.FC = () => {
  const { openAllowClose } = useProfile()

  return (
    <section className={styles.section}>
      <h2 className={oswald.className}>Helping Clients Reach Their Goals With Matching In&#x2011;Home Personal Trainers</h2>
      <div className={styles.container}>
        <div className={styles.images}>
          <Image
            src={'/customer-profile.png'}
            alt={'Home personal trainer block selector'}
            height={0}
            width={0}
            className={styles.image}
          />
        </div>
        <div className={styles.text}>
          <h3>
            Create a profile, get matched, and reach your fitness goals
          </h3>
          <p>Select a city and desired goals that will match up with nearby in&#x2011;home personal trainers who offer services to fit your needs.</p>
          <p>View your matched trainers&apos; web pages.</p>
          <p>Your profile remains private, and you choose who you want to contact.</p>

          <Button text='Sign up' onClick={openAllowClose} />
        </div>
      </div>
    </section>
  )
}