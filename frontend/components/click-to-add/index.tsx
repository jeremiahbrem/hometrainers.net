import { useIsEditing } from '@/utils/useIsEditing'
import React from 'react'

type ClickToAddProps = {
  value: any
  text: string
}

export const ClickToAdd: React.FC<ClickToAddProps> = (props) => {
  const isEditing = useIsEditing()
  const { value, text } = props

  if (!isEditing || value) {
    return null
  }

  return (
    <div>Click to add {text} +</div>
  )
}