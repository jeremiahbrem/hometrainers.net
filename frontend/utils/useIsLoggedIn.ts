import { SessionType } from "@/components/header/types";
import { useSession } from "next-auth/react";

export function useIsLoggedIn() {
  const response = useSession()
  const data = response.data as SessionType | null
  return !!(data && !data.error)
}