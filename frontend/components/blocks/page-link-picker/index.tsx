import { Select } from '@/components/select'
import React, { useState } from 'react'
import styles from './pageLinkPicker.module.scss'
import { Button } from '@/components/button'
import { Block, HeaderLink } from '@/components/types'

type PageLinkPickerProps = {
  open: boolean
  setOpen: (open: boolean) => void
  blocks: Block[]
  updateLinks: (label: string, blockId: string) => void
  link?: HeaderLink | null
  top?: number
  right?: number
}

const formatBlockName = (name: string, index: number) => {
  const newString = name
    .split('-')
    .map(x => x[0].toUpperCase() + x.slice(1))
    .join(' ')

  return `${index} ${newString}`
}

type FormState = {
  blockId: string | null
  label: string
}

export const PageLinkPicker: React.FC<PageLinkPickerProps> = (props) => {
  const {
    open,
    setOpen,
    blocks,
    updateLinks,
    link,
    top,
    right,
  } = props

  const [formState, setFormState] = useState<FormState>({
    blockId: link?.blockId ?? null,
    label: link?.label ?? ''
  })

  const { blockId, label } = formState

  const hasHeader = !!blocks.find(x => x.blockName === 'header')

  const options = blocks
    .map((x, idx) => ({
      label: formatBlockName(x.blockName, hasHeader ? idx : idx + 1),
      value: x.blockId
    }))
    .filter(x => !x.label.includes('Header') && !x.label.includes('Footer'))

  const getBlockLabel = (id: string) => {
    const index = blocks.findIndex(x => x.blockId === id)
    const block = blocks[index]

    const displayedIndex = hasHeader ? index : index + 1

    return formatBlockName(block?.blockName, displayedIndex)
  }

  const selected = blockId != null
    ? [ {
        value: blockId,
        label: getBlockLabel(blockId)
      }]
    : []

  const onSubmit = () => {
    if (label && blockId != null) {
      updateLinks(label, blockId)
      setFormState({ blockId: null, label: '' })
      setOpen(false)
    }
  }

  return (
    <div
      className={styles.addLinkModal}
      style={{
        display: open ? 'block' : 'none',
        top: `${top ?? 3}rem`,
        right: `${right ?? 1}rem`
      }}
    >
      {open && <form onSubmit={e => e.preventDefault()}>
        <label htmlFor='block-link-label'>Label</label>
        <input {...{
          id: 'block-link-label',
          placeholder: 'Label',
          name: 'label',
          className: styles.labelInput,
          value: formState.label,
          onChange: e => setFormState(st => ({...st, label: e.target.value }))
        }} />
        
        <Select {...{
          name: 'block',
          options,
          label: 'Select block',
          selected,
          addValue: (val: string) => setFormState(st => ({...st, blockId: val })),
          placeholder: 'Select block',
          onRemove: () => setFormState(st => ({...st, blockId: null })),
          showAll: true,
        }} />

        <div className={styles.buttons}>
          <Button text={link ? 'Update' : 'Add'} onClick={onSubmit} data-testid='update-page-links-button' />
          <Button text='Cancel' onClick={() => setOpen(false)} />
        </div>
      </form>}
    </div>
  )
}