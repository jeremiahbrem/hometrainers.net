import { ComponentProps, HeaderLink } from '@/components/types'
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
import { IMAGES_URL } from '@/api'
import { usePathname } from 'next/navigation'

export type BlockHeaderProps = ComponentProps<{
  text: string
  logo: string
  links: HeaderLink[]
  color: string
  font: string
  background: string
}>

export const BlockHeader: React.FC<BlockHeaderProps> = (props) => {
  const {
    addImage,
    removeImage,
    onUpdate,
    block,
    preview,
    blocks
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

  const path = usePathname()

  const isEditing = useIsEditing()

  const [addLinkOpen, setAddLinkOpen] = useState(false)
  const [editLink, setEditLink] = useState<number | null>(null)

  const [menuOpen, setMenuOpen] = useState(false)

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

  const logoUrl = preview ? logo : `${IMAGES_URL}/${logo}`

  const onLinkClick = (idx: number) => {
    if (isEditing) {
      setEditLink(idx)
      return
    }
    
    setMenuOpen(false)
  }

  return <div
    className={headerStyle}
    id='page-header'
    style={{ backgroundColor: background, color }}
  >
    <Container preview={preview} className={styles.logoContainer}>
      {logo && <Logo
        className={styles.innerLogoContainer}
        logo={logoUrl}
      />}
      {!preview && <ImageUpload 
        value={logo}
        onChange={onImageChange}
        text='logo'
        onRemove={onRemoveImage}
        addText='logo'
        className={styles.imageUpload}
      />}
    </Container>

    <Container preview={preview} ref={textRef} style={{ color }} className={styles.text}>
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
      background={background}
    />}

    <div
      className={cn(styles.links, {
        [styles.open]: menuOpen,
        [styles.editing]: isEditing && !preview
      })}
      style={{ backgroundColor: background }}
    >
      {!preview && isEditing && <Container
        preview={preview}
        role='button'
        className={cn(MY_PAGE_FONTS.roboto.className, styles.desktopAddLink)}
        onClick={() => setAddLinkOpen(true)}
      >
        Add link +
      </Container>}

      {links.map((l, idx) => (
        <Container
          key={idx}
          preview={preview}
          role={isEditing ? 'button' : undefined}
          onClick={() => onLinkClick(idx)}
          className={styles.linkContainer}
        >
          {!isEditing &&
            <Link
              key={idx}
              href={`${path}#${sanitizeAnchor(l.label)}`}
              className={styles.pageLink}
            >
              {l.label}
            </Link>
          }

          {isEditing && <p className={styles.pageLink}>{l.label}</p>}

          {isEditing && !preview && <CloseButton onClose={() => onUpdate({
            ...block,
            links: block.links.filter((_, i) => i !== idx)
          })} className={styles.linkClose} />}
        </Container>
      ))}

      {!preview && isEditing && <Container
        preview={preview}
        role='button'
        className={cn(MY_PAGE_FONTS.roboto.className, styles.mobileAddLink)}
        onClick={() => setAddLinkOpen(true)}
      >
        Add link +
      </Container>}

      {isEditing && !preview && <PageLinkPicker {...{
        open: addLinkOpen,
        setOpen: setAddLinkOpen,
        blocks,
        updateLinks: (label: string, blockId: string) => onUpdate({
          ...block,
          links: [...block.links, { label, blockId }]
        })
      }} />}
      
      {isEditing && !preview && editLink !== null && <PageLinkPicker {...{
        open: editLink !== null,
        setOpen: () => setEditLink(null),
        blocks,
        updateLinks: (label: string, blockId: string) => onUpdate({
          ...block,
          links: [
            ...block.links.slice(0, editLink), 
            { label, blockId },
            ...block.links.slice(editLink + 1), 
          ]
        }),
        link: links[editLink]
      }} />}
    </div>

    <button
      className={styles.hamburger}
      onClick={() => setMenuOpen(!menuOpen)}
    >
      <span
        className="material-symbols-outlined"
        style={{ color }}
      >menu</span>
    </button>
  </div>
}
