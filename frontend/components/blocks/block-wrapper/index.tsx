import React from 'react'
import styles from './blockWrapper.module.scss'
import cn from 'classnames'

type BlockWrapperProps = {
  anchors?: string[]
  className?: string
  style?: React.CSSProperties
  dataTestId?: string
  children: React.ReactNode
}

export const sanitizeAnchor = (anchor: string) =>
  anchor.toLowerCase().split(' ').join('-')

export const BlockWrapper: React.FC<BlockWrapperProps> = (props) => {
  const { dataTestId, children, className, anchors, ...rest } = props

  return (
    <section {...{ ...rest, 'data-testid': dataTestId }}
      className={cn(styles.blockWrapper, className)}
    >
      {anchors && anchors.map((a, i) =>
        <a key={i} id={sanitizeAnchor(a)} className={styles.anchor} />
      )}
      {children}
    </section>
  )
}