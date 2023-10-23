import { Select } from '@/components/select'
import React, { useState } from 'react'
import styles from './pageLinkPicker.module.scss'
import { Button } from '@/components/button'
import { HeaderLink } from '@/components/types'

type PageLinkPickerProps = {
  open: boolean
  setOpen: (open: boolean) => void
  blockNames: string[]
  updateLinks: (label: string, index: number) => void
  link?: HeaderLink | null
}

const formatBlockName = (name: string, index: number) => {
  const newString = name
    .split('-')
    .map(x => x[0].toUpperCase() + x.slice(1))
    .join(' ')

  return `${index} ${newString}`
}

type FormState = {
  index: number | null
  label: string
}

export const PageLinkPicker: React.FC<PageLinkPickerProps> = (props) => {
  const {
    open,
    setOpen,
    blockNames,
    updateLinks,
    link
  } = props

  const [formState, setFormState] = useState<FormState>({
    index: link?.index ?? null,
    label: link?.label ?? ''
  })

  const { index, label } = formState

  const options = blockNames
    .map(formatBlockName)
    .map((x, idx) => ({ label: x, value: idx }))
    .filter(x => !x.label.includes('Header') && !x.label.includes('Footer'))

  const selected = index != null
    ? [ {
        value: index,
        label: formatBlockName(blockNames[index], index)
      }]
    : []

  const onSubmit = () => {
    if (label && index != null) {
      updateLinks(label, index)
      setFormState({ index: null, label: '' })
      setOpen(false)
    }
  }

  return (
    <div
      className={styles.addLinkModal}
      style={{ display: open ? 'block' : 'none' }}
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
          addValue: (val: number) => setFormState(st => ({...st, index: val })),
          placeholder: 'Select block',
          onRemove: () => setFormState(st => ({...st, index: null })),
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