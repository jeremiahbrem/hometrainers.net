export type Block = Record<string, any> & {
  blockName: string
}

export type Page = {
  blocks: { blocks: Block[] },
  slug: string,
  email: string,
  title: string,
  description: string,
  active: boolean,
}

export type PageProps = {
  page: Page
  Blocks: Record<string, React.FC<ComponentProps<any>>>
  setPageContext: React.Dispatch<React.SetStateAction<Page>>
}

export type ComponentProps<T> = {
  block: T,
  onUpdate: (args: T) => void,
  preview?: boolean
}