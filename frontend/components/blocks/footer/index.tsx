import React, { useRef, useState } from 'react'
import styles from './footer.module.scss'
import Link from 'next/link'
import { ComponentProps, HeaderLink } from '@/components/types'
import { useIsEditing } from '@/utils/useIsEditing'
import { sanitizeAnchor } from '../block-wrapper'
import { Container } from '@/components/container'
import { MY_PAGE_FONTS } from '@/components/layout'
import cn from 'classnames'
import { CloseButton } from '@/components/close-button'
import { PageLinkPicker } from '../page-link-picker'
import { ClickToAdd } from '@/components/click-to-add'
import parse from 'html-react-parser'
import { Editor } from '@/components/editors'

export type BlockFooterProps = ComponentProps<{
  links: HeaderLink[]
  color: string
  font: string
  background: string
  copyright: string
}>

export const BlockFooter: React.FC<BlockFooterProps> = (props) => {
  const {
    onUpdate,
    block,
    preview,
    blockNames
  } = props

  const {
    color,
    font = 'roboto',
    background,
    links = [],
    copyright
  } = block

  const isEditing = useIsEditing()
  const [addLinkOpen, setAddLinkOpen] = useState(false)
  const [editLink, setEditLink] = useState<number | null>(null)

  const copyrightRef = useRef(null)

  const updateCopyright = async (copyright: string) => onUpdate({
    ...block,
    copyright
  })

  return (
    <div
      className={cn(styles.footer, MY_PAGE_FONTS[font].className)}
      style={{ backgroundColor: background, color }}
    >
      <Container preview={preview} style={{ color }} className={styles.copyright}>
        {copyright && copyright != '<p></p>' && <>
          &copy;{new Date().getFullYear()}&nbsp;{parse(copyright || '<p></p>')}
        </>}
      </Container>

      {!preview && <Editor
        content={copyright}
        onUpdate={updateCopyright}
        right={'1rem'}
        contentRef={copyrightRef}
        options={['color','font']}
        color={color}
        onColorChange={c => onUpdate({
          ...block,
          color: c
        })}
        font={font}
        onFontChange={f => onUpdate({...block, font: f })}
        background={background}
      />}

      {links.map((l, idx) => (
        <Container
          key={idx}
          preview={preview}
          role={isEditing ? 'button' : undefined}
        >
          <Link
            key={idx}
            href={isEditing ? '' : `#${sanitizeAnchor(l.label)}`}
            className={styles.pageLink}
          >
            {l.label}
          </Link>
          {isEditing && !preview && <CloseButton onClose={() => onUpdate({
            ...block,
            links: block.links.filter((_, i) => i !== idx)
          })} className={styles.linkClose} />}
        </Container>
      ))}

      {!preview && isEditing && <Container
        preview={preview}
        role='button'
        className={cn(MY_PAGE_FONTS.roboto.className, styles.desktopAddLink)}
        onClick={() => setAddLinkOpen(true)}
      >
        Add link +
      </Container>} 
      
      {!preview && isEditing && <Container
        preview={preview}
        // role='button'
        className={cn(MY_PAGE_FONTS.roboto.className, styles.addCopyright)}
        ref={copyrightRef}
      >
        Add copyright +
      </Container>} 

      {isEditing && !preview && <PageLinkPicker {...{
        open: addLinkOpen,
        setOpen: setAddLinkOpen,
        blockNames,
        updateLinks: (label: string, index: number) => onUpdate({
          ...block,
          links: [...block.links, { label, index }]
        })
      }} />}
      
      {isEditing && !preview && editLink !== null && <PageLinkPicker {...{
        open: editLink !== null,
        setOpen: () => setEditLink(null),
        blockNames,
        updateLinks: (label: string, index: number) => onUpdate({
          ...block,
          links: [
            ...block.links.slice(0, editLink), 
            { label, index },
            ...block.links.slice(editLink + 1), 
          ]
        }),
        link: links[editLink]
      }} />}
    </div>
  )
}