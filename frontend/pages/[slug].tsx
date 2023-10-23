import React from 'react'
import { Blocks } from '@/components/blocks'
import { Page } from '@/components/types';
import { PageComponent } from '@/components/page';
import { API } from '@/api';
import { getPageResult } from '@/utils/getPageResult';
import Layout from '@/components/layout';

const Page = (props: { page: Page }) => <Layout {...{
  title: props.page.title,
  description: props.page.description,
  isTrainerPage: true
}}>
  <PageComponent {...{...props, Blocks, setPageContext: () => undefined }}/>
</Layout>

export const getStaticPaths = async () => {
  const response = await fetch(`${API}/active-pages`)
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
  const response = await fetch(`${API}/page/${slug}`)

  const page = await getPageResult(response)

  return {
    props: {
      page,
    },
    revalidate: 10,
  }
}

export default Page