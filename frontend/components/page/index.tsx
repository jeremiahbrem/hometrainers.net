import React from 'react'
import { PageProps, Block, Page, ComponentProps } from '../types';
import _ from 'lodash';
import { NotFound } from '../not-found';
import { BlockActions } from './blockActions';
import { useIsEditing } from '@/utils/useIsEditing';

export type SetPageContext = React.Dispatch<React.SetStateAction<Page>>

export function onReorder(
  order: number,
  ctx: Page,
  currentIndex: number
): Page {
  const blocks = ctx.blocks.blocks

  const filtered = blocks.filter((_, index) => currentIndex !== index)

  const copy = {
    ...ctx,
    blocks: {
      blocks: [
        ...filtered.slice(0,order),
        blocks[currentIndex],
        ...filtered.slice(order)
      ]
    }
  }

  return copy
}

export function onRemove(
  index: number,
  ctx: Page
): Page {
  const copy = {
    ...ctx,
    blocks: {
      blocks: [
        ...ctx.blocks.blocks.slice(0, index),
        ...ctx.blocks.blocks.slice(index + 1)
      ]
    }
  }

  return copy
}

export function onUpdate(
  args: Record<string, any>,
  index: number,
  ctx: Page,
  blockName: string
): Page {
  const copy = {
    ...ctx,
    blocks: {
      blocks: [
        ...ctx.blocks.blocks.slice(0, index),
        { ...args, blockName },
        ...ctx.blocks.blocks.slice(index + 1)
      ]
    }
  }

  return copy
}

export const PageComponent = (props: PageProps) => {
  const { page, setPageContext } = props
  const isEditing = useIsEditing()

  const components = props.Blocks

  const blocks = page?.blocks?.blocks ?? []

  if (!props.page?.slug || !props.page?.email) {
    return <NotFound />
  }

  return (
    <>
      {blocks.map((block, idx) => {
        const parsedBlock = block as unknown as Block
        const blockName = parsedBlock.blockName
        const Component = components[blockName] as React.FC<ComponentProps<Block>>;

        if (!Component) {
          return <div key={idx}>Block {blockName} not found</div>
        }

        return (
          <React.Fragment key={idx}>
            <Component
              block={parsedBlock}
              onUpdate={(args: any) => setPageContext(ctx => onUpdate(
                args,
                idx,
                ctx,
                blockName
              ))}
            />

            {isEditing && <BlockActions {...{
              onRemove: () => setPageContext(ctx => onRemove(idx, ctx)),
              onReorder: (order: number) => setPageContext(ctx => onReorder(
                order,
                ctx,
                idx
              )),
              order: idx
            }} />}

          </React.Fragment>
        )
      })}
    </>
  )
}