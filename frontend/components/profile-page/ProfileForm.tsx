import React, { useEffect, useState } from 'react'
import { useProfile } from '../profile-provider'
import { useAlert } from '../alerts'
import { useFetchWithAuth } from '@/utils/useFetchWithAuth'
import { Select } from '../select'
import { Button } from '../button'
import styles from './profileForm.module.scss'
import cn from 'classnames'
import { Loading } from '../loading'
import { ImageUpload } from '../image-upload'
import Image from 'next/image'
import { API, IMAGES_URL } from '@/api'
import { goals } from './goals'
import _ from 'lodash'
import { MY_PAGE_FONTS } from '../layout'

type ProfileFormProps = {
  type: 'client' | 'trainer'
}

type ProfileFormValues = {
  name: string
  goals: string[]
  cities: string[]
  image: string
}

type FormError = {
  key: string
  error: string
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ type }) => {
  const { profile, resetProfile } = useProfile()

  const [cities, setCities] = useState<string[]>([])

  useEffect(() => {
    (async () => {
      const response = await fetch(`${API}/cities`)
      if (response.ok) {
        const result = await response.json()
        setCities(result)
      }
    })()
  }, [])
  
  const [loading, setLoading] = useState(false)
 
  const addAlert = useAlert()

  const [errors, setErrors] = useState<FormError[]>([])

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

  const formType = profile?.type ?? type

  const isTrainer = formType === 'trainer'

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

    const requiredErrors: FormError[] = []

    required.forEach(({ field, condition, error }) => {
      if (!condition) {
        requiredErrors.push({ key: field, error })
      }
    })

    if (requiredErrors.length > 0) {
      setErrors(requiredErrors)
      return
    }

    setLoading(true)

    const response = await fetchWithAuth({
      method: 'POST',
      path: '/update-profile',
      body: JSON.stringify({
        type: formType,
        ...formState
      })
    })

    setLoading(false)

    if (!response.ok) {
      let error = 'There was an error processing your request'

      try {
        error = (await response.json())?.error ?? error
      }
      finally {
        addAlert(error)

        return
      }
    }

    setErrors([])
    addAlert('Profile updated!')
    void resetProfile()
  }

  const onImageChange = (img: string) => {
    if (img) {
      setFormState(st => ({...st, image: img }))
    }
  }

  const onRemoveImage = () => {
    setFormState(st => ({...st, image: '' }))
  }

  return (
    <form
      onSubmit={e => e.preventDefault()}
      className={cn(styles.profileForm, MY_PAGE_FONTS.roboto.className)}
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
        selected: formState.cities.map(c => ({ label: c, value: c })),
        onRemove: val => setFormState(st => ({
          ...st,
          cities: st.cities.filter(x => x != val)
        })),
        allowMultiple: type === 'trainer',
        placeholder: 'Search or type a city',
        options: cities.map(c => ({ label: c, value: c })),
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
        selected: formState.goals.map(g => ({ label: g, value: g})),
        allowMultiple: true,
        onRemove: val => setFormState(st => ({
          ...st,
          goals: st.goals.filter(x => x != val)
        })),
        placeholder: 'Search a goal',
        options: goals.sort().map(g => ({ label: g, value: g })),
        name: 'goals',
        label: isTrainer ? 'Training Goals Offered' : 'Desired Goals',
        error: errors.some(x => x.key === 'goals'),
        showAll: true
      }} />

      <fieldset className={styles.imageUpload}>
        {formState.image && <Image
          src={`${IMAGES_URL}/${formState.image}`}
          alt={formState.name}
          height={0}
          width={0}
        />}
        <ImageUpload {...{
          onChange: onImageChange,
          onRemove: onRemoveImage,
          value: formState.image,
          text: 'profile image',
          path: '/profile-image',
          show: true
        }} />
      </fieldset>
      

      <div className={styles.saveButton}>
        <Button text={'Save'} onClick={onSubmit} type='button' />
      </div>

      <p className={styles.error}>{errors[0] ? errors[0].error : ''}</p>

      <Loading open={loading} />
    </form>
  )
}