import { useSession } from 'next-auth/react'
import React, { useEffect, useState } from 'react'
import { PageComponent } from '../page'
import { Page } from '../types'
import { Blocks } from '../blocks'
import Layout from '../layout'
import { API } from '@/api'

export const MyPageComponent: React.FC = () => {
  const session = useSession()
  const email = session?.data?.user?.email

  if (!email) {
    return <Layout><></></Layout>
  }

  const emptyPage: Page = {
    blocks: { blocks: [] },
    slug: '',
    email: '',
    title: '',
    city: '',
    active: false,
  }
  
  return <PageComponent {...{ page: emptyPage, Blocks }}/>
}

const MyPageLoader: React.FC = () => {
  const [page, setPage] = useState<Page  | null>(null)
  
  useEffect(() => {
    (async() => {
      const response = await fetch(`${API}/my-page`)
    })()
  }, [])
}