'use client'

import React, { createContext, useContext, useState } from 'react'
import cn from 'classnames'
import styles from './alerts.module.scss'
import { Roboto } from 'next/font/google'

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400','500','700','900']
})

type AddAlert = (message: string, autoClose?: boolean) => void

type AlertContextType = {
  addAlert: AddAlert
}

const AlertContext = createContext<AlertContextType>({
  addAlert: () => undefined
})

type AlertProviderProps = {
  children: React.ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alert, setAlert] = useState<string | null>(null)

  const addAlert = (message: string, autoClose?: boolean) => {
    setAlert(message)

    if (autoClose) {
      setTimeout(() => { setAlert(null) }, 3000)
    }
  }

  return (
    <AlertContext.Provider value={{ addAlert }}>
      {children}
      <div className={cn(styles.alert, roboto.className, { [styles.open]: !!alert })}>
        <div
          role='button'
          className={cn(styles.scrim)}
          onClick={() => setAlert(null) }
          data-testid='alert-scrim'
        />
        <p className={styles.message}>
          {alert}
        </p>
      </div>
    </AlertContext.Provider>
  )
}

export function useAlert(): AddAlert {
  const context = useContext(AlertContext)
  return context.addAlert
}