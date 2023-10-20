import React from 'react'
import { FullPageImageText, FullPageImageTextBase } from '../full-page-image-text'

export const FullPageImageTextRight: React.FC<FullPageImageTextBase> = (props) => {
  return <FullPageImageText {...{ ...props, textPos: 'right'}} />
}
