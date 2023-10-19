import React from 'react'
import styles from './closeButton.module.scss'
import cn from 'classnames'

type CloseButtonProps = {
  onClose: () => void
  className?: string
}

export const CloseButton: React.FC<CloseButtonProps> = (props) => {
  const { onClose, className } = props

  return (
    <button
      className={cn(styles.closeButton, className)}
      onClick={e => { e.stopPropagation(); onClose() }}>x
    </button>
  )
}