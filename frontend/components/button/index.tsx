import React from 'react'
import styles from './button.module.scss'
import cn from 'classnames'

type ButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  onClick?: () => any
  text: string
  className?: string
}
export const Button: React.FC<ButtonProps> = (props) => {
  const { onClick, text, className, ...rest } = props;

  const style = cn(styles.button, className)

  return (
    <button className={style} onClick={onClick} {...rest}>{text}</button>
  )
}