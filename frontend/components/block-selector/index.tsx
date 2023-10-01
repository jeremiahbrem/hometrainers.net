import React, { useState } from 'react'
import styles from './blockSelector.module.scss'
import cn from 'classnames'
import { Button } from '../button'
import { PreviewBlock, PreviewBlocksType } from './previewBlocks'

type BlockSelectorProps = {
  onClick: (block: Record<string, any>) => void
  PreviewBlocks: PreviewBlocksType
}

export const BlockSelector: React.FC<BlockSelectorProps> = (props) => {
  const { onClick, PreviewBlocks } = props

  const [open, setOpen] = useState(false)

  const onBlockClick = (block: Record<string, any>) => {
    onClick(block)
    setOpen(false)
  }

  return (<>
    <div className={styles.openSelector}>
      <Button text={'Add Block'} onClick={() => setOpen(true)} />
    </div>
    <div
      className={cn(styles.blockSelector)}
      data-testid='block-selector'
      style={{
        display: open ? 'grid' : 'none'
      }}
    >
      <div className={styles.cancel}>
        <Button text={'Cancel'} onClick={() => setOpen(false)} />
      </div>
      {PreviewBlocks.map(({
        Component,
        componentProps,
        ...rest
      }, idx) => (
        <PreviewBlock key={idx} {...{
          ...rest,
          onBlockClick
        }}>
          <Component {...componentProps} />
        </PreviewBlock>
      ))}
    </div>
    </>
  )
}