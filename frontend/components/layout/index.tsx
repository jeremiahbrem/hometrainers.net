import Head from 'next/head'
import ErrorBoundary from '../errorBoundary'
import { Roboto } from 'next/font/google'
import Header from '../header'
import styles from './layout.module.scss'
import { Footer } from '../footer'

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400','500','700','900']
})

export default function Layout({
  children,
}: {
  children?: React.ReactNode
}) {

  return (
    <ErrorBoundary fallback={<>error</>}>
      <div className={roboto.className}>
        <Head>
          <title>HomeTrainers.net | In-Home Personal Trainer Networking Platform</title>
          <meta name="description" content="A networking platform for in-home personal trainers and clients" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta charSet="utf-8" />
          <link rel="icon" href="/favicon-144x144.png" />
        </Head>
        <Header />
        <main className={styles.main}>
          {children}
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  )
}
