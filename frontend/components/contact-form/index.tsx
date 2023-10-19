import React, { useState } from 'react'
import { useAlert } from '../alerts'
import { Button } from '../button'
import styles from './contactForm.module.scss'
import cn from 'classnames'
import { Roboto } from 'next/font/google'
import { Loading } from '../loading'
import Image from 'next/image'
import { createOverlayText } from '@/utils/createOverlayText'
import { API } from '@/api'

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

export const ContactForm: React.FC = () => {
  const [loading, setLoading] = useState(false)
 
  const addAlert = useAlert()

  const [errors, setErrors] = useState<FormError[]>([])

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

    const response = await fetch(`${API}/contact`, {
      method: 'POST',
      body: JSON.stringify({...formState, to: "support@hometrainers.net" })
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
    addAlert('Message sent!')
    setFormState(initializeValues())
  }

  return (
    <div className={styles.contactFormPage}>
      <form
        onSubmit={e => e.preventDefault()}
        className={cn(styles.contactForm, roboto.className)}
      >
        <h3 className={styles.title}>Contact Us</h3>

        <label className={styles.name} htmlFor='name'>Name</label>
        <input
          className={styles.input}
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
          className={styles.input}
          name='email'
          id='email'
          onChange={onChange}
          value={formState.email}
          placeholder='Enter your email'
          style={{ borderColor:
            errors.some(x => x.key === 'email') ? 'red' : 'transparent'
          }}
        />
        
        <label className={styles.name} htmlFor='message'>Message</label>
        <textarea
          name='message'
          id='message'
          onChange={onChange}
          value={formState.message}
          placeholder='Enter your message'
          style={{ borderColor:
            errors.some(x => x.key === 'message') ? 'red' : 'transparent'
          }}
        />

        <div className={styles.saveButton}>
          <Button text={'Send'} onClick={onSubmit} type='button' />
        </div>

        <p className={styles.error}>{errors[0] ? errors[0].error : ''}</p>

        <Loading open={loading} />
      </form>
      <div className={styles.imageContainer}>
        <Image
          src={'/luna-active-fitness-iEpsg6OzyXw-unsplash.jpg'}
          alt={'Image by Luna Active Fitness from Upsplash'}
          height={0}
          width={0}
          className={styles.image}
        />
        <div className={styles.overlay}>
          <h1>{createOverlayText('ContactUs')}</h1>
        </div>
      </div>
    </div>
  )
}