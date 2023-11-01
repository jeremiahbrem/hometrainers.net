export type Block = Record<string, any> & {
  blockName: string
  blockId: string
  anchors?: string[]
}

export type Page = {
  blocks: { blocks: Block[] },
  slug: string,
  email: string,
  title: string,
  description: string,
  active: boolean,
  images: string[]
}

export type PageProps = {
  page: Page
  Blocks: Record<string, React.FC<ComponentProps<any>>>
  setPageContext: React.Dispatch<React.SetStateAction<Page>>
}

export type ComponentProps<T> = {
  block: T,
  onUpdate: (args: T) => void,
  addImage: (img: string) => void,
  removeImage: (img: string) => void,
  blocks: Block[]
  preview?: boolean
}

export type HeaderLink = { label: string, blockId: string }