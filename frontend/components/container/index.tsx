import { useIsEditing } from '@/utils/useIsEditing'
import React, { DetailedHTMLProps, forwardRef } from 'react'
import cn from 'classnames'
import styles from './container.module.scss'

type ContainerProps = DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  preview?: boolean
}

export const Container = forwardRef((props: ContainerProps, ref) => {
  const { className, children, preview, ...rest } = props;
  const isEditing = useIsEditing()

  const style = cn(styles.section, className, { [styles.editing]: isEditing && !preview })

  return (
    <div className={style} {...rest} ref={ref as React.LegacyRef<HTMLDivElement>}>
      {children}
    </div>
  )
})

Container.displayName = 'Container'