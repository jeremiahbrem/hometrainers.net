import Head from 'next/head'
import ErrorBoundary from '../errorBoundary'
import { Roboto } from 'next/font/google'
import Header from '../header'
import styles from './layout.module.scss'
import { Footer } from '../footer'

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300','400','500','700','900']
})

type LayoutProps = {
  title: string
  description: string
  children?: React.ReactNode
}

export default function Layout({
  title,
  description,
  children,
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
        <Header />
        <main className={styles.main}>
          {children}
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  )
}
