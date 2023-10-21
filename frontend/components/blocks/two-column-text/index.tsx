import React from 'react'
import styles from './twoColumnText.module.scss'
import { ComponentProps } from '@/components/types'
import { TextColumn } from '../text-column'

type TextColumn = {
  text: string
  color: string
  font: string
}

export type TwoColumnTextProps = ComponentProps<{
  left: TextColumn
  right: TextColumn
  background: string
}>

type ColumnKey = 'left' | 'right'

export const TwoColumnText: React.FC<TwoColumnTextProps> = (props) => {
  const {
    block,
    onUpdate,
    preview 
  } = props

  const {
    left,
    right,
    background,
  } = block

  const onTextUpdate = async (key: ColumnKey, text: string) => {
    onUpdate({
      ...block,
      [key]: {
        ...block[key],
        text
      }
    })
  }

  const onColorChange = (key: ColumnKey, color: string) => {
    onUpdate({
      ...block,
      [key]: {
        ...block[key],
        color
      }
    })
  }

  const onFontChange = (key: ColumnKey, font: string) => {
    onUpdate({
      ...block,
      [key]: {
        ...block[key],
        font
      }
    })
  }

  return (
    <section
      className={styles.twoColumnText}
      style={{ backgroundColor: background }}
    >
      <TextColumn {...{
        onColorChange: (c: string) => onColorChange('left', c),
        onFontChange: (f: string) => onFontChange('left', f),
        onTextUpdate: (t: string) => onTextUpdate('left', t),
        color: left.color,
        font: left.font || 'roboto',
        textPos: 'left',
        text: left.text,
        preview,
        className: styles.left
      }} />

      <TextColumn {...{
        onColorChange: (c: string) => onColorChange('right', c),
        onFontChange: (f: string) => onFontChange('right', f),
        onTextUpdate: (t: string) => onTextUpdate('right', t),
        color: right.color,
        font: right.font || 'roboto',
        textPos: 'right',
        text: right.text,
        preview,
        className: styles.right
      }} />
    </section>
  )
}