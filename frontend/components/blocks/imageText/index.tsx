import React, { useRef } from 'react'
import styles from './imageText.module.scss'
import Image from 'next/image'
import parse from 'html-react-parser'
import cn from 'classnames'
import { Editor } from '@/components/editors'
import { ComponentProps } from '@/components/types'

export type ImageTextProps = ComponentProps<{
  text: string
  image: string
}>

export type ImageTextBaseProps = ImageTextProps & {
  textPos: 'left' | 'right'
}

export const ImageText: React.FC<ImageTextBaseProps> = ({ block, onUpdate, textPos }) => {
  const textRef = useRef(null)

  const {
    image,
    text,
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
      <div className={cn(styles.text)} ref={textRef}>
        {parse(text)}
      </div>
      <Editor
        content={text}
        onUpdate={onTextUpdate}
        right={textRight ? 'unset' : '1rem'}
        left={textRight ? '1rem' : 'unset'}
        contentRef={textRef}
      />
      <div className={cn(styles.image, { [styles.right]: textRight})}>
        <Image src={image} alt='' height={0} width={0} />
      </div>
    </section>
  )
}