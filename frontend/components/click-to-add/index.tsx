import { useIsEditing } from '@/utils/useIsEditing'
import React from 'react'
import styles from './clicktoAdd.module.scss'

type ClickToAddProps = {
  value: any
  text: string
}

export const ClickToAdd: React.FC<ClickToAddProps> = (props) => {
  const isEditing = useIsEditing()
  const { value, text } = props

  if (!isEditing || (value && value !== '<p></p>')) {
    return null
  }

  return (
    <div className={styles.clickToAdd}>Click to add {text} +</div>
  )
}