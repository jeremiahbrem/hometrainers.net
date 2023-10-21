import React from 'react'
import styles from './previewBlocks.module.scss'
import cn from 'classnames'
import { Block } from '../types'
import { ImageTextLeft } from '../blocks/image-text-left'
import { ImageTextRight } from '../blocks/image-rext-right'
import { FullPageImageTextLeft } from '../blocks/full-page-image-text-left'
import { FullPageImageTextRight } from '../blocks/full-page-image-text-right'
import { ContactForm } from '../blocks/contact-form'
import { IconTextList } from '../blocks/icon-text-list'
import { TwoColumnText } from '../blocks/two-column-text'

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
      <div
        className={styles.blockButton}
        onClick={() => onBlockClick(newBlock)}
        data-testid={testId}
        role='button'
      >
      {children}
      </div>
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
  },
  {
    newBlock: {
      blockName: 'full-page-image-text-left',
      text: '',
      image: '',
      imageAlt: ''
    },
    className: styles.fullPageImageText,
    testId: 'full-page-image-text-left-preview',
    componentProps: {
      ...defaultProps,
      block: {
        image: '/carl-barcelo-hHzzdVQnkn0-unsplash.jpg',
        text: '<h4>Reach Your Personal Goals</h4>',
        color: '#FFFFFF'
      },
      blockName: 'full-page-image-text-left'
    },
    Component: FullPageImageTextLeft
  },
  {
    newBlock: {
      blockName: 'full-page-image-text-right',
      text: '',
      image: '',
      imageAlt: ''
    },
    className: styles.fullPageImageText,
    testId: 'full-page-image-text-right-preview',
    componentProps: {
      ...defaultProps,
      block: {
        image: '/carl-barcelo-hHzzdVQnkn0-unsplash.jpg',
        text: '<h4>Reach Your Personal Goals</h4>',
        color: '#FFFFFF'
      },
      blockName: 'full-page-image-text-right'
    },
    Component: FullPageImageTextRight
  },
  {
    newBlock: {
      blockName: 'contact-form',
      title: '',
      image: '',
      imageAlt: ''
    },
    className: styles.contactForm,
    testId: 'contact-form-preview',
    componentProps: {
      ...defaultProps,
      block: {
        image: '/luna-active-fitness-iEpsg6OzyXw-unsplash.jpg',
        title: '<h3>Contact Us</h3>' ,
        button: {
          text: 'Send',
          outlined: false,
          color: '#dd940c',
        }
      },
      blockName: 'contact-form'
    },
    Component: ContactForm
  },
  {
    newBlock: {
      blockName: 'icon-text-list',
      title: '',
      items: []
    },
    className: styles.iconTextList,
    testId: 'icon-text-list-preview',
    componentProps: {
      ...defaultProps,
      block: {
        title: '<h2>Benefits of Personal Training</h2>',
        items: [
          {
            icon: 'Exercise',
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            iconColor: '#dd940c',
            textColor: '#A4A0AE'
          },
          {
            icon: 'Health Metrics',
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            iconColor: '#dd940c',
            textColor: '#A4A0AE'
          },
          {
            icon: 'Body System',
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            iconColor: '#dd940c',
            textColor: '#A4A0AE'
          },
        ]
      },
      blockName: 'icon-text-list'
    },
    Component: IconTextList
  },
  {
    newBlock: {
      blockName: 'two-column-text',
      left: {
        color: '',
        text: '',
        font: ''
      },
      right: {
        color: '',
        text: '',
        font: ''
      }
    },
    className: styles.twoColumnText,
    testId: 'two-column-text-preview',
    componentProps: {
      ...defaultProps,
      block: {
        left: {
          text: '<h3>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</h3>',
          color: '#3c3636',
          font: 'oswald',
        },
        right: {
          text: '<p>Sed ut <span>perspiciatis</span> unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>',
          color: '#A4A0AE',
          font: 'openSans',
        },
      },
      blockName: 'two-column-text'
    },
    Component: TwoColumnText
  },
]