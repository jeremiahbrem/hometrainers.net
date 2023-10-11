import Layout from '@/components/layout'
import { ProfilePage } from '@/components/profile-page'

export default function ClientProfile() {
  return (
    <Layout  {...{
      title: 'HomeTrainers.net | Create Client Profile',
      description: 'Create a client profile'
    }}>
      <ProfilePage type='client' />
    </Layout>
  )
}
