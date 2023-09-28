'use client'

import React, { useContext, useState } from 'react'
import { useRouter } from "next/router";
import { createContext } from "react";
import { v4 } from 'uuid';

type RefreshContextType = {
  refreshKey: string
  setRefreshKey: React.Dispatch<string>
}

const RefreshContext = createContext<RefreshContextType>({
  refreshKey: '',
  setRefreshKey: () => undefined
})

type RefreshProviderProps = {
  children: React.ReactNode
}

export const RefreshProvider: React.FC<RefreshProviderProps> = ({ children}) => {
  const [refreshKey, setRefreshKey] = useState<string>(v4())

  return <RefreshContext.Provider value={{ refreshKey, setRefreshKey }}>
    {children}
  </RefreshContext.Provider>
}

export function useRefreshKey(): { refreshKey: string, reset: () => void } {
  const context = useContext(RefreshContext)
  
  return { 
    refreshKey: context.refreshKey,
    reset: () => context.setRefreshKey(v4())
  }
}

export function useRefresh(): () => void {
  const context = useContext(RefreshContext)
  const router = useRouter()

  return () => {
    router.replace(router.asPath)
    context.setRefreshKey(v4())
  }
}