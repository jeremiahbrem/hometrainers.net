import React, { useEffect, useState } from 'react'
import { Page } from '../types'
import _ from 'lodash'
import { useSession } from 'next-auth/react'
import { SessionType } from '../header/types'
import styles from './pageSaver.module.scss'
import cn from 'classnames'
import { useRefresh } from '../refresh'
import { useAlert } from '../alerts'
import { Loading } from '../loading'

type PageSaverProps = {
  pageProps: Page
  pageContext: Page
  reset: () => void
}

export const PageSaver: React.FC<PageSaverProps> = (props) => {
  const { pageProps, pageContext, reset } = props
  const [open, setOpen] = useState(false)

  const session = useSession()
  const data = session.data as SessionType | null
  const refresh = useRefresh()
  const addAlert = useAlert()
  const [loading, setLoading] = useState(false)

  const save = async () => {
    setLoading(true)

    const token = data?.provider === 'google'
      ? data?.idToken
      : data?.accessToken

    const result = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/my-page`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token ?? ''}`,
        "token-provider": data?.provider ?? ''
      },
      body: JSON.stringify(pageContext)
    })

    setLoading(false)

    if (result.ok) {
      refresh()
      addAlert('Page updated!', true)
    }
    else {
      let error = 'There was an error with your request'

      try {
        error = await result.json()
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
      <button className={styles.saveButton} onClick={save}>Save Changes</button>
      <button onClick={reset}>Reset</button>

      <Loading open={loading}/>
    </div>
  )
}