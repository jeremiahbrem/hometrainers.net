import React, { useEffect, useState } from 'react'
import styles from './matchingTrainers.module.scss'
import { useProfile } from '../profile-provider'
import { useFetchWithAuth } from '@/utils/useFetchWithAuth'
import { MatchingTrainer } from './types'
import { useAlert } from '../alerts'
import Image from 'next/image'
import Link from 'next/link'
import cn from 'classnames'
import { IMAGES_URL } from '@/api'

const defaultError = 'There was an error fetching trainer matches'

export const MatchingTrainers: React.FC = () => {
  const { profile, profileLoading } = useProfile()

  const [matches, setMatches] = useState<MatchingTrainer[]>([])
  
  const fetchWithAuth = useFetchWithAuth()

  const addAlert = useAlert()

  const getMatching = async () => {
    const response = await fetchWithAuth({
      method: 'GET',
      path: '/matching-profiles'
    })

    try {
      const results = await response.json()
      
      if (!response.ok) {
        addAlert(results?.error ?? defaultError)
        return
      }

      setMatches(results as MatchingTrainer[])
    }
    catch{
      addAlert(defaultError)
    }
  }

  useEffect(() => {
    if (!profileLoading && profile?.type === 'client') {
      void getMatching()
    }
  }, [profile, profileLoading])

  if (profile?.type === 'trainer' && matches.length === 0) {
    return null
  }

  return (
    <div className={styles.matchingTrainers}>
      <h3>Matching Trainers</h3>

      <div className={styles.matches}>
        {matches.map((m, i) => (
          <Link href={`/${m.slug}`} key={i} className={styles.match}>
            {m.image
              ? <Image
                src={`${IMAGES_URL}/m.image`}
                alt={m.name}
                height={0}
                width={0}
                className={styles.image}
              />
              : <span className={cn("material-symbols-outlined", styles.defaultImage)}>account_circle</span>
            }
            <span>{m.name}</span>
          </Link>
        ))}
        {matches.length === 0 && <p className={styles.noneFound}>No matching trainers found. We just launched, and we&#39;re continually growing our network. Check back often!</p>}
      </div>
    </div>
  )
}