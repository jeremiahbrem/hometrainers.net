import React from 'react'
import styles from './twoColumnText.module.scss'
import { ComponentProps } from '@/components/types'
import { TextColumn } from '../text-column'
import { BlockWrapper } from '../block-wrapper'

type TextColumn = {
  text: string
  color: string
  font: string
}

export type TwoColumnTextProps = ComponentProps<{
  left: TextColumn
  right: TextColumn
  background: string
  anchors?: string[]
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
    anchors
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
    <BlockWrapper
      className={styles.twoColumnText}
      style={{ backgroundColor: background }}
      anchors={anchors}
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
        className: styles.left,
        background
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
        className: styles.right,
        background
      }} />
    </BlockWrapper>
  )
}