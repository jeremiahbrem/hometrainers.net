import React from 'react'
import { useState } from "react";
import Layout from "../layout";
import { PageProps, Page, Block } from '../types';
import { PageSaver } from './pageSaver';
import _ from 'lodash';
import { useRefreshKey } from '../refresh';
import { NotFound } from '../not-found';

export const PageComponent = (props: PageProps) => {
  const components = props.Blocks
  const { reset: resetKey } = useRefreshKey()

  const copyProps = () => ({
    ...props.page,
    blocks: {...props.page.blocks}
  })

  const [pageContext, setPageContext] = useState<Page>(copyProps)
  const ctxBlocks = pageContext.blocks?.blocks ?? []
  
  const reset = () => {
    setPageContext(copyProps)
    resetKey()
  }

  if (!props.page?.slug || !props.page?.email) {
    return <NotFound />
  }

  return (
    <Layout>
      {ctxBlocks.map((block, idx) => {
        const parsedBlock = block as unknown as Block
        const blockName = parsedBlock.blockName
        const Component = components[blockName] as React.FC<any>;

        if (!Component) {
          return <div key={idx}>Block {blockName} not found</div>
        }

        return <Component
          key={idx}
          block={parsedBlock}
          onUpdate={(args: Record<string, any>) => setPageContext(ctx => {
            const copy = {...ctx}
            const blocks = copy.blocks.blocks.filter(x => x.blockName != blockName)
            const updatedBlock = {
              ...args,
              blockName,
            }

            copy.blocks.blocks = [
              ...blocks,
              updatedBlock
            ]

            return copy
          })}
        />
      })}
      <PageSaver {...{ pageProps: props.page, pageContext, reset }} />
    </Layout>
  )
}