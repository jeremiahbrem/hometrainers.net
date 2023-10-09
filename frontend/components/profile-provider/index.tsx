'use client'

import { signIn, signOut } from 'next-auth/react'
import styles from './profileProvider.module.scss'
import { createContext, useContext, useEffect, useState } from 'react'
import Image from 'next/image'
import classnames from 'classnames'
import { useIsLoggedIn } from '@/utils/useIsLoggedIn'
import { useAlert } from '../alerts'
import { Roboto } from 'next/font/google'
import cn from 'classnames'
import { Profile } from './types'
import { useFetchProfile } from './useFetchProfile'
import { Loading } from '../loading'
import Link from 'next/link'
import { useRouter } from 'next/router'

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400','500','700','900']
})

type ProfileState = {
  allowClose: boolean
  open: boolean
  profile: Profile | null
  profileLoading: boolean
}

type ProfileContextType = {
  openAllowClose: () => void
  openDisallowClose: () => void
  resetProfile: () => Promise<void>
  profile: Profile | null
  profileLoading: boolean
}

export const ProfileContext = createContext<ProfileContextType>({
  openAllowClose: () => undefined,
  openDisallowClose: () => undefined,
  resetProfile: () => Promise.resolve(),
  profile: null,
  profileLoading: false,
})

type ProfileProviderProps = {
  children: React.ReactNode
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [profileState, setProfileState] = useState<ProfileState>({
    allowClose: true,
    open: false,
    profile: null,
    profileLoading: true
  })

  const { profile } = profileState

  const updateProfile = (profile: Profile | null) => {
    setProfileState(st => ({ ...st, profile, profileLoading: false }))
  }

  const router = useRouter()

  const isLoggedIn = useIsLoggedIn()
  const { fetchProfile, loading } = useFetchProfile(updateProfile)

  const resetProfile = async () => {
    setProfileState(st => ({...st, profileLoading: true }))
    await fetchProfile()
  }

  useEffect(() => {
    (async() => {
      if (isLoggedIn) {
        await fetchProfile()

        setProfileState(st => ({
          ...st,
          open: false,
          allowClose: isLoggedIn ? true : st.allowClose
        }))
      } else {
        setProfileState(st => ({
          ...st,
          profile: null,
          profileLoading: false,
          open: false,
          allowClose: isLoggedIn ? true : st.allowClose
        }))
      }
    })()
    
  }, [isLoggedIn])

  useEffect(() => {
    const handleRouteChange = () => {
      setProfileState(st => ({
        ...st,
        allowClose: true,
        open: false,
      }))
    }

    router.events.on('routeChangeStart', handleRouteChange)

    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
    }
  }, [])

  const { open, allowClose } = profileState

  const modalStyle = classnames(styles.profileModal, { [styles.open]: open })
  const addAlert = useAlert()

  const handleScrimClick = () => {
    if (!allowClose) {
      return
    }

    setProfileState(st => ({ ...st, open: false }))
  }

  const handleOpen = (allowClose: boolean) => {
    try {
      localStorage.setItem('test', 'test')
      localStorage.removeItem('test')
    }
    catch {
      addAlert('This site requires cookies to be enabled')
      return
    }

    setProfileState(st => ({ ...st, allowClose, open: true }))
  }

  const openAllowClose = () => handleOpen(true)
  const openDisallowClose = () => handleOpen(false)

  const api = {
    openAllowClose,
    openDisallowClose,
    resetProfile,
    profile: profileState.profile,
    profileLoading: profileState.profileLoading
  }

  const onButtonClick = (action?: () => void) => () => {
    action && action()
    setProfileState(st => ({ ...st, open: false }))
  }

  return (
    <ProfileContext.Provider value={api}>
      {children}
      <div className={cn(styles.profileProvider, roboto.className)}>
        <div
          className={modalStyle}
          data-testid='profile-modal'
          style={{
            left: open ? 0 : '-110vw'
          }}
        >
          <button
            className={styles.scrim}
            onClick={handleScrimClick}
            data-testid='signin-scrim'
          />

          <div className={styles.innerModal}>
            <div className={styles.scrim} />

            {isLoggedIn && (<>
              <button className={styles.profileButton} onClick={onButtonClick(signOut)}>
                Sign out
              </button>

              <Link
                href={`/profiles${profile ? `/${profile.type}` : ''}`}
                className={styles.profileButton}
                onClick={onButtonClick()}
              >
                {profile ? 'Profile' : 'Create Profile'}
              </Link>
              
              {profile && profile.type === 'trainer' && <Link
                href='/my-page'
                className={styles.profileButton}
                onClick={onButtonClick()}
              >
                My Page
              </Link>}

            </>)}

            {!isLoggedIn && <>
              <button
                className={styles.profileButton}
                onClick={onButtonClick(() => signIn('auth'))}
              >
                Sign in with email
              </button>
              <button
                className={styles.googleSignIn}
                onClick={onButtonClick(() => signIn('google'))}
              >
                <Image
                  src={'/google-signin.png'}
                  alt={'sign in with google'}
                  fill={true}
                  className={styles.googleIcon}
                />
              </button>
            </>}
          </div>
        </div>
      </div>
      <Loading open={loading} />
    </ProfileContext.Provider>
  )
}

export function useProfile(): ProfileContextType {
  const context = useContext(ProfileContext)
  return context
}