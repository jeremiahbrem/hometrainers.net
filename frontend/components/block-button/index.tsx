import React, { useRef, useState } from 'react'
import styles from './blockButton.module.scss'
import cn from 'classnames'
import { Container } from '../container'
import { ColorPicker } from '../color-picker'
import { Toggle } from '../toggle'
import { useIsEditing } from '@/utils/useIsEditing'
import { CloseButton } from '../close-button'

export type BlockButtonProps = {
  text: string
  color: string
  background: string
  outlined: boolean
}

type ButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & BlockButtonProps & {
  onClick?: () => any
  className?: string
  preview?: boolean
  onButtonChange: (
    text: string,
    color: string,
    background: string,
    outlined: boolean
  ) => void
  modalLeft?: number
  modalTop?: number
}

export const BlockButton: React.FC<ButtonProps> = (props) => {
  const {
    onClick,
    text,
    className,
    type,
    disabled,
    outlined,
    color,
    background,
    preview,
    onButtonChange,
    modalLeft,
    modalTop,
    ...rest
  } = props;

  const style = cn(styles.button, className)

  const [open, setOpen] = useState(false)

  const isEditing = useIsEditing()
  
  const ref = useRef<HTMLButtonElement>(null)

  const [colorSetting, setColorSetting] = useState<'color' | 'background'>('color')

  const onMouseOver = () => {
    if (ref.current) {
      ref.current.style.color = outlined ? color : background
      ref.current.style.backgroundColor = outlined ? background : 'transparent'
    }
  }

  const onMouseOut = () => {
    if (ref.current) {
      ref.current.style.color = outlined ? background : color
      ref.current.style.backgroundColor = outlined ? 'transparent' : background
    }
  }

  const buttonId = `${Math.random()}`

  const buttonDisabled = !isEditing ? disabled : false

  const handleClick = (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (isEditing) {
      setOpen(true)
      return
    }

    evt.stopPropagation()

    onClick && onClick()
  }

  const colorPickerProps = {
    color: colorSetting === 'color' ? color : background,
    updateColor: (c: string) => onButtonChange(
      text,
      colorSetting === 'color' ? c : color,
      colorSetting === 'background' ? c : background,
      outlined
    )
  }

  return (
    <Container
      role={isEditing ? 'button' : undefined}
      onClick={() => isEditing ? setOpen(true) : undefined}
      preview={preview}
      data-testid='block-button'
    >
      <button
        {...rest}
        type={type ?? 'button'}
        className={style}
        disabled={buttonDisabled}
        ref={ref}
        onClick={handleClick}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        style={{
          color: outlined ? background : color,
          backgroundColor: outlined ? 'transparent' : background,
          borderColor: background
        }}
      >
        {text}
      </button>
      {isEditing && !preview && <div
        className={styles.modal}
        style={{
          display: open ? 'block' : 'none',
          left: `${modalLeft ?? 0}rem`,
          top: `${modalTop ?? 0}rem`,
        }}
      >
        <div className={styles.innerModal}>
          <label htmlFor={buttonId} className={styles.label}>Button Text</label>
          <input
            className={styles.input}
            name={'block-button'}
            id={buttonId}
            placeholder='Button text'
            value={text}
            onChange={e => onButtonChange(e.target.value, color, background, outlined)}
          />
          <p className={styles.editColorLabel}>Edit color</p>
          <Toggle
            checked={colorSetting == 'background'}
            label='text / background'
            onChange={c => setColorSetting(c ? 'background' : 'color')}
            className={styles.colorToggle}
          />
          <ColorPicker {...colorPickerProps} />
          <Toggle
            checked={outlined}
            label='Outlined'
            onChange={c => onButtonChange(text, color, background, c)}
          />
          <CloseButton onClose={() => setOpen(false)} className='edit-button-close'/>
        </div>
      </div>}
    </Container>
  ) 
}