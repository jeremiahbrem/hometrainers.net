import React, { useEffect } from 'react'
import styles from './profilePage.module.scss'
import { useProfile } from '../profile-provider'
import Image from 'next/image'
import { Loading } from '../loading'
import { useIsLoggedIn } from '@/utils/useIsLoggedIn'
import { ProfileForm } from './ProfileForm'
import { MatchingTrainers } from './MatchingTrainers'
import { createOverlayText } from '@/utils/createOverlayText'

type ProfileFormProps = {
  type: 'client' | 'trainer'
}

const trainerImage = '/jonathan-borba-R0y_bEUjiOM-unsplash.jpg'
const trainerAlt = 'image by Jonathan Borba from Upsplash'
const clientImage = '/bruce-mars-gJtDg6WfMlQ-unsplash.jpg'
const clientAlt = 'image by Bruce Mars from Upsplash'

export const ProfilePage: React.FC<ProfileFormProps> = (props) => {
  const { type } = props
  const { profile, profileLoading, openDisallowClose } = useProfile()
  const isLoggedIn = useIsLoggedIn()
  
  useEffect(() => {
    if (!isLoggedIn) {
      openDisallowClose()
    }
  }, [isLoggedIn, profileLoading])


  if (isLoggedIn && profileLoading) {
    return <Loading open={true} />
  }

  if (!isLoggedIn) {
    return null
  }

  const formType = profile?.type ?? type

  const isTrainer = formType === 'trainer'

  return (
    <div className={styles.profileFormPage}>
      <div className={styles.top}>
        <ProfileForm {...{ type: formType }} />
        <MatchingTrainers />
      </div>

      <div className={styles.imageContainer}>
        <Image
          src={isTrainer ? trainerImage : clientImage}
          alt={isTrainer ? trainerAlt : clientAlt}
          height={0}
          width={0}
          className={styles.image}
        />
        <div className={styles.overlay}>
          <h1>{createOverlayText(`${isTrainer ? 'Trainer' : 'Client'} Profile`)}</h1>
        </div>
      </div>
    </div>
  )
}