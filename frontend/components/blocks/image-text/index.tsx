import React, { useRef, useState } from 'react'
import styles from './imageText.module.scss'
import richTextStyles from '../richTextStyles.module.scss'
import Image from 'next/image'
import parse from 'html-react-parser'
import cn from 'classnames'
import { Editor } from '@/components/editors'
import { ComponentProps } from '@/components/types'
import { Container } from '@/components/container'
import { ClickToAdd } from '@/components/click-to-add'
import { IMAGES_URL } from '@/api'
import { ImageUpload } from '@/components/image-upload'

export type ImageTextProps = ComponentProps<{
  text: string
  image: string
  imageAlt: string
  textColor: string
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
    textColor = '',
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

  const textRight = textPos === 'right'
  const imageUrl = preview ? image : `${IMAGES_URL}/${image}`

  return (
    <section className={cn(styles.imageText)}>
      <Container
        className={cn(styles.text, richTextStyles.richText, { [styles.right]: textRight})}
        ref={textRef}
        preview={preview}
        data-testid='image-text-content'
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
        color={textColor}
        onColorChange={onColorChange}
      />}

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