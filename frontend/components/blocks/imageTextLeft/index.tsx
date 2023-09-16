import React from 'react'
import styles from './imageTextLeft.module.scss'
import Image from 'next/image'
import parse from 'html-react-parser'

export type ImageTextLeftProps = {
  image: string
  heading: string
  text: string
  imagePos: string
}

export const ImageTextLeft: React.FC<ImageTextLeftProps> = (props ) => {
  const {
    image,
    heading,
    text
  } = props;

  return (
    <section className={styles.imageTextLeft}>
      <div>
        <h3 className={styles.heading}>{heading}</h3>
        {parse(text)}
      </div>
      <div>
        <Image src={image} alt={'home personal trainer logo'} height={0} width={0} />
      </div>
    </section>
  )
}