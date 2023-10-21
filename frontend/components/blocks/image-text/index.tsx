import React from 'react'
import styles from './imageText.module.scss'
import Image from 'next/image'
import cn from 'classnames'
import { ComponentProps } from '@/components/types'
import { Container } from '@/components/container'
import { IMAGES_URL } from '@/api'
import { ImageUpload } from '@/components/image-upload'
import { TextColumn } from '../text-column'

export type ImageTextProps = ComponentProps<{
  text: string
  image: string
  imageAlt: string
  textColor: string
  background: string
  font: string
}>

export type ImageTextBaseProps = ImageTextProps & {
  textPos: 'left' | 'right'
}

export const ImageText: React.FC<ImageTextBaseProps> = (props) => {
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
    textColor = '',
    background,
    font = 'roboto'
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

  const onColorChange = (color: string) => {
    onUpdate({
      ...block,
      textColor: color
    })
  }

  const imageUrl = preview ? image : `${IMAGES_URL}/${image}`

  return (
    <section
      className={cn(styles.imageText)}
      style={{
        backgroundColor: background ?? 'white'
      }}
      data-testid='image-text-section'
    >
      <TextColumn {...{
        onColorChange,
        onFontChange: f => onUpdate({
          ...block,
          font: f
        }),
        onTextUpdate,
        color: textColor,
        font,
        textPos,
        text,
        preview
      }} />

      <Container className={cn(styles.image)} preview={preview}>
        {image && <Image src={imageUrl} alt={imageAlt ?? ''} height={0} width={0} />}
        {!preview && <ImageUpload 
          value={image}
          onChange={onImageChange}
          text='image'
          onRemove={onRemoveImage}
        />}
      </Container>
    </section>
  )
}