import React, { useRef, useState } from 'react'
import styles from './imageTextLeft.module.scss'
import Image from 'next/image'
import parse from 'html-react-parser'
import cn from 'classnames'
import { Editor } from '@/components/editors'

export type ImageTextLeftProps = {
  image: string
  text: string
}

export const ImageTextLeft: React.FC<ImageTextLeftProps> = (props) => {
  const [args, setArgs] = useState<ImageTextLeftProps>(props)

  const textRef = useRef(null)

  const {
    image,
    text
  } = args;

  const onTextSave = async (text: string) => {
    setArgs({
      ...args,
      text
    })
  }

  return (
    <section className={styles.imageTextLeft}>
      <div className={cn(styles.text)} ref={textRef}>
        {parse(text)}
      </div>
      <Editor
        content={text}
        onSave={onTextSave}
        right='1rem'
        contentRef={textRef}
      />
      <div className={styles.image}>
        <Image src={image} alt='' height={0} width={0} />
      </div>
    </section>
  )
}