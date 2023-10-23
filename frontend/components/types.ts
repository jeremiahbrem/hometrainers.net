export type Block = Record<string, any> & {
  blockName: string
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
  blockNames: string[]
  preview?: boolean
}

export type HeaderLink = { label: string, index: number }

export type BlockHeaderProps = ComponentProps<{
  text: string
  logo: string
  links: HeaderLink[]
  color: string
  font: string
  background: string
}>

export type BlockFooterProps = ComponentProps<{
  links: HeaderLink[]
  color: string
  font: string
  background: string
}>