import React, { useEffect } from 'react'
import styles from './profileNavigator.module.scss'
import Link from 'next/link'
import { Roboto } from 'next/font/google'
import cn from 'classnames'
import { useIsLoggedIn } from '@/utils/useIsLoggedIn'
import { useProfile } from '../profile-provider'
import { useRouter } from 'next/navigation'
import { Loading } from '../loading'

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400','500','700','900']
})

export const ProfileNavigator: React.FC = () => {
  const isLoggedIn = useIsLoggedIn()
  const { openDisallowClose, profile, profileLoading } = useProfile()
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn) {
      openDisallowClose()
    }
  }, [isLoggedIn, profileLoading])

  useEffect(() => {
    if (profile) {
      router.push(`/profiles/${profile.type}`)
    }
  }, [profile])

  if (isLoggedIn && profileLoading) {
    return <Loading open={true} />
  }

  if (!isLoggedIn || profile) {
    return null
  }

  return (
    <div className={cn(styles.profileNavigator, roboto.className)}>
      <Link href='/profiles/trainer' className={styles.trainer}>Create Trainer Profile</Link>
      <Link href='/profiles/client' className={styles.client}>Create Client Profile</Link>
    </div>
  )
}
