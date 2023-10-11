import Layout from '@/components/layout'
import { ProfilePage } from '@/components/profile-page'

export default function TrainerProfile() {
  return (
    <Layout  {...{
      title: 'HomeTrainers.net | Create Trainer Profile',
      description: 'Create a trainer profile'
    }}>
      <ProfilePage type='trainer' />
    </Layout>
  )
}
