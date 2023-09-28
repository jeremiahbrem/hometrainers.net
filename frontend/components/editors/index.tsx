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

type MenuBarProps = {
  options?: string[]
}

const MenuBar: React.FC<MenuBarProps> = ({ options }) => {
  const { editor } = useCurrentEditor()

  const opts = options
    ? allOptions.filter(x => options.includes(x))
    : allOptions

  if (!editor) {
    return null
  }

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
        className={editor.isActive('bold') ? styles.isActive : ''}
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
        className={editor.isActive('italic') ? styles.isActive : ''}
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
        className={editor.isActive('strike') ? styles.isActive : ''}
      >
        strike
      </button>}
      {opts.includes('p') && <button
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={editor.isActive('paragraph') ? styles.isActive : ''}
      >
        paragraph
      </button>}
      {opts.includes('h1') &&<button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? styles.isActive : ''}
      >
        h1
      </button>}
      {opts.includes('h2') &&<button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? styles.isActive : ''}
      >
        h2
      </button>}
      {opts.includes('h3') &&<button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive('heading', { level: 3 }) ? styles.isActive : ''}
      >
        h3
      </button>}
      {opts.includes('h4') &&<button
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        className={editor.isActive('heading', { level: 4 }) ? styles.isActive : ''}
      >
        h4
      </button>}
      {opts.includes('h5') &&<button
        onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
        className={editor.isActive('heading', { level: 5 }) ? styles.isActive : ''}
      >
        h5
      </button>}
      {opts.includes('h6') &&<button
        onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
        className={editor.isActive('heading', { level: 6 }) ? styles.isActive : ''}
      >
        h6
      </button>}
      {opts.includes('bulletList') &&<button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? styles.isActive : ''}
      >
        bullet list
      </button>}
      {opts.includes('orderedList') &&<button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? styles.isActive : ''}
      >
        ordered list
      </button>}
      {opts.includes('blockquote') &&<button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? styles.isActive : ''}
      >
        blockquote
      </button>}
      {opts.includes('hr') &&<button onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        horizontal rule
      </button>}
      {opts.includes('hardBreak') &&<button onClick={() => editor.chain().focus().setHardBreak().run()}>
        hard break
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
      >
        redo
      </button>
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
}

export const Editor: React.FC<EditorProps> = ({
  content,
  onUpdate,
  width,
  top,
  right,
  left,
  bottom,
  contentRef,
  options
}) => {

  const editing = useIsEditing()
  // const editing = true
  const [open, setOpen] = useState(false)
  const { refreshKey } = useRefreshKey()

  useEffect(() => {
    if (editing && contentRef.current) {
      contentRef.current.style.cursor = 'pointer'
      contentRef.current.addEventListener('click', () => {
        setOpen(true)
      })
    }
  }, [editing, contentRef])

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
      className={cn(styles.editor, { [styles.open]: open })}
      style={{
        width: width ?? '45%',
        top: top ?? 'unset',
        bottom: bottom ?? 'unset',
        left: left ?? 'unset',
        right: right ?? 'unset',
        display: open ? 'block' : 'none'
      }}
    >
      <EditorProvider
        key={refreshKey} // editor content does not update on reset, so re-mounting
        slotBefore={<MenuBar {...{ options }} />}
        extensions={extensions}
        onUpdate={e => onUpdate(e.editor.getHTML())}
        content={content}
      >
      </EditorProvider>
    </div>
  </>)
}
