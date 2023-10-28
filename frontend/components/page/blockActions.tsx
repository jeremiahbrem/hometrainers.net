import React, { useState } from 'react'
import { Button } from '../button'
import styles from './blockActions.module.scss'
import cn from 'classnames'
import { ColorPicker } from '../color-picker'

type BlockActionProps = {
  onRemove: () => void
  onReorder: (order: number) => void
  order: number
  onBackgroundChange?: (color: string) => void
  background?: string
  isHeaderFooter?: boolean
}

export const BlockActions: React.FC<BlockActionProps> = (props) => {
  const {
    onRemove,
    onReorder,
    order,
    background,
    onBackgroundChange,
    isHeaderFooter,
  } = props

  const [blockOrder, setBlockOrder] = useState(`${order + 1}`)
  const [reorderOpen, setReorderOpen] = useState(false)
  const [backgroundOpen, setBackgroundOpen] = useState(false)

  const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const val = evt.target.value
    setBlockOrder(val)
  }

  const onSubmit = () => {
    if (blockOrder) {
      onReorder(parseInt(blockOrder) - 1)
    }

    setBlockOrder(`${order + 1}`)
    setReorderOpen(false)
  }
 
  return (
    <div className={styles.blockActions}>
      <Button text='Remove Block' onClick={onRemove} />
      {!isHeaderFooter && <Button text='Reorder' onClick={() => setReorderOpen(true)} />}
      <Button text='Background' onClick={() => setBackgroundOpen(true)} />
      
      {!isHeaderFooter && <div className={cn(styles.reorderForm, { [styles.open]: reorderOpen })}>
        {reorderOpen && <form onSubmit={onSubmit} className={styles.form}>
          <label htmlFor='order'>Order</label>
          <input
            name='order'
            id='order'
            onChange={onChange}
            value={blockOrder}
            type='number'
            className={styles.input}
          />
          <Button text='Update' onClick={onSubmit} />
          <Button text='Cancel' onClick={() => setReorderOpen(false)} type='button' />
        </form>}
      </div>}
      
      {onBackgroundChange && <div className={cn(styles.background, { [styles.open]: backgroundOpen })}>
        <ColorPicker color={background || ''} updateColor={c => onBackgroundChange(c)}/>
        <div>
          <Button text='Close' onClick={() => setBackgroundOpen(false)} type='button' />
        </div>
      </div>}
    </div>
  )
}