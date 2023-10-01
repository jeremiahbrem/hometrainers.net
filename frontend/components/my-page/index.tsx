import React, { useEffect, useState } from 'react'
import { PageComponent } from '../page'
import { ComponentProps, Page } from '../types'
import Layout from '../layout'
import { useFetchWithAuth } from '@/utils/useFetchWithAuth'
import { useIsLoggedIn } from '@/utils/useIsLoggedIn'
import { getPageResult } from '@/utils/getPageResult'
import { Loading } from '../loading'
import { useRefreshKey } from '../refresh'
import { BlockSelector } from '../block-selector'
import { PageSaver } from './pageSaver'
import { PreviewBlocksType } from '../block-selector/previewBlocks'

type MyPageComponentProps = {
  Blocks:  Record<string, React.FC<ComponentProps<any>>>
  PreviewBlocks: PreviewBlocksType
}

export const MyPageComponent: React.FC<MyPageComponentProps> = (props) => {
  const isLoggedIn = useIsLoggedIn()

  if (!isLoggedIn) {
    return <Layout><></></Layout>
  }

  return <MyPageLoader {...props} />
}

const MyPageLoader: React.FC<MyPageComponentProps> = (props) => {
  const [page, setPage] = useState<Page  | null>(null)

  const { refreshKey } = useRefreshKey()

  const fetchResults = useFetchWithAuth()

  const fetchPage = async () => {
    const response = await fetchResults({
      method: 'GET',
      path: '/my-page'
    })

    const page = await getPageResult(response)
    setPage(page)
  }
  
  useEffect(() => {
    void fetchPage()
  }, [refreshKey])

  if (!page) {
    return <Loading open={true} />
  }

  return <MyPageDisplay {...{ ...props,page }} />
}

type MyPageDisplayProps = MyPageComponentProps & {
  page: Page
}

const MyPageDisplay: React.FC<MyPageDisplayProps> = (props) => {
  const { page, Blocks, PreviewBlocks } = props

  const copyProps = {
    ...page,
    blocks: {...page.blocks}
  }

  const [pageContext, setPageContext] = useState<Page>(copyProps)

  const { reset } = useRefreshKey()
  
  const onBlockClick = (block: Record<string, any>) => {
    setPageContext(page => {
      const copy = {
        ...page,
        blocks: {
          blocks: [
            ...page!.blocks.blocks,
            block
          ]
        }
      } as Page
      return copy
    })
  }

  const resetContent = () => {
    setPageContext({
      ...page,
      blocks: {...page.blocks}
    })
    reset()
  }

  return (
    <Layout>
      <PageComponent {...{ page: pageContext, Blocks, setPageContext }} />
      <BlockSelector onClick={onBlockClick} PreviewBlocks={PreviewBlocks}/>
      <PageSaver {...{ pageProps: page!, pageContext, reset: resetContent }} />
    </Layout>
  )
}