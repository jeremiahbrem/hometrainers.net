'use client'
import styles from './editor.module.scss'
// @ts-ignore
import { Color } from '@tiptap/extension-color'
// @ts-ignore
import ListItem from '@tiptap/extension-list-item'
// @ts-ignore
import TextStyle, { TextStyleOptions } from '@tiptap/extension-text-style'
// @ts-ignore
import { EditorProvider, useCurrentEditor } from '@tiptap/react'
// @ts-ignore
import StarterKit from '@tiptap/starter-kit'
import React, { useEffect, useState } from 'react'
import cn from 'classnames'
import { allOptions } from './options'
import { useIsEditing } from '@/utils/useIsEditing'
import { useRefreshKey } from '../refresh'
import { ColorPicker } from '../color-picker'
import { FontPicker } from '../font-picker'
import { MY_PAGE_FONTS } from '../layout'

type MenuBarProps = {
  setOpen: React.Dispatch<boolean>
  options?: string[]
  onColorChange?: (color: string) => void
  onFontChange?: (font: string) => void
}

const MenuBar: React.FC<MenuBarProps> = ({
  options,
  setOpen,
  onColorChange,
  onFontChange,
}) => {
  const { editor } = useCurrentEditor()

  const [colorOpen, setColorOpen] = useState(false)
  const [fontOpen, setFontOpen] = useState(false)

  const opts = options
    ? allOptions.filter(x => options.includes(x))
    : allOptions

  if (!editor) {
    return null
  }

  const buttonStyle = (option: string, options?: Record<string, any>) =>
    cn(
      editor.isActive(option, options) ? styles.isActive : '',
      styles.button,
      MY_PAGE_FONTS.roboto.className
    )

  return (
    <div className={styles.editorMenu}>
      {opts.includes('bold') && <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={
          !editor.can()
            .chain()
            .focus()
            .toggleBold()
            .run()
        }
        className={buttonStyle('bold')}
      >
        bold
      </button>}
      {opts.includes('italic') && <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={
          !editor.can()
            .chain()
            .focus()
            .toggleItalic()
            .run()
        }
        className={buttonStyle('italic')}
      >
        italic
      </button>}
      {opts.includes('strike') && <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={
          !editor.can()
            .chain()
            .focus()
            .toggleStrike()
            .run()
        }
        className={buttonStyle('strike')}
      >
        strike
      </button>}
      {opts.includes('p') && <button
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={buttonStyle('paragraph')}
      >
        paragraph
      </button>}
      {opts.includes('h1') && <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={buttonStyle('heading', { level: 1 })}
      >
        h1
      </button>}
      {opts.includes('h2') && <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={buttonStyle('heading', { level: 2 })}
      >
        h2
      </button>}
      {opts.includes('h3') && <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={buttonStyle('heading', { level: 3 })}
      >
        h3
      </button>}
      {opts.includes('h4') && <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        className={buttonStyle('heading', { level: 4 })}
      >
        h4
      </button>}
      {opts.includes('h5') && <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
        className={buttonStyle('heading', { level: 5 })}
      >
        h5
      </button>}
      {opts.includes('h6') && <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
        className={buttonStyle('heading', { level: 6 })}
      >
        h6
      </button>}
      {opts.includes('bulletList') && <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={buttonStyle('bulletList')}
      >
        bullet list
      </button>}
      {opts.includes('orderedList') && <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={buttonStyle('orderedList')}
      >
        ordered list
      </button>}
      {opts.includes('blockquote') && <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={buttonStyle('blockQuote')}
      >
        blockquote
      </button>}
      {opts.includes('hr') && <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className={styles.button}
      >
        horizontal rule
      </button>}
      {opts.includes('hardBreak') && <button
        onClick={() => editor.chain().focus().setHardBreak().run()}
        className={styles.button}
      >
        hard break
      </button>}
      {opts.includes('color') && <button
        onClick={() => setColorOpen(!colorOpen)}
        className={styles.button}
      >
        color
      </button>}
      {opts.includes('font') && <button
        onClick={() => setFontOpen(!fontOpen)}
        className={styles.button}
      >
        font
      </button>}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={
          !editor.can()
            .chain()
            .focus()
            .undo()
            .run()
        }
        className={styles.button}
      >
        undo
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={
          !editor.can()
            .chain()
            .focus()
            .redo()
            .run()
        }
        className={styles.button}
      >
        redo
      </button>
      <button
        onClick={() => setOpen(false)}
        className={cn(styles.button, 'close-editor')}
      >
        close
      </button>
      {onColorChange && <div
        style={{ display: colorOpen ? 'block' : 'none' }}
      >
        <ColorPicker
          color={editor.getAttributes('textStyle').color}
          updateColor={c => {
            editor.chain().focus().setColor(c).run()
            onColorChange(c)
          }}
          className={styles.colorPicker}
        />
      </div>}
      {onFontChange && <div
        style={{ display: fontOpen ? 'block' : 'none' }}
      >
        <FontPicker updateFont={f => onFontChange(f)} />
      </div>}
    </div>
  )
}

const extensions = [
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  TextStyle.configure({ types: [ListItem.name] } as Partial<TextStyleOptions>),
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
  }),
]

type EditorProps = {
  content: string
  onUpdate: (html: string) => Promise<void>
  width?: string
  top?: string
  right?: string
  left?: string
  bottom?: string
  contentRef: React.MutableRefObject<any>
  options?: string[]
  onColorChange?: (color: string) => void
  onFontChange?: (font: string) => void
  font?: string
  color?: string
}

export const Editor: React.FC<EditorProps> = ({
  content,
  onUpdate,
  width,
  right,
  left,
  contentRef,
  options,
  onColorChange,
  onFontChange,
  font = 'roboto',
  color
}) => {

  const editing = useIsEditing()
  const [open, setOpen] = useState(false)
  const [key, setKey] = useState<string | null>(null)
  const { refreshKey } = useRefreshKey()

  useEffect(() => {
    if (editing && contentRef.current) {
      contentRef.current.addEventListener('click', () => {
        setOpen(true)
      })
    }
  }, [editing, contentRef])

  useEffect(() => {
    if (key) {
      setOpen(false)
    }
    setKey(refreshKey)
  }, [refreshKey])

  if (!editing) {
    return null
  }

  return (<>
    <div
      role='button'
      className={cn(styles.scrim, { [styles.open]: open })}
      onClick={() => setOpen(false) }
      data-testid='editor-scrim'
    />
    <div
      className={cn(
        styles.editor, { [styles.open]: open },
        MY_PAGE_FONTS[font].className
      )}
      style={{
        width: width ?? '45%',
        left: left ?? 'unset',
        right: right ?? 'unset',
        display: open ? 'block' : 'none',
        color
      }}
    >
      <EditorProvider
        key={refreshKey} // editor content does not update on reset, so re-mounting
        slotBefore={<MenuBar {...{
          options,
          setOpen,
          color,
          onColorChange,
          onFontChange,
        }} />}
        extensions={extensions}
        onUpdate={e => onUpdate(e.editor.getHTML())}
        content={content}
      >
      </EditorProvider>
    </div>
  </>)
}
