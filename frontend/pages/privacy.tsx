import Layout from '@/components/layout'
import { Privacy } from '@/components/privacy'

export default function PrivacyPage() {
  return (
    <Layout {...{
      title: 'HomeTrainers.net | Privacy Policy',
      description: 'Privacy policy'
    }}>
      <Privacy />
    </Layout>
  )
}
