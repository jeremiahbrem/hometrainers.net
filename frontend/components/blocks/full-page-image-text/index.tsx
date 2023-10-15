import React, { useRef } from 'react'
import Image from 'next/image'
import styles from './fullPageImageText.module.scss'
import { ComponentProps } from '@/components/types'
import { Container } from '@/components/container'
import { IMAGES_URL } from '@/api'
import { ImageUpload } from '@/components/image-upload'
import parse from 'html-react-parser'
import { ClickToAdd } from '@/components/click-to-add'
import { Editor } from '@/components/editors'
import cn from 'classnames'
import richStyles from '../richTextStyles.module.scss'

export type FullPageImageTextProps = ComponentProps<{
  text: string
  image: string
  imageAlt: string
}> & { textPos: 'left' | 'right' }

export const FullPageImageText: React.FC<FullPageImageTextProps> = (props) => {
  const {
    block,
    onUpdate,
    addImage,
    removeImage,
    preview,
    textPos
  } = props

  const {
    text,
    image,
    imageAlt,
  } = block

  const textRef = useRef(null)

  const imageUrl = preview ? image : `${IMAGES_URL}/${image}`

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

  const onTextUpdate = async (text: string) => {
    onUpdate({
      ...block,
      text
    })
  }

  return (
    <section className={cn(styles.section, { [styles.right]: textPos === 'right'})}>
      <Container className={styles.image} preview={preview}>
        {image && <Image src={imageUrl} alt={imageAlt ?? ''} height={0} width={0} />}
        {image && <div className={styles.overlay} />}
        {!preview && <ImageUpload 
          value={image}
          onChange={onImageChange}
          text='image'
          onRemove={onRemoveImage}
        />}
      </Container>

      <Container className={cn(styles.text, richStyles.richText)} preview={preview} ref={textRef}>
        {parse(text ?? '')}

        <div className={styles.addContainer}>
          <ClickToAdd {...{ text: 'text', value: text }} />
        </div>
      </Container>

      {!preview && <Editor
        content={text}
        onUpdate={onTextUpdate}
        right={'1rem'}
        contentRef={textRef}
      />}
    </section>
  )
}