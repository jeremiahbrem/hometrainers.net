import React from 'react'
import Image from 'next/image'
import styles from './buildPage.module.scss'
import { useProfile } from '@/components/profile-provider'
import { Button } from '@/components/button'
import { Oswald } from 'next/font/google'
import Link from 'next/link'

const oswald = Oswald({
  weight: '600',
  subsets: ['latin'],
})

export const BuildPage: React.FC = () => {
  const { openAllowClose } = useProfile()

  return (
    <section className={styles.section}>
      <h2 className={oswald.className}>Helping In&#x2011;Home Personal Trainers Build Their Businesses</h2>
      <div className={styles.container}>
        <div className={styles.text}>
          <h3>
            Build your own web page to advertise your in&#x2011;home personal training business
          </h3>
          <p>Select responsive, mobile-friendly page components with editable text and images. Preview your content while editing in real-time before saving any changes.</p>
          <p>Target your specific area and personal training services with an editable page title, description, and a customizeable page url at <strong>hometrainers.net/YOUR-PATH</strong>.</p>

          <Link href='/example' className={styles.example}>
            Click here more information from an example page built entirely with the page builder.
          </Link>

          <p>HomeTrainers.net will only ever charge a small, flat monthly hosting fee. Connect and negotiate pricing with your clients directly and get <strong>100%</strong> of your charged rate fees.</p>

          <Button text='Sign up' onClick={openAllowClose} />
        </div>
        <div className={styles.images}>
          <Image
            src={'/block-selector.png'}
            alt={'Home personal trainer block selector'}
            height={0}
            width={0}
            className={styles.imageOne}
          />
          <Image
            src={'/edit-images.png'}
            alt={'Home personal trainer edit images'}
            height={0}
            width={0}
            className={styles.imageTwo}
          />
          <Image
            src={'/page-settings.png'}
            alt={'Home personal trainer page settings'}
            height={0}
            width={0}
            className={styles.imageThree}
          />
          <Image
            src={'/text-editor.png'}
            alt={'Home personal trainer text editor'}
            height={0}
            width={0}
            className={styles.imageFour}
          />
        </div>
      </div>
    </section>
  )
}