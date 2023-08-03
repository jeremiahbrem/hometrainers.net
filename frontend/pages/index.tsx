import Layout from '@/components/layout/layout'
import styles from './page.module.scss'
import { GetStaticProps, GetServerSideProps, Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
  icons: {
    icon: '/favicon.ico',
  }
}

type PageProps = { status: string }

// export const getStaticProps: GetStaticProps<PageProps> = async () => {
//   const res = await fetch(`${process.env.api}`)
//   const result = await res.json()
//   return { props: { status: result.status } }
// }
export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  const res = await fetch(`${process.env.api}`)
  const result = await res.json()
  return { props: { status: result.status } }
}

export default function Page(props: PageProps) {
  console.log("status is:", props.status)
  return (
    <Layout>
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>
            <Image src={'hpt-logo.svg'} alt={'home personal trainer logo'} height={0} width={0} />
            HomePersonalTrainers.net
          </h1>
          <h2>
            Coming soon...
          </h2>
        </main>
      </div>
    </Layout>
  )
}