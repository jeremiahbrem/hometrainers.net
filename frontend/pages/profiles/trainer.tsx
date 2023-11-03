import Layout from '@/components/layout'
import { ProfilePage } from '@/components/profile-page'
import Script from 'next/script'

export default function TrainerProfile() {
  return (
    <Layout  {...{
      title: 'HomeTrainers.net | Create Trainer Profile',
      description: 'Create a trainer profile'
    }}>
      <Script src="https://www.googletagmanager.com/gtag/js?id=AW-11216865483" />
      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
 
          gtag('config', 'AW-11216865483');
        `}
      </Script>
      <ProfilePage type='trainer' />
    </Layout>
  )
}
