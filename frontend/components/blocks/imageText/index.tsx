import React, { useRef, useState } from 'react'
import styles from './imageText.module.scss'
import Image from 'next/image'
import parse from 'html-react-parser'
import cn from 'classnames'
import { Editor } from '@/components/editors'
import { ComponentProps } from '@/components/types'
import { Container } from '@/components/container'
import { ClickToAdd } from '@/components/click-to-add'
import { imagesUrl } from '@/api'
import uploadStyles from './imageUpload.module.scss'
import { useIsEditing } from '@/utils/useIsEditing'
import { v4 } from 'uuid';
import { useFetchWithAuth } from '@/utils/useFetchWithAuth'
import { useAlert } from '@/components/alerts'
import { Button } from '@/components/button'

export type ImageTextProps = ComponentProps<{
  text: string
  image: string
  imageAlt: string
}>

export type ImageTextBaseProps = ImageTextProps & {
  textPos: 'left' | 'right'
}

type ImageUploadProps = {
  value: string
  text: string
  onChange: (file: any) => void
}

const ImageUpload: React.FC<ImageUploadProps> = (props) => {
  const isEditing = useIsEditing()
  const { value, text, onChange } = props
  const [removeOpen, setRemoveOpen] = useState(false)

  const fetchWithAuth = useFetchWithAuth()

  const addAlert = useAlert()

  if (!isEditing) {
    return null
  }

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      const imagePath = v4()

      const formData = new FormData();
 
      formData.append(
          "file",
          file,
          file.name,
      )

      formData.append('image-path', imagePath)

      const response = await fetchWithAuth({
        method: 'POST',
        body: formData,
        path: '/image'
      })

      if (!response.ok) {
        let error = 'There was a problem uploading the file'

        try {
          error = (await response.json())?.error
        }
        finally {
          addAlert(error)
          return
        }
      }

      onChange(imagePath)
    }
  }

  if (!value) {
    return (
      <div className={uploadStyles.imageUpload}>
        <label role="button">
          Click to add {text} +
          <input type="file" onChange={onFileChange}/>
        </label>
      </div>
    )
  }

  return (<>
    <div className={uploadStyles.openRemove} onClick={() => setRemoveOpen(true)} role='button'/>
    <div className={uploadStyles.imageRemoveModal} style={{
      display: removeOpen ? 'block' : 'none'
    }}>
      <Button text='Remove' onClick={() => onChange('')} />
      <Button text='Cancle' onClick={() => setRemoveOpen(false)} />
    </div>
  </>
  )
}

export const ImageText: React.FC<ImageTextBaseProps> = (props) => {
  const textRef = useRef(null)

  const {
    block,
    onUpdate,
    textPos,
    preview 
  } = props

  const {
    text,
    image,
    imageAlt,
  } = block

  const onTextUpdate = async (text: string) => {
    onUpdate({
      ...block,
      text
    })
  }

  const onImageChange = (image: string) => {
    onUpdate({
      ...block,
      image
    })
  }

  const textRight = textPos === 'right'

  return (
    <section className={styles.imageText}>
      <Container
        className={cn(styles.text, { [styles.right]: textRight})}
        ref={textRef}
        preview={preview}
      >
        {parse(text ?? '')}
        <ClickToAdd {...{ text: 'text', value: text }} />
      </Container>

      {!preview && <Editor
        content={text}
        onUpdate={onTextUpdate}
        right={textRight ? 'unset' : '1rem'}
        left={textRight ? '1rem' : 'unset'}
        contentRef={textRef}
      />}
      
      <Container className={cn(styles.image)} preview={preview} role="button">
        {image && <Image src={`${imagesUrl}/${image}`} alt={imageAlt ?? ''} height={0} width={0} />}
        <ImageUpload value={image} onChange={onImageChange} text='image' />
      </Container>
    </section>
  )
}