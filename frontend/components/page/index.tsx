import React from 'react'
import { PageProps, Block, Page, ComponentProps, HeaderLink } from '../types';
import _ from 'lodash';
import { NotFound } from '../not-found';
import { BlockActions } from './blockActions';
import { useIsEditing } from '@/utils/useIsEditing';
import { useRefreshKey } from '../refresh';

export type SetPageContext = React.Dispatch<React.SetStateAction<Page>>

export function onReorder(
  order: number,
  ctx: Page,
  currentIndex: number,
): Page {
  const blocks = ctx.blocks.blocks

  const filtered = blocks.filter((b, index) =>
    currentIndex !== index && !['header','footer'].includes(b.blockName)
  )
  const header = blocks.filter(b => b.blockName === 'header')
  const footer = blocks.filter(b => b.blockName === 'footer')

  const copy = {
    ...ctx,
    blocks: {
      blocks: [
        ...header,
        ...filtered.slice(0,order),
        blocks[currentIndex],
        ...filtered.slice(order),
        ...footer
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
  blockName: string,
): Page {
  let copy = {
    ...ctx,
    blocks: {
      blocks: [
        ...ctx.blocks.blocks.slice(0, index),
        { ...args, blockName },
        ...ctx.blocks.blocks.slice(index + 1)
      ]
    }
  }

  if (blockName === 'header') {
    copy = updateAnchors(ctx, copy)
  }

  return copy
}

export function updateAnchors(
  original: Page,
  updated: Page,
): Page {
  const links = updated.blocks.blocks[0].links as HeaderLink[]

  const update = (block: Block, idx: number) => {
    const newLink = links.find(l => l.index === idx)?.label
    const oldLink = (original.blocks.blocks[0].links as HeaderLink[])
      .find(l => l.index === idx)?.label

    let anchors = block.anchors

    if (newLink) {
      anchors = anchors
        ? [...anchors.filter(x => x !== newLink), newLink]
        : [newLink]
    }

    if (oldLink && oldLink !== newLink) {
      anchors = anchors
        ? [...anchors.filter(x => x !== oldLink)]
        : anchors
    }

    return anchors
  }

  updated.blocks.blocks = updated.blocks.blocks.map((b, i) => {
    const newAnchors = update(b, i)

    if (!newAnchors) {
      delete b.anchors
      return b
    }

    return { ...b, anchors: newAnchors }
  })

  return updated
}

export function onBackgroundChange(
  color: string,
  index: number,
  ctx: Page,
  blockName: string,
): Page {
  const copy = {
    ...ctx,
    blocks: {
      blocks: [
        ...ctx.blocks.blocks.slice(0, index),
        { ...ctx.blocks.blocks[index], blockName, background: color },
        ...ctx.blocks.blocks.slice(index + 1)
      ]
    }
  }

  return copy
}

export function addImage(img: string, ctx: Page): Page {
  return {
    ...ctx,
    images: [...ctx.images, img]
  }
}

export function removeImage(img: string, ctx: Page): Page {
  return {
    ...ctx,
    images: ctx.images.filter(i => i !== img)
  }
}

export const PageComponent = (props: PageProps) => {
  const { page, setPageContext } = props
  const isEditing = useIsEditing()
  const { reset } = useRefreshKey()

  const components = props.Blocks

  const blocks = page?.blocks?.blocks ?? []

  const showNotFound = isEditing
    ? !props.page?.email
    : !props.page?.slug

  if (showNotFound) {
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

        const blockOrder = blocks.find(x => x.blockName === 'header')
          ? idx - 1
          : idx

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
              addImage={(img: string) => setPageContext(ctx => addImage(img, ctx))}
              removeImage={(img: string) => setPageContext(ctx => removeImage(img, ctx))}
              blockNames={blocks.map(x => x.blockName)}
            />

            {isEditing && <BlockActions {...{
              onRemove: () => setPageContext(ctx => onRemove(idx, ctx)),
              onReorder: (order: number) => {
                setPageContext(ctx => onReorder(
                  order,
                  ctx,
                  idx
                ))
                reset()
              },
              order: blockOrder,
              onBackgroundChange: (color: string) => setPageContext(ctx => onBackgroundChange(
                color,
                idx,
                ctx,
                blockName
              )),
              background: page.blocks.blocks[idx].background,
              isHeaderFooter: ['header','footer'].includes(block.blockName)
            }} />}

          </React.Fragment>
        )
      })}
    </>
  )
}