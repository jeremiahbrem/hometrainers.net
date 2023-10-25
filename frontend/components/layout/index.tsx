import Head from 'next/head'
import ErrorBoundary from '../errorBoundary'
import {
  Roboto,
  Oswald,Open_Sans,
  Lato,
  Montserrat,
  Source_Sans_3,
  Slabo_13px,
  Slabo_27px,
  Raleway,
  PT_Sans,
  Merriweather,
  Nunito,
  Concert_One,
  Prompt,
  Work_Sans
} from 'next/font/google'
import Header from '../header'
import styles from './layout.module.scss'
import { Footer } from '../footer'
import { NextFont } from 'next/dist/compiled/@next/font'

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300','400','500','700','900']
})

const oswald = Oswald({
  subsets: ['latin'],
  weight: 'variable'
})

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300','400','500','600','700','800']
})

const lato = Lato({
  subsets: ['latin'],
  weight: ['100','300','400','700','900']
})

const monsterrat = Montserrat({
  subsets: ['latin'],
  weight: 'variable'
})

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: 'variable'
})

const slabo13px = Slabo_13px({
  subsets: ['latin'],
  weight: '400'
})

const slabo27px = Slabo_27px({
  subsets: ['latin'],
  weight: ['400']
})

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['100','200','300','400','500','600','700','800','900']
})

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400','700']
})

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300','400','700','900']
})

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['200','300','400','500','600','700','800','900']
})

const concertOne = Concert_One({
  subsets: ['latin'],
  weight: ['400']
})

const prompt = Prompt({
  subsets: ['latin'],
  weight: ['200','300','400','500','600','700','800','900']
})

const workSans = Work_Sans({
  subsets: ['latin'],
  weight: 'variable'
})

export const MY_PAGE_FONTS: Record<string, NextFont> = {
  roboto,
  oswald,
  openSans,
  lato,
  monsterrat,
  sourceSans,
  slabo13px,
  slabo27px,
  raleway,
  ptSans,
  merriweather,
  nunito,
  concertOne,
  prompt,
  workSans
}

type LayoutProps = {
  title: string
  description: string
  children?: React.ReactNode
  isTrainerPage?: boolean
}

export default function Layout({
  title,
  description,
  children,
  isTrainerPage
}: LayoutProps) {

  return (
    <ErrorBoundary fallback={<>error</>}>
      <div className={roboto.className}>
        <Head>
          <title>{title}</title>
          <meta name="description" content={description} />
          <meta name="og:title" content={title} />
          <meta name="og:description" content={description} />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta charSet="utf-8" />
          <link rel="icon" href="/favicon-144x144.png" />
        </Head>
        {!isTrainerPage && <Header />}
        <main className={styles.main}>
          {children}
        </main>
        {!isTrainerPage && <Footer />}
      </div>
    </ErrorBoundary>
  )
}
