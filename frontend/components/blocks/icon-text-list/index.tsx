import React, { useRef } from 'react'
import styles from './iconTextList.module.scss'
import { ComponentProps } from '@/components/types'
import parse from 'html-react-parser'
import { Container } from '@/components/container'
import { Editor } from '@/components/editors'
import { useIsEditing } from '@/utils/useIsEditing'
import cn from 'classnames'
import richTextStyles from '../richTextStyles.module.scss'
import { ClickToAdd } from '@/components/click-to-add'
import { IconPicker } from '@/components/icon-picker'

type IconText = {
  text: string
  icon: string
}

type IconTextListProps = ComponentProps<{
  title: string
  items: IconText[]
}>

type ItemProps = {
  preview?: boolean
  index: number
  item: IconText
  onTextUpdate: (text: string) => Promise<void>
  onRemove: () => void
  onIconUpdate: (icon: string) => void
}

const Item: React.FC<ItemProps> = (props) => {
  const {
    preview,
    index,
    item,
    onTextUpdate,
    onRemove,
    onIconUpdate,
  } = props

  const isEditing = useIsEditing()

  const { text, icon } = item

  const textRef = useRef(null)

  return (
    <div className={styles.item}>
      {isEditing && !preview && <button
        className={styles.removeItem}
        onClick={onRemove}>x
      </button>}

      <IconPicker {...{
        onIconUpdate,
        preview,
        icon,
        className: styles.icon
      }} />

      <Container
        className={cn(styles.text, richTextStyles.richText)}
        ref={textRef}
        preview={preview}
        data-testid='image-text-content'
      >
        {parse(text ?? '')}
        <ClickToAdd {...{ text: 'text', value: text }} />
      </Container>

      {!preview && <Editor
        content={text}
        onUpdate={onTextUpdate}
        right={'1rem'}
        contentRef={textRef}
      />}
    </div>
  )
}

export const IconTextList: React.FC<IconTextListProps> = (props) => {
  const {
    block,
    onUpdate,
    preview,
  } = props

  const { items, title } = block

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
      items: [...block.items, { text: '', icon: '' }]
    })
  }

  return (
    <section className={styles.section}>
      <Container className={cn(styles.title, richTextStyles.richText)} ref={titleRef} preview={preview}>
        {parse(title ?? '')}
        <ClickToAdd value={title} text='title' />
      </Container>

      {!preview && <Editor
        content={title}
        onUpdate={onTitleUpdate}
        right={'1rem'}
        contentRef={titleRef}
      />}

      <div className={styles.items}>
        {items.map((x, i) => (
          <Item key={i} {...{
            item: x,
            preview,
            index: i,
            onTextUpdate: async (text: string) => {
              onUpdate({
                ...block,
                items: [
                  ...items.slice(0, i),
                  { ...items[i], text },
                  ...items.slice(i + 1)
                ]
              })
            },
            onRemove: () => onUpdate({
              ...block,
              items: items.filter((_, idx) => idx !== i)
            }),
            onIconUpdate: (iconName: string) => onUpdate({
              ...block,
              items: [
                ...items.slice(0, i),
                { ...items[i], icon: iconName },
                ...items.slice(i + 1)
              ]
            })
          }} />
        ))}
        {isEditing && !preview && <Container preview={preview}>
          <ClickToAdd value={false} text={'item'}  onClick={onItemAdd} />
        </Container>}
      </div>
    </section>
  )
}