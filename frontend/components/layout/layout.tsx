import { Inter } from 'next/font/google'
import Head from 'next/head'
import ErrorBoundary from '../errorBoundary'

const inter = Inter({ subsets: ['latin'] })

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary fallback={<>error</>}>
      <div className={inter.className}>
        <Head>
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        </Head>
        {children}
      </div>
    </ErrorBoundary>
  )
}
