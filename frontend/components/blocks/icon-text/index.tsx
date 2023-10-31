import React, { useRef } from 'react'
import { ComponentProps } from '@/components/types'
import parse from 'html-react-parser'
import { Container } from '@/components/container'
import { Editor } from '@/components/editors'
import { useIsEditing } from '@/utils/useIsEditing'
import cn from 'classnames'
import richTextStyles from '../richTextStyles.module.scss'
import { ClickToAdd } from '@/components/click-to-add'
import { IconPicker } from '@/components/icon-picker'
import { MY_PAGE_FONTS } from '@/components/layout'
import { BlockWrapper } from '../block-wrapper'

export type IconTextItem = {
  text: string
  textColor: string
  icon: string
  iconColor: string
  font: string
}

export type IconTextBaseProps = ComponentProps<{
  title: string
  items: IconTextItem[]
  background: string
  titleColor: string
  titleFont: string
  anchors?: string[]
}>

export type IconTextProps = IconTextBaseProps & { styles: {
  readonly [key: string]: string;
}}

type ItemProps = {
  preview?: boolean
  item: IconTextItem
  onTextUpdate: (text: string, color: string, font: string) => Promise<void>
  onRemove: () => void
  onIconUpdate: (icon: string, color: string) => void
  background?: string
  styles: {
    readonly [key: string]: string;
  }
  initial?: IconTextItem
}

const Item: React.FC<ItemProps> = (props) => {
  const {
    preview,
    item,
    onTextUpdate,
    onRemove,
    onIconUpdate,
    styles,
    background,
    initial
  } = props

  const isEditing = useIsEditing()

  const {
    text,
    icon,
    textColor,
    iconColor,
    font,
  } = item

  const itemTextColor = textColor || initial?.textColor || ''
  const itemIconColor = iconColor || initial?.iconColor || ''
  const itemFont = font || initial?.font || 'roboto'

  const textRef = useRef(null)

  const onTextChange = (newText: string) => onTextUpdate(newText, textColor, font)
  const onColorChange = (color: string) => onTextUpdate(text, color, font)
  const onFontChange = (newFont: string) => onTextUpdate(text, textColor, newFont)
  if (!preview) {
    console.log(itemTextColor)
    // console.log(textColor)
  }
 
  return (
    <div className={styles.item} style={{ color: itemTextColor }}>
      {isEditing && !preview && <button
        className={styles.removeItem}
        onClick={onRemove}>x
      </button>}

      <IconPicker {...{
        onIconUpdate,
        color: itemIconColor,
        preview,
        icon,
        className: styles.icon
      }} />

      <Container
        className={cn(styles.text, richTextStyles.richText, MY_PAGE_FONTS[itemFont].className)}
        ref={textRef}
        preview={preview}
        data-testid='icon-text-content'
        style={{ color: itemTextColor }}
      >
        {parse(text ?? '')}
        <ClickToAdd {...{ text: 'text', value: text }} />
      </Container>

      {!preview && <Editor
        content={text}
        onUpdate={onTextChange}
        right={'1rem'}
        contentRef={textRef}
        color={itemTextColor}
        onColorChange={onColorChange}
        font={itemFont}
        onFontChange={onFontChange}
        background={background}
      />}
    </div>
  )
}

export const IconText: React.FC<IconTextProps> = (props) => {
  const {
    block,
    onUpdate,
    preview,
    styles
  } = props

  const {
    items,
    title,
    titleColor,
    background,
    titleFont = 'roboto',
    anchors
  } = block

  const titleRef = useRef(null)

  const isEditing = useIsEditing()

  const onTitleUpdate = async (text: string) => {
    onUpdate({
      ...block,
      title: text
    })
  }

  const onItemAdd = () => {
    onUpdate({
      ...block,
      items: [...block.items, {
        text: '',
        icon: '',
        iconColor: '',
        textColor: '',
        font: ''
      }]
    })
  }

  const onTitleColorChange = (color: string) => {
    onUpdate({
      ...block,
      titleColor: color
    })
  }

  return (
    <BlockWrapper
      className={styles.section}
      style={{
        backgroundColor: background ?? 'white',
        color: titleColor
      }}
      anchors={anchors}
    >
      <div className={styles.container}>
        <Container className={cn(
          styles.title,
          richTextStyles.richText,
          MY_PAGE_FONTS[titleFont].className
        )} ref={titleRef} preview={preview} style={{ color: titleColor }}>
          {parse(title ?? '')}
          <ClickToAdd value={title} text='title' />
        </Container>

        {!preview && <Editor
          content={title}
          onUpdate={onTitleUpdate}
          right={'1rem'}
          contentRef={titleRef}
          color={titleColor}
          onColorChange={onTitleColorChange}
          font={titleFont}
          onFontChange={f => onUpdate({
            ...block,
            titleFont: f
          })}
          background={background}
        />}

        <div className={styles.items}>
          {items.map((x, i) => (
            <Item key={i} {...{
              item: x,
              preview,
              styles,
              background,
              onTextUpdate: async (text: string, color: string, font: string) => {
                onUpdate({
                  ...block,
                  items: [
                    ...items.slice(0, i),
                    { ...items[i], text, textColor: color, font },
                    ...items.slice(i + 1)
                  ]
                })
              },
              onRemove: () => onUpdate({
                ...block,
                items: items.filter((_, idx) => idx !== i)
              }),
              onIconUpdate: (iconName: string, iconColor: string) => onUpdate({
                ...block,
                items: [
                  ...items.slice(0, i),
                  { ...items[i], icon: iconName, iconColor },
                  ...items.slice(i + 1)
                ]
              }),
              initial: items[0]
            }} />
          ))}
          {isEditing && !preview && <Container
            preview={preview}
            style={{
              color: items[0] ? items[0].textColor : 'black'
            }}
          >
            <ClickToAdd value={false} text={'item'}  onClick={onItemAdd} />
          </Container>}
        </div>
      </div>
    </BlockWrapper>
  )
}
