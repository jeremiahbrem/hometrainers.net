import React from 'react'
import { ImageText, ImageTextProps } from '../image-text'

export const ImageTextLeft: React.FC<ImageTextProps> = (props) => {
  return (
    <ImageText textPos='left' {...props} />
  )
}