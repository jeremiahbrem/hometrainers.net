import React, { useEffect, useState } from 'react'
import styles from './profileForm.module.scss'
import { useProfile } from '../profile-provider'
import { Select } from '../select'
import { Roboto } from 'next/font/google'
import cn from 'classnames'
import { Button } from '../button'
import Image from 'next/image'
import { clientOverlayText, trainerOverlayText } from './overlayText'
import { useFetchWithAuth } from '@/utils/useFetchWithAuth'
import { useAlert } from '../alerts'

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400','500','700','900']
})

type ProfileFormValues = {
  name: string
  goals: string[]
  cities: string[]
  image: string
}

type ProfileFormProps = {
  type: 'client' | 'trainer'
}

const cities = ['Tulsa','Oklahoma City','Lawton']
const goals = ['Weight Loss','Muscle Gain','Endurance']

const trainerImage = '/jonathan-borba-R0y_bEUjiOM-unsplash.jpg'
const trainerAlt = 'image by Jonathan Borba from Upsplash'
const clientImage = '/bruce-mars-gJtDg6WfMlQ-unsplash.jpg'
const clientAlt = 'image by Bruce Mars from Upsplash'

type Error = {
  key: string
  error: string
}

export const ProfileForm: React.FC<ProfileFormProps> = (props) => {
  const { type } = props
  const { profile, resetProfile } = useProfile()
 
  const addAlert = useAlert()

  const isTrainer = type === 'trainer'

  const [errors, setErrors] = useState<Error[]>([])

  const fetchWithAuth = useFetchWithAuth()

  const initializeValues = () => ({
    name: profile?.name ?? '',
    goals: profile?.goals ?? [],
    cities: profile?.cities ?? [],
    image: profile?.image ?? ''
  })

  const [formState, setFormState] = useState<ProfileFormValues>(initializeValues())

  const sanitizeVal = (val: string) => {
    if (!val) {
      return val
    }

    return val.toLowerCase()
      .split(' ')
      .map(x => x[0].toUpperCase() + x.slice(1))
      .join(' ')
  }

  useEffect(() => {
    setFormState(initializeValues())
  }, [profile])

  const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setErrors([])
    const key = evt.target.name as keyof ProfileFormValues
    setFormState(st => ({
      ...st,
      [key]: evt.target.value
    }))
  }

  const onSubmit = async () => {
    const { name, goals, cities } = formState

    const required = [
      {
        field: 'name',
        condition: !!name,
        error: 'Name required'
      },
      {
        field: 'goals',
        condition: goals.length > 0 && goals.every(x => !!x),
        error: 'At least one goal required' 
      },
      {
        field: 'cities',
        condition: cities.length > 0 && cities.every(x => !!x),
        error: `${isTrainer ? 'At least one city' : 'City'} required`
      },
    ]

    const requiredErrors: Error[] = []

    required.forEach(({ field, condition, error }) => {
      if (!condition) {
        requiredErrors.push({ key: field, error })
      }
    })

    if (requiredErrors.length > 0) {
      setErrors(requiredErrors)
      return
    }

    const response = await fetchWithAuth({
      method: 'POST',
      path: '/update-profile',
      body: JSON.stringify({
        type,
        ...formState
      })
    })

    if (!response.ok) {
      let error = 'There was an error processing your request'

      try {
        error = (await response.json())?.error ?? error
      }
      catch{}
      
      addAlert(error)

      return
    }

    setErrors([])
    addAlert('Profile updated!')
    void resetProfile()
  }

  return (
    <div className={styles.profileFormPage}>
      <div className={styles.imageContainer}>
        <Image
          src={isTrainer ? trainerImage : clientImage}
          alt={isTrainer ? trainerAlt : clientAlt}
          height={0}
          width={0}
          className={styles.image}
        />
        <div className={styles.overlay}>
          <h1>{isTrainer ? trainerOverlayText : clientOverlayText}</h1>
        </div>
      </div>

      <form
        onSubmit={e => e.preventDefault()}
        className={cn(styles.profileForm, roboto.className)}
      >
        <h3>My {isTrainer ? 'Trainer' : 'Client'} Profile</h3>
        <label className={styles.name} htmlFor='name'>Name</label>
        <input
          name='name'
          id='name'
          onChange={onChange}
          value={formState.name}
          placeholder='Enter your name'
          style={{ borderColor:
            errors.some(x => x.key === 'name') ? 'red' : 'transparent'
          }}
        />

        <Select {...{
          addValue: val =>
            setFormState(st => ({
              ...st,
              cities: [...st.cities, sanitizeVal(val)]
          })),
          selected: formState.cities,
          onRemove: val => setFormState(st => ({
            ...st,
            cities: st.cities.filter(x => x != val)
          })),
          allowMultiple: type === 'trainer',
          placeholder: 'Search or type a city',
          options: cities,
          name: 'cities',
          label: isTrainer ? 'Cities served' : 'City',
          error: errors.some(x => x.key === 'cities'),
          allowAdd: true,
        }} />
        
        <Select {...{
          addValue: val =>
            setFormState(st => ({
              ...st,
              goals: [...st.goals, sanitizeVal(val)]
          })),
          selected: formState.goals,
          allowMultiple: true,
          onRemove: val => setFormState(st => ({
            ...st,
            goals: st.goals.filter(x => x != val)
          })),
          placeholder: 'Search or type a goal',
          options: goals,
          name: 'goals',
          label: isTrainer ? 'Training Goals Offered' : 'Desired Goals',
          error: errors.some(x => x.key === 'goals'),
          allowAdd: true,
        }} />

        <div className={styles.saveButton}>
          <Button text={'Save'} onClick={onSubmit} type='button' />
        </div>

        <p className={styles.error}>{errors[0] ? errors[0].error : ''}</p>
      </form>
    </div>
  )
}