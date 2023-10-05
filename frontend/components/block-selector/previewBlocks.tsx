import React from 'react'
import styles from './previewBlocks.module.scss'
import cn from 'classnames'
import { Block } from '../types'
import { ImageTextLeft } from '../blocks/imageTextLeft'
import { ImageTextRight } from '../blocks/imageTextRight'

type PreviewBlockProps = {
  onBlockClick: (block: Record<string, any>) => void
  newBlock: Block
  children: React.ReactNode
  testId?: string
  className?: string
}

export const PreviewBlock: React.FC<PreviewBlockProps> = (props) => {
  const {
    onBlockClick,
    newBlock,
    children,
    testId,
    className
  } = props

  return (
    <div
      className={cn(styles.blockContainer, className)}
    >
      <button
        className={styles.blockButton}
        onClick={() => onBlockClick(newBlock)}
        data-testid={testId}
      >
      {children}
      </button>
    </div>
  )
}

export type PreviewBlocksType = {
  newBlock: Block
  Component: React.FC<any>
  componentProps: Block
  testId?: string
  className?: string
}[]

const defaultProps = {
  onUpdate: () => undefined,
  preview: true,
}

const imageTextProps = {
  image: '/annie-spratt-oQfSHQ2Uaic-unsplash.jpg',
  text: `<h3>John Doe's Personal Fitness Training</h3><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p><p>Sed ut <span style=\"color: rgb(0, 0, 0)\">perspiciatis</span> unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>`,
  imageAlt: 'Image by Annie Spratt from Unsplash',
}

export const PreviewBlocks: PreviewBlocksType = [
 {
    newBlock: {
      blockName: 'image-text-left',
      text: '',
      image: '',
      imageAlt: ''
    },
    className: styles.imageText,
    testId: 'image-text-left-preview',
    componentProps: {
      ...defaultProps,
      block: imageTextProps,
      blockName: 'image-text-left'
    },
    Component: ImageTextLeft
  },
  {
    newBlock: {
      blockName: 'image-text-right',
      text: '',
      image: '',
      imageAlt: ''
    },
    className: styles.imageText,
    testId: 'image-text-right-preview',
    componentProps: {
      ...defaultProps,
      block: imageTextProps,
      blockName: 'image-text-right'
    },
    Component: ImageTextRight
  }
]