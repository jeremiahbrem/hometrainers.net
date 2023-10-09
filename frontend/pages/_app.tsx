import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { RefreshProvider } from '@/components/refresh'
import { AlertProvider } from '@/components/alerts'
import { ProfileProvider } from '@/components/profile-provider'

export default function App({
  Component,
  pageProps: { session, ...pageProps }
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <RefreshProvider>
        <AlertProvider>
          <ProfileProvider>
            <Component {...pageProps} />
          </ProfileProvider>
        </AlertProvider>
      </RefreshProvider>
    </SessionProvider>
  )
}