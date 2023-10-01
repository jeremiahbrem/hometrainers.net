import React from 'react'
import { ImageText, ImageTextProps } from '../imageText'

export const ImageTextRight: React.FC<ImageTextProps> = (props) => {
  return (
    <ImageText textPos='right' {...props} />
  )
}