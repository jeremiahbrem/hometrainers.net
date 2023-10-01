import React, { useRef } from 'react'
import styles from './imageText.module.scss'
import Image from 'next/image'
import parse from 'html-react-parser'
import cn from 'classnames'
import { Editor } from '@/components/editors'
import { ComponentProps } from '@/components/types'
import { Container } from '@/components/container'

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

  const textRight = textPos === 'right'

  return (
    <section className={styles.imageText}>
      <Container
        className={cn(styles.text, { [styles.right]: textRight})}
        ref={textRef}
        preview={preview}
      >
        {parse(text ?? '')}
        {!text && <>Click to add</>}
      </Container>

      {!preview && <Editor
        content={text}
        onUpdate={onTextUpdate}
        right={textRight ? 'unset' : '1rem'}
        left={textRight ? '1rem' : 'unset'}
        contentRef={textRef}
      />}
      
      <Container className={cn(styles.image)} preview={preview}>
        {image && <Image src={image} alt={imageAlt ?? ''} height={0} width={0} />}
        {!image && <>Click to add +</>}
      </Container>
    </section>
  )
}