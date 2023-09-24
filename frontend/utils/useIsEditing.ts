import { SessionType } from "@/components/header/types";
import { useSession } from "next-auth/react";
import { usePathname } from 'next/navigation'

export function useIsEditing() {
  const response = useSession()
  const data = response.data as SessionType | null
  const isLoggedIn = !!(data && !data.error)

  const path = usePathname()
  return path.includes('my-page') && isLoggedIn
}