import React from 'react'
import { Blocks } from '@/components/blocks'
import { Page } from '@/components/types';
import { PageComponent } from '@/components/page';

const Page = (props: { page: Page }) => <PageComponent {...{...props, Blocks }}/>

export const getStaticPaths = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/active-pages`)
  const result = await response.json()

  const paths = result
    ? result.pages?.map((x: string) => ({
        params: { slug: x },
      })) ?? []
    : []
  
  return {
    paths,
    fallback: 'blocking'
  }
}

type StaticProps = {
  params: { slug: string }
}

export const getStaticProps = async ({ params: { slug } }: StaticProps) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/page/${slug}`)

  const emptyPage: Page = {
    blocks: { blocks: [] },
    slug: '',
    email: '',
    title: '',
    city: '',
    active: false,
  }

  let page = emptyPage

  try {
    const result = await response.json()
    page = result?.slug && result?.email
      ? result
      : emptyPage
  }
  catch {}

  return {
    props: {
      page,
    },
    revalidate: 10,
  }
}

export default Page