import React from 'react'
import { ComponentProps } from '@/components/types'
import { FullPageImageText } from '../full-page-image-text'

export type FullPageImageTextLeftProps = ComponentProps<{
  text: string
  image: string
  imageAlt: string
}>

export const FullPageImageTextLeft: React.FC<FullPageImageTextLeftProps> = (props) => {
  return <FullPageImageText {...{ ...props, textPos: 'left'}} />
}