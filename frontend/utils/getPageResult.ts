import { Page } from "@/components/types";

export async function getPageResult(response: Response): Promise<Page> {
  const emptyPage: Page = {
    blocks: { blocks: [] },
    slug: '',
    email: '',
    title: '',
    description: '',
    active: false,
    images: []
  }

  let page = emptyPage

  try {
    const result = await response.json()
    page = result?.slug != null && result?.slug != undefined
      ? result
      : emptyPage
  }
  catch {}

  return page
}