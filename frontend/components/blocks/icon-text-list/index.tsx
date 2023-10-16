import React from 'react'
import styles from './iconTextList.module.scss'
import { ComponentProps } from '@/components/types'

type IconText = {
  text: string
  icon: string
}

type IconTextListProps = ComponentProps<{
  title: string
  items: IconText[]
}>

export const IconTextList: React.FC<IconTextListProps> = (props) => {
  const {
    block,
    onUpdate,
    addImage,
    removeImage,
    preview,
  } = props

  const {
    items
  } = block

  return (
    <section className={styles.section}>

    </section>
  )
}