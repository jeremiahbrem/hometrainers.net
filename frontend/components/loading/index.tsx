import React from 'react'
import styles from './loading.module.scss'
import cn from 'classnames'

export const Loading: React.FC<{ open: boolean }> = ({ open }) => {
  return (
    <div className={cn(styles.loader, { [styles.open]: open })}>
      <span />
    </div>
  )
}