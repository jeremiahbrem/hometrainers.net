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
  outlined: boolean
}

type ButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & BlockButtonProps & {
  onClick?: () => any
  className?: string
  preview?: boolean
  onButtonChange: (text: string, color: string, outlined: boolean) => void
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

  const onMouseOver = () => {
    if (ref.current) {
      ref.current.style.color = outlined ? 'white' : color
      ref.current.style.backgroundColor = outlined ? color : 'transparent'
    }
  }

  const onMouseOut = () => {
    if (ref.current) {
      ref.current.style.color = outlined ? color : 'white'
      ref.current.style.backgroundColor = outlined ? 'transparent' : color
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

  return (
    <Container
      role={isEditing ? 'button' : undefined}
      onClick={() => isEditing ? setOpen(true) : undefined}
      preview={preview}
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
          color: outlined ? (color ?? 'white') : 'white',
          backgroundColor: outlined ? 'transparent' : color,
          borderColor: color
        }}
      >
        {text}
      </button>
      {isEditing && <div
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
            onChange={e => onButtonChange(e.target.value, color, outlined)}
          />
          <ColorPicker color={color} updateColor={c => onButtonChange(text, c, outlined)}/>
          <Toggle checked={outlined} label='Outlined' onChange={c => onButtonChange(text, color, c)}/>
          <CloseButton onClose={() => setOpen(false)} className='edit-button-close'/>
        </div>
      </div>}
    </Container>
  ) 
}