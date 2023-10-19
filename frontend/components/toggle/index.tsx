import React from 'react'
import styles from './toggle.module.scss'

type ToggleProps = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  dataTestId?: string
}
export const Toggle: React.FC<ToggleProps> = (props) => {
  const { label, checked, onChange, dataTestId } = props

  const onToggleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    onChange(evt.target.checked)
  }

  return (
    <label className={styles.switch} data-testid={dataTestId}>
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