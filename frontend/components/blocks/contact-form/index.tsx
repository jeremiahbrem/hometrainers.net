import React, { useRef, useState } from 'react'
import { useAlert } from '../../alerts'
import styles from '../../contact-form/contactForm.module.scss'
import cn from 'classnames'
import { Loading } from '../../loading'
import Image from 'next/image'
import { API } from '@/api'
import { ComponentProps } from '@/components/types'
import { useProfile } from '@/components/profile-provider'
import { Container } from '@/components/container'
import parse from 'html-react-parser'
import { ImageUpload } from '@/components/image-upload'
import { Editor } from '@/components/editors'
import { ClickToAdd } from '@/components/click-to-add'
import { BlockButton, BlockButtonProps } from '@/components/block-button'
import { MY_PAGE_FONTS } from '@/components/layout'

type ContactFormValues = {
  name: string
  email: string
  message: string
}

type FormError = {
  key: string
  error: string
}

export type ContactFormProps = ComponentProps<{
  title: string
  image: string
  imageAlt: string
  color: string
  background: string
  button: BlockButtonProps
  titleFont: string
}>

export const ContactForm: React.FC<ContactFormProps> = (props) => {
  const [loading, setLoading] = useState(false)

  const textRef = useRef(null)

  const {
    block,
    onUpdate,
    addImage,
    removeImage,
    preview,
  } = props

  const {
    title,
    image,
    imageAlt,
    color,
    background,
    button,
    titleFont = 'roboto',
  } = block

  const { profile } = useProfile()
 
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
      body: JSON.stringify({...formState, to: profile?.email })
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

  const onImageChange = (img: string) => {
    if (img) {
      addImage(img)
    }

    onUpdate({
      ...block,
      image: img
    })
  }

  const onRemoveImage = () => {
    removeImage(image)

    onUpdate({
      ...block,
      image: ''
    })
  }

  const onTextUpdate = async (title: string) => {
    onUpdate({
      ...block,
      title
    })
  }

  const onColorChange = (color: string) => {
    onUpdate({
      ...block,
      color
    })
  }

  const onButtonChange = (text: string, color: string, outlined: boolean) => {
    onUpdate({
      ...block,
      button: { text, color, outlined }
    })
  }

  return (
    <div className={styles.contactFormPage} style={{
      backgroundColor: background ?? 'white'
    }}>
      <form
        onSubmit={e => e.preventDefault()}
        className={cn(styles.contactForm, MY_PAGE_FONTS.roboto.className)}
        style={{
          color
        }}
      >
        <Container
          preview={preview}
          ref={textRef}
          className={cn(styles.title, MY_PAGE_FONTS[titleFont].className)}
        >
          {parse(title || '<h3></h3>')}
          <ClickToAdd {...{ text: 'title', value: title }} />
        </Container>

        {!preview && <Editor
          content={title}
          onUpdate={onTextUpdate}
          right={'1rem'}
          contentRef={textRef}
          options={['color','font']}
          color={color}
          onColorChange={onColorChange}
          font={titleFont}
          onFontChange={f => onUpdate({...block, titleFont: f })}
        />}

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
          <BlockButton
            {...button}
            onClick={onSubmit}
            type='button'
            preview={preview}
            onButtonChange={onButtonChange}
            modalTop={3}
            modalLeft={-10}
          />
        </div>

        <p className={styles.error}>{errors[0] ? errors[0].error : ''}</p>

        <Loading open={loading} />
      </form>
      <Container className={styles.imageContainer} preview={preview}>
        {image && <Image
          src={image}
          alt={imageAlt ?? ''}
          height={0}
          width={0}
          className={styles.image}
        />}

        {!preview && <ImageUpload 
          value={image}
          onChange={onImageChange}
          text='image'
          onRemove={onRemoveImage}
        />}
      </Container>
    </div>
  )
}