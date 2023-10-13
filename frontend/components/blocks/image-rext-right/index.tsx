import React from 'react'
import { ImageText, ImageTextProps } from '../image-text'

export const ImageTextRight: React.FC<ImageTextProps> = (props) => {
  return (
    <ImageText textPos='right' {...props} />
  )
}