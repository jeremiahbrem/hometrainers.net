import Head from 'next/head'
import ErrorBoundary from '../errorBoundary'
import { Inter } from 'next/font/google'

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
          <title>HomePersonalTrainers.net | In-home Personal Trainer Networking Platform</title>
          <meta name="description" content="A networking platform for in-home personal trainers and clients" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        {children}
      </div>
    </ErrorBoundary>
  )
}
