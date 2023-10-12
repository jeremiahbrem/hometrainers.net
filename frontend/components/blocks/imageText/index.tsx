import React, { useRef } from 'react'
import styles from './imageText.module.scss'
import Image from 'next/image'
import parse from 'html-react-parser'
import cn from 'classnames'
import { Editor } from '@/components/editors'
import { ComponentProps } from '@/components/types'
import { Container } from '@/components/container'
import { ClickToAdd } from '@/components/click-to-add'
import { imagesUrl } from '@/api'
import { ImageUpload } from '@/components/image-upload'

export type ImageTextProps = ComponentProps<{
  text: string
  image: string
  imageAlt: string
}>

export type ImageTextBaseProps = ImageTextProps & {
  textPos: 'left' | 'right'
}

export const ImageText: React.FC<ImageTextBaseProps> = (props) => {
  const textRef = useRef(null)
  
  const {
    block,
    onUpdate,
    addImage,
    removeImage,
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

  const textRight = textPos === 'right'
  const imageUrl = preview ? image : `${imagesUrl}/${image}`

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
      
      <Container className={cn(styles.image)} preview={preview}>
        {image && <Image src={imageUrl} alt={imageAlt ?? ''} height={0} width={0} />}
        <ImageUpload 
          value={image}
          onChange={onImageChange}
          text='image'
          onRemove={onRemoveImage}
        />
      </Container>
    </section>
  )
}