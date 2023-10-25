import { useIsEditing } from '@/utils/useIsEditing'
import React from 'react'
import styles from './clicktoAdd.module.scss'
import { Roboto } from 'next/font/google'
import cn from 'classnames'

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300','400','500','700','900']
})

type ClickToAddProps = {
  value: any
  text: string
  color?: string
  onClick?: () => void
  className?: string
}

export const ClickToAdd: React.FC<ClickToAddProps> = (props) => {
  const isEditing = useIsEditing()
  const { value, text, onClick, className, color } = props

  if (!isEditing || (value && value !== '<p></p>')) {
    return null
  }

  return (
    <div
      className={cn(styles.clickToAdd, roboto.className, className)}
      role='button'
      onClick={onClick}
      style={{ color }}
    >
      {text} +
    </div>
  )
}