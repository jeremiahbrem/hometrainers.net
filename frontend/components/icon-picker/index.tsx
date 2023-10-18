import React, { useState } from 'react'
import { Container } from '../container'
import styles from './iconPicker.module.scss'
import { Button } from '../button'
import { ClickToAdd } from '../click-to-add'
import { useIsEditing } from '@/utils/useIsEditing'
import cn from 'classnames'
import { ColorPicker } from '../color-picker'

type IconPickerProps = {
  icon: string
  color: string
  onIconUpdate: (icon: string, color: string) => void
  preview?: boolean
  className?: string
}

export const IconPicker: React.FC<IconPickerProps> = (props) => {
  const {
    icon,
    color,
    onIconUpdate,
    preview,
    className
  } = props

  const [iconModalOpen, setIconModalOpen] = useState(false)
  const [iconVal, setIconVal] = useState(icon)
  const [iconColor, setIconColor] = useState(color)
  const isEditing = useIsEditing()

  const onIconChange = (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    evt.stopPropagation()
    onIconUpdate(iconVal, iconColor)
    setIconModalOpen(false)
  }

  const onColorChange = (newColor: string) => {
    setIconColor(newColor)
  }

  const onModalClose = (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    evt.stopPropagation()
    setIconModalOpen(false)
  }

  const sanitizeIcon = (icon: string) =>
    icon.toLowerCase().split(' ').join('_')

  const handleModalOpen = () => {
    if (isEditing && !preview) {
      setIconModalOpen(true)
    }
  }

  return (
    <Container
      className={cn(styles.icon, className)}
      preview={preview}
      role={isEditing ? 'button' : undefined}
      data-testid='open-icon-picker'
      onClick={handleModalOpen}
    >
      {icon
        ? <span
          className='material-symbols-outlined'
          style={{ color }}
        >{sanitizeIcon(icon)}</span>
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
            <Button text='Update' onClick={onIconChange} type='button' data-testid='update-icon' />
          </form>
          <ColorPicker color={color} updateColor={c => onColorChange(c)}/>
          <button
            className={styles.closeModal}
            onClick={onModalClose}>x
          </button>
        </div>
      </div>
    </Container>
  )
}