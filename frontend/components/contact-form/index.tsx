import React, { useState } from 'react'
import { useAlert } from '../alerts'
import { useFetchWithAuth } from '@/utils/useFetchWithAuth'
import { Button } from '../button'
import styles from './profileForm.module.scss'
import cn from 'classnames'
import { Roboto } from 'next/font/google'
import { Loading } from '../loading'

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400','500','700','900']
})

type ContactFormValues = {
  name: string
  email: string
  message: string
}

type FormError = {
  key: string
  error: string
}

export const ProfileForm: React.FC = () => {
  const [loading, setLoading] = useState(false)
 
  const addAlert = useAlert()

  const [errors, setErrors] = useState<FormError[]>([])

  const fetchWithAuth = useFetchWithAuth()

  const initializeValues = () => ({
    name: '',
    email: '',
    message: '',
  })

  const [formState, setFormState] = useState<ContactFormValues>(initializeValues())

  const onChange = (evt: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setErrors([])
    const key = evt.target.name as keyof ContactFormValues
    setFormState(st => ({
      ...st,
      [key]: evt.target.value
    }))
  }

  const onSubmit = async () => {
    const required: { field: keyof ContactFormValues, error: string }[] = [
      {
        field: 'name',
        error: 'Name required'
      },
   
      {
        field: 'email',
        error: 'Email required'
      },
   
      {
        field: 'message',
        error: 'Message required'
      },
    ]

    const requiredErrors: FormError[] = []

    required.forEach(({ field, error }) => {
      if (!formState[field]) {
        requiredErrors.push({ key: field, error })
      }
    })

    if (requiredErrors.length > 0) {
      setErrors(requiredErrors)
      return
    }

    setLoading(true)

    const response = await (() => Promise.resolve({ ok: true, json() { return { error: null }} }))()

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
    addAlert('Message sent!')
    setFormState(initializeValues())
  }

  return (
    <form
      onSubmit={e => e.preventDefault()}
      className={cn(styles.contactForm, roboto.className)}
    >
      <h3>Contact Us</h3>

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
      
      <label className={styles.name} htmlFor='email'>Email</label>
      <input
        name='email'
        id='email'
        onChange={onChange}
        value={formState.name}
        placeholder='Enter your email'
        style={{ borderColor:
          errors.some(x => x.key === 'email') ? 'red' : 'transparent'
        }}
      />
      
      <label className={styles.name} htmlFor='message'>Message</label>
      <textarea
        name='message'
        id='message'
        onChange={x => {}}
        value={formState.name}
        placeholder='Enter your message'
        style={{ borderColor:
          errors.some(x => x.key === 'message') ? 'red' : 'transparent'
        }}
      />

      <div className={styles.saveButton}>
        <Button text={'Save'} onClick={onSubmit} type='button' />
      </div>

      <p className={styles.error}>{errors[0] ? errors[0].error : ''}</p>

      <Loading open={loading} />
    </form>
  )
}