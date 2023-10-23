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
import { PageSettings, SettingsError } from './pageSettings'
import { useAlert } from '../alerts'
import { useProfile } from '../profile-provider'
import styles from './myPage.module.scss'

export type MyPageComponentProps = {
  Blocks:  Record<string, React.FC<ComponentProps<any>>>
  PreviewBlocks: PreviewBlocksType
}

const layoutProps = {
  title: 'My Trainer Page',
  description: 'Page editor for my trainer page'
}

export const MyPageComponent: React.FC<MyPageComponentProps> = (props) => {
  const isLoggedIn = useIsLoggedIn()
  const { openDisallowClose, profileLoading } = useProfile()

  useEffect(() => {
    if (!isLoggedIn && !profileLoading) {
      openDisallowClose()
    }
  }, [isLoggedIn, profileLoading])

  if (profileLoading) {
    return <Layout {...layoutProps}><Loading open={true} /></Layout>
  }

  if (!isLoggedIn) {
    return <Layout {...layoutProps} />
  }

  return <MyPageLoader {...props} />
}

const MyPageLoader: React.FC<MyPageComponentProps> = (props) => {
  const [page, setPage] = useState<Page  | null>(null)

  const { profile , profileLoading } = useProfile()

  const { refreshKey } = useRefreshKey()

  const fetchResults = useFetchWithAuth()
  const addAlert = useAlert()

  const fetchPage = async () => {
    if (profile?.email && !profileLoading) {
      const response = await fetchResults({
        method: 'GET',
        path: '/my-page'
      })
    
      if (!response.ok) {
        let error = 'There was an error with processing your request'
  
        try {
          error = (await response.json())?.error ?? error
        }
        catch {}
  
        addAlert(error)
      }
  
      const page = await getPageResult(response)
      setPage(page)
    }
  }
  
  useEffect(() => {
    void fetchPage()
  }, [refreshKey, profileLoading, profile])

  if (!page) {
    return <Loading open={true} />
  }

  if (!page.email) {
    return <Layout {...layoutProps} />
  }

  return <MyPageDisplay {...{ ...props, page }} />
}

type MyPageDisplayProps = MyPageComponentProps & {
  page: Page
}

const MyPageDisplay: React.FC<MyPageDisplayProps> = (props) => {
  const {
    page,
    Blocks, 
    PreviewBlocks,
  } = props

  const copyProps = {
    ...page,
    blocks: {...page.blocks}
  }
  const [pageContext, setPageContext] = useState<Page>(copyProps)
  const [settingsError, setSettingsError] = useState<SettingsError>(null)
  const addAlert = useAlert()

  useEffect(() => {
    addAlert(`Hi! We just launched, and we're continually working on new page components and features. Check back often!`)
  }, [])

  const { reset } = useRefreshKey()
  
  const onBlockClick = (block: Record<string, any>) => {
    setPageContext(page => {
      const newBlocks = block.blockName === 'header'
        ? [block, ...page!.blocks.blocks]
        : [...page!.blocks.blocks, block]

      const copy = {
        ...page,
        blocks: {
          blocks: newBlocks
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
    setSettingsError(null)
  }

  return (
    <Layout {...layoutProps}>
      <div className={styles.myPage}>
        <PageComponent {...{ page: pageContext, Blocks, setPageContext }} />
        <BlockSelector onClick={onBlockClick} PreviewBlocks={PreviewBlocks}/>
        <PageSaver {...{
          pageProps: page!,
          pageContext,
          reset: resetContent,
          setSettingsError
        }} />
        <PageSettings {...{
          update: (settings: PageSettings) => setPageContext(ctx => {
            const copy = {
              ...ctx,
              ...settings
            } as Page

            return copy
          }),
          page: pageContext,
          settingsError
        }} />
      </div>
    </Layout>
  )
}