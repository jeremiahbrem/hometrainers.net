import React from 'react'
import cn from 'classnames'
import styles from './fontPicker.module.scss'
import { MY_PAGE_FONTS } from '../layout'

type FontPickerProps = {
  updateFont: (font: string) => void
  className?: string
}

export const FontPicker: React.FC<FontPickerProps> = (props) => {
  const { updateFont, className } = props

  const fonts = Object.entries(MY_PAGE_FONTS).map(([k,v], idx) => (
    <button
      key={idx}
      className={v.className}
      onClick={() => updateFont(k)}
    >
      {k[0].toUpperCase() + k.slice(1)}
    </button>
  ))

  return (
    <div className={cn(styles.fontPicker, className)}>
      {fonts}
    </div>
  )
}