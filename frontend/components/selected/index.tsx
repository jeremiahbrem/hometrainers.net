import React from 'react'
import styles from './selected.module.scss'

type SelectedProps = {
  onRemove: () => void
  text: string
}

export const Selected: React.FC<SelectedProps> = ({ onRemove, text }) => {
  return (
    <div className={styles.selected}>
      <span data-testid={`selected-${text}`}>{text}</span>
      <button
        data-testid={`remove-selected-${text}`}
        type='button'
        onClick={onRemove}
      >x</button>
    </div>
  )
}