import React from 'react'
import { ChromePicker } from 'react-color'
import styles from './colorPicker.module.scss'
import cn from 'classnames'

type ColorPickerProps = {
  updateColor: (color: string) => void
  color: string
  className?: string
}

export const ColorPicker: React.FC<ColorPickerProps> = (props) => {
  const { updateColor, color, className } = props

  return (
    <div className={cn(styles.colorPicker, 'color-picker')}>
      <ChromePicker color={color} onChange={c => updateColor(c.hex)} />
    </div>
  )
}