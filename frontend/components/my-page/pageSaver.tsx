import React, { useEffect, useState } from 'react'
import { Page } from '../types'
import _ from 'lodash'
import styles from './pageSaver.module.scss'
import cn from 'classnames'
import { useRefresh } from '../refresh'
import { useAlert } from '../alerts'
import { Loading } from '../loading'
import { useFetchWithAuth } from '@/utils/useFetchWithAuth'
import { Button } from '../button'
import { SettingsError } from './pageSettings'

type PageSaverProps = {
  pageProps: Page
  pageContext: Page
  reset: () => void
  setSettingsError: React.Dispatch<React.SetStateAction<SettingsError>>
}

export const PageSaver: React.FC<PageSaverProps> = (props) => {
  const { pageProps, pageContext, reset, setSettingsError } = props
  const [open, setOpen] = useState(false)

  const refresh = useRefresh()
  const addAlert = useAlert()
  const [loading, setLoading] = useState(false)
  const fetchResults = useFetchWithAuth()

  const save = async () => {
    if (!pageContext.description || !pageContext.slug || !pageContext.title) {
      setSettingsError({
        title: !(!!pageContext.title),
        description: !(!!pageContext.description),
        slug: !(!!pageContext.slug),
      })
      return
    }
    else {
      setSettingsError(null)
    }

    setLoading(true)
  
    const result = await fetchResults({
      path: '/my-page',
      method: 'POST',
      body: JSON.stringify(pageContext)
    })

    setLoading(false)

    if (result.ok) {
      refresh()
      addAlert('Page updated!', true)
    }
    else {
      let error = 'There was an error with processing your request'

      try {
        error = (await result.json())?.error ?? error
      }
      catch {}

      addAlert(error)
    }
  }

  useEffect(() => {
    if (!_.isEqual(pageContext, pageProps)) {
      setOpen(true)
    }
    else {
      setOpen(false)
    }
  }, [pageContext, pageProps])

  return (
    <div
      className={cn(styles.pageSaver)}
      data-testid='page-saver'
      style={{ bottom: open ? 0 : '-5.5rem'}}
    >
      <Button className={styles.saveButton} text={'Save Changes'} onClick={save} />
      <Button text={'Reset'} onClick={reset} />

      <Loading open={loading}/>
    </div>
  )
}