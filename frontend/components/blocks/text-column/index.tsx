import React, { useRef } from 'react'
import styles from './textColumn.module.scss'
import { Container } from '@/components/container'
import cn from 'classnames'
import richTextStyles from '../richTextStyles.module.scss'
import { MY_PAGE_FONTS } from '@/components/layout'
import parse from 'html-react-parser'
import { ClickToAdd } from '@/components/click-to-add'
import { Editor } from '@/components/editors'

type TextColumnProps = {
  textPos: 'left' | 'right'
  text: string
  onTextUpdate: (html: string) => Promise<void>
  onColorChange: (color: string) => void
  onFontChange: (font: string) => void
  font: string
  color: string
  preview?: boolean
  className?: string
}

export const TextColumn: React.FC<TextColumnProps> = (props) => {
  const {
    textPos,
    font = 'roboto',
    color,
    preview,
    text,
    onTextUpdate,
    onColorChange,
    onFontChange,
    className
  } = props

  const ref = useRef(null)

  const textRight = textPos === 'right'

  return (
    <>
      <Container
        className={cn(
          styles.text,
          richTextStyles.richText, { [styles.right]: textRight},
          MY_PAGE_FONTS[font].className,
          className
        )}
        ref={ref}
        preview={preview}
        data-testid='text-column-content'
        style={{ color }}
      >
        {parse(text || '<p></p>')}
        <ClickToAdd {...{ text: 'text', value: text }} />
      </Container>

      {!preview && <Editor
        content={text}
        onUpdate={onTextUpdate}
        right={textRight ? 'unset' : '1rem'}
        left={textRight ? '1rem' : 'unset'}
        contentRef={ref}
        color={color}
        onColorChange={onColorChange}
        onFontChange={onFontChange}
      />}
    </>
  )
}