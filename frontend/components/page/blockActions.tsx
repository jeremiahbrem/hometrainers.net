import React, { useEffect, useState } from 'react'
import { Button } from '../button'
import styles from './blockActions.module.scss'
import cn from 'classnames'

type BlockActionProps = {
  onRemove: () => void
  onReorder: (order: number) => void
  order: number
}

export const BlockActions: React.FC<BlockActionProps> = (props) => {
  const { onRemove, onReorder, order } = props
  const [blockOrder, setBlockOrder] = useState(`${order + 1}`)
  const [open, setOpen] = useState(false)

  const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const val = evt.target.value
    setBlockOrder(val)
  }

  const onSubmit = () => {
    if (blockOrder) {
      onReorder(parseInt(blockOrder) - 1)
    }

    setBlockOrder(`${order + 1}`)
    setOpen(false)
  }
 
  return (
    <div className={styles.blockActions}>
      <Button text='Remove Block' onClick={onRemove} />
      <Button text='Reorder' onClick={() => setOpen(true)} />
      
      <div className={cn(styles.reorderForm, { [styles.open]: open })}>
        {open && <form onSubmit={onSubmit}>
          <label htmlFor='order'>Order</label>
          <input
            name='order'
            id='order'
            onChange={onChange}
            value={blockOrder}
            type='number'
          />
          <Button text='Update' onClick={onSubmit} />
          <Button text='Cancel' onClick={() => setOpen(false)} type='button' />
        </form>}
      </div>
    </div>
  )
}