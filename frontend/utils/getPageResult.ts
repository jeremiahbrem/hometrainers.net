import { Page } from "@/components/types";

export async function getPageResult(response: Response): Promise<Page> {
  const emptyPage: Page = {
    blocks: { blocks: [] },
    slug: '',
    email: '',
    title: '',
    city: '',
    active: false,
  }

  let page = emptyPage

  try {
    const result = await response.json()
    page = result?.slug && result?.email
      ? result
      : emptyPage
  }
  catch {}

  return page
}