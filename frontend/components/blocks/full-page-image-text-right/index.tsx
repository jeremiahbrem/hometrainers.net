import React from 'react'
import { ComponentProps } from '@/components/types'
import { FullPageImageText } from '../full-page-image-text'

export type FullPageImageTextRightProps = ComponentProps<{
  text: string
  image: string
  imageAlt: string
  color: string
}>

export const FullPageImageTextRight: React.FC<FullPageImageTextRightProps> = (props) => {
  return <FullPageImageText {...{ ...props, textPos: 'right'}} />
}
