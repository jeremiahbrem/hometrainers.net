import React from 'react'
import styles from './toggle.module.scss'
import cn from 'classnames'

type ToggleProps = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  dataTestId?: string
  className?: string
}
export const Toggle: React.FC<ToggleProps> = (props) => {
  const { label, checked, onChange, dataTestId, className } = props

  const onToggleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    onChange(evt.target.checked)
  }

  return (
    <label className={cn(styles.switch, className)} data-testid={dataTestId}>
      {label}
      <input
        id='active'
        type="checkbox"
        checked={checked}
        onChange={onToggleChange}
        name='active'
        className='toggle'
      />
      <span className={styles.slider}></span>
    </label>
  )
}