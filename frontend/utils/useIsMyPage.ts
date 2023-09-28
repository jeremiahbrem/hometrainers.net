import { usePathname } from 'next/navigation'

export function useIsMyPage() {
  const path = usePathname()
  return path && path.includes('my-page')
}