import Head from 'next/head'
import ErrorBoundary from '../errorBoundary'
import { Roboto } from 'next/font/google'
import Header from '../header'
import styles from './layout.module.scss'

const inter = Roboto({
  subsets: ['latin'],
  weight: ['400','500','700','900']
})

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary fallback={<>error</>}>
      <div className={inter.className}>
        <Head>
          <title>HomePersonalTrainers.net | In-home Personal Trainer Networking Platform</title>
          <meta name="description" content="A networking platform for in-home personal trainers and clients" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Header />
          <main className={styles.main}>
            {children}
          </main>
      </div>
    </ErrorBoundary>
  )
}
