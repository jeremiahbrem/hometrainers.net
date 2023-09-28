export type Block = {
  blockName: string
}

export type Page = {
  blocks: { blocks: Block[] },
  slug: string,
  email: string,
  title: string,
  city: string,
  active: boolean,
}

export type PageProps = {
  page: Page
  Blocks: Record<string, React.FC<ComponentProps<any>>>
}

export type ComponentProps<T> = {
  block: T,
  onUpdate: (args: T) => void
}