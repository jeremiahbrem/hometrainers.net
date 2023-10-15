import { ContactForm } from '@/components/contact-form'
import Layout from '@/components/layout'

export default function Contact() {
  return (
    <Layout {...{
      title: 'HomeTrainers.net | Contact',
      description: 'Contact us'
    }}>
      <ContactForm />
    </Layout>
  )
}
