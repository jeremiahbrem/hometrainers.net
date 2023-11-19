import Layout from '@/components/layout'
import { SignIn } from '@/components/signin';

export default function Signin() {
  return (
    <Layout {...{
      title: 'HomeTrainers.net | Sign-in',
      description: 'Sign in'
    }}>
      <SignIn />
    </Layout>
  )
}