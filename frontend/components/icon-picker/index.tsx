import React, { useState } from 'react'
import { Container } from '../container'
import styles from './iconPicker.module.scss'
import { Button } from '../button'
import { ClickToAdd } from '../click-to-add'
import { useIsEditing } from '@/utils/useIsEditing'
import cn from 'classnames'

type IconPickerProps = {
  icon: string
  onIconUpdate: (icon: string) => void
  preview?: boolean
  className?: string
}

export const IconPicker: React.FC<IconPickerProps> = (props) => {
  const {
    icon,
    onIconUpdate,
    preview,
    className
  } = props

  const [iconModalOpen, setIconModalOpen] = useState(false)
  const [iconVal, setIconVal] = useState(icon)
  const isEditing = useIsEditing()

  const onIconAdd = (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    evt.stopPropagation()
    onIconUpdate(iconVal)
    setIconModalOpen(false)
  }

  const onModalClose = (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    evt.stopPropagation()
    setIconModalOpen(false)
  }

  const sanitizeIcon = (icon: string) =>
    icon.toLowerCase().split(' ').join('_')

  return (
    <Container
      className={cn(styles.icon, className)}
      preview={preview}
      role={isEditing ? 'button' : undefined}
      data-testid='open-icon-picker'
      onClick={() => setIconModalOpen(true)}
    >
      {icon
        ? <span className='material-symbols-outlined'>{sanitizeIcon(icon)}</span>
        : <span />}

      <ClickToAdd {...{ text: 'icon', value: icon,  }} />
      
      <div
        className={styles.iconModal}
        style={{ display: iconModalOpen ? 'block' : 'none' }}
      >
        <div className={styles.modalContents}>
          <a
            href='https://fonts.google.com/icons'
            target='__blank'
          >
            Search icons here
          </a>
          <form onSubmit={e => e.preventDefault()}>
            <label htmlFor='icon-name'>Enter Icon</label>
            <input
              id='icon-name'
              name='icon-name'
              value={iconVal}
              placeholder='Enter icon name'
              onChange={e => setIconVal(e.target.value)}
            />
            <Button text='Update' onClick={onIconAdd} type='button' data-testid='update-icon' />
          </form>
          <button
            className={styles.closeModal}
            onClick={onModalClose}>x
          </button>
        </div>
      </div>
    </Container>
  )
}