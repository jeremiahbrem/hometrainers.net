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
import { MY_PAGE_FONTS } from '@/components/layout'

export type FullPageImageTextBase = ComponentProps<{
  text: string
  image: string
  imageAlt: string
  color: string
  font: string
  background: string
}>

export type FullPageImageTextProps = FullPageImageTextBase & { textPos: 'left' | 'right' }

export const FullPageImageText: React.FC<FullPageImageTextProps> = (props) => {
  const {
    block,
    onUpdate,
    addImage,
    removeImage,
    preview,
    textPos,
  } = props

  const {
    text,
    image,
    imageAlt,
    color = '#3c3636',
    font = 'roboto',
    background,
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

  const onColorChange = (color: string) => {
    onUpdate({
      ...block,
      color
    })
  }

  return (
    <section
      className={cn(styles.section, { [styles.right]: textPos === 'right'})}
      style={{ background }}
    >
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

      <Container className={cn(
        styles.text,
        richStyles.richText,
        MY_PAGE_FONTS[font].className
      )} preview={preview} ref={textRef} style={{ color }}
      >
        {parse(text || '<h1></h1>')}

        <div className={styles.addContainer}>
          <ClickToAdd {...{ text: 'text', value: text }} />
        </div>
      </Container>

      {!preview && <Editor
        content={text}
        onUpdate={onTextUpdate}
        right={textPos === 'left' ? '1rem' : 'unset'}
        left={textPos === 'left' ? 'unset' : '1rem'}
        contentRef={textRef}
        color={color}
        onColorChange={onColorChange}
        onFontChange={f => onUpdate({...block, font: f })}
        font={font}
        background={background}
      />}
    </section>
  )
}