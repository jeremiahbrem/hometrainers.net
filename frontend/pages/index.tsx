import { HomeComponent } from '@/components/home'
import Layout from '@/components/layout'

export default function Home() {
  return (
    <Layout {...{
      title: 'Build a Free Website | In-Home Personal Trainer Networking Platform',
      description: 'A networking platform for connecting in-home personal trainers and clients, enabling trainers to grow their network and clients to reach their fitness goals at home'
    }}>
      <HomeComponent />
    </Layout>
  )
}
