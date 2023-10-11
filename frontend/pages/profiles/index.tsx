import Layout from '@/components/layout'
import { ProfileNavigator } from '@/components/profile-navigator'

export default function ProfileNavigatePage() {
  return (
    <Layout {...{
      title: 'HomeTrainers.net | Create Profile',
      description: 'Create a trainer or client profile'
    }}>
      <ProfileNavigator />
    </Layout>
  )
}
