import React from 'react'
import { Blocks } from '@/components/blocks'

import Layout from '@/components/layout'

type Block = { blockName: string } & Record<string, any>

type PageProps = {
  blocks: string[]
}

const Page = (props: PageProps) => {
  const { blocks } = props;
  const components = Blocks as Record<string, React.FC<any>>;

  return (
    <Layout>
      {blocks && blocks.map((block, idx) => {
        const parsedBlock = block as unknown as Block
        const Component = components[parsedBlock.blockName] as React.FC<any>;
        return <Component key={idx} {...parsedBlock} />
      })}
      {!blocks && <>Not Found</>}
    </Layout>
  )
}

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

  let blocks

  try {
    const result = await response.json()
    blocks = result?.blocks?.blocks
  }
  catch {}

  return {
    props: {
      blocks: blocks ?? null
    },
    revalidate: 10,
  }
}

export default Page