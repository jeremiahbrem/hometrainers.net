import React from 'react'
import { ImageText, ImageTextProps } from '../imageText'

export const ImageTextLeft: React.FC<ImageTextProps> = (props) => {
  return (
    <ImageText textPos='left' {...props} />
  )
}