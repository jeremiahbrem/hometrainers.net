import React, { useEffect } from 'react'
import { useProfile } from '../profile-provider'
import { useIsLoggedIn } from '@/utils/useIsLoggedIn'

export const SignIn: React.FC = () => {
  const isLoggedIn = useIsLoggedIn()
  const { openDisallowClose, profileLoading } = useProfile()

  useEffect(() => {
    if (!isLoggedIn && !profileLoading) {
      openDisallowClose()
    }
  }, [isLoggedIn, profileLoading])
  return <></>
}
