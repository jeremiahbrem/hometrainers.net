import { BlockHeaderProps } from '@/components/types'
import styles from './header.module.scss'
import cn from 'classnames'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { Container } from '@/components/container'
import { Editor } from '@/components/editors'
import { useRef, useState } from 'react'
import { MY_PAGE_FONTS } from '@/components/layout'
import { useIsEditing } from '@/utils/useIsEditing'
import { ClickToAdd } from '@/components/click-to-add'
import parse from 'html-react-parser'
import { ImageUpload } from '@/components/image-upload'
import { sanitizeAnchor } from '../block-wrapper'
import { PageLinkPicker } from '../page-link-picker'
import { CloseButton } from '@/components/close-button'

export const BlockHeader: React.FC<BlockHeaderProps> = (props) => {
  const {
    addImage,
    removeImage,
    onUpdate,
    block,
    preview,
    blockNames
  } = props

  const {
    text,
    color,
    font = 'roboto',
    logo,
    background,
    links = []
  } = block

  const textRef = useRef(null)

  const isEditing = useIsEditing()

  const [addLinkOpen, setAddLinkOpen] = useState(false)
  const [editLink, setEditLink] = useState<number | null>(null)

  const onImageChange = (img: string) => {
    if (img) {
      addImage(img)
    }

    onUpdate({
      ...block,
      logo: img
    })
  }

  const onRemoveImage = () => {
    removeImage(logo)

    onUpdate({
      ...block,
      logo: ''
    })
  }

  const onTextUpdate = async (text: string) => {
    onUpdate({
      ...block,
      text
    })
  }

  const onColorChange = (color: string) => {
    onUpdate({
      ...block,
      color
    })
  }
  
  const headerStyle = cn(
    styles.header,
    MY_PAGE_FONTS[font].className,
    { [styles.editing]: isEditing }
  )

  return <div
    className={headerStyle}
    id='header'
    style={{ backgroundColor: background, color }}
  >
    <Container preview={preview} className={styles.logoContainer}>
      {logo && <Logo className={styles.innerLogoContainer} logo={logo} />}
      {!preview && <ImageUpload 
        value={logo}
        onChange={onImageChange}
        text='logo'
        onRemove={onRemoveImage}
        addText='logo'
        className={styles.imageUpload}
      />}
    </Container>

    <Container preview={preview} ref={textRef} style={{ color }}>
      {parse(text || '<p></p>')}
      <ClickToAdd {...{ text: 'text', value: text }} />
    </Container>

    {!preview && <Editor
      content={text}
      onUpdate={onTextUpdate}
      right={'1rem'}
      contentRef={textRef}
      options={['color','font']}
      color={color}
      onColorChange={onColorChange}
      font={font}
      onFontChange={f => onUpdate({...block, font: f })}
    />}

    <div className={styles.links}>
      {!preview && isEditing && <Container
        preview={preview}
        role='button'
        className={MY_PAGE_FONTS.roboto.className}
        onClick={() => setAddLinkOpen(true)}
      >
        Add link +
      </Container>}

      {links.map((l, idx) => (
        <Container
          key={idx}
          preview={preview}
          role={isEditing ? 'button' : undefined}
          onClick={isEditing ? (() => setEditLink(idx)) : undefined}
        >
          <Link
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
  </div>
}