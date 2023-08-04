import styles from '@/styles/page.module.scss'
import Layout from '@/components/layout/layout'
import Image from 'next/image'

type PageProps = { status: string }

// export const getStaticProps = async () => {
//   console.log(process.env.api)
//   const res = await fetch(`${process.env.api}`)
//   const result = await res.json()
//   return { props: { status: result.status } }
// }

export default function Home() {
  // console.log("status", props.status)
  return (
    <>
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
    </>
  )
}
