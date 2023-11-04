import Layout from '@/components/layout'
import { ProfilePage } from '@/components/profile-page'
import Script from 'next/script'

export default function TrainerProfile() {
  return (
    <Layout  {...{
      title: 'HomeTrainers.net | Create Trainer Profile',
      description: 'Create a trainer profile',
      scripts: <Script id='conversion-tracking'>
        {`
          gtag('event', 'conversion', {'send_to': 'AW-11216865483/0-TqCIrfzPMYEMuRz-Qp'});
        `}
      </Script>
    }}>
      <ProfilePage type='trainer' />
    </Layout>
  )
}
