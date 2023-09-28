import { API } from "@/api"
import { SessionType } from "@/components/header/types"
import { useSession } from "next-auth/react"

type FetchWithAuthArgs = {
  path: string
  method: 'POST' | 'GET'
  body?: string
}

export function useFetchWithAuth(): (args: FetchWithAuthArgs) => Promise<Response> {
  const session = useSession()

  return async (args: FetchWithAuthArgs) => {
    const { path, method, body } = args

    const data = session.data as SessionType | null

    const token = data?.provider === 'google'
      ? data?.idToken
      : data?.accessToken

    const result = await fetch(`${API}${path}`, {
      method,
      headers: {
        authorization: `Bearer ${token ?? ''}`,
        "token-provider": data?.provider ?? ''
      },
      body
    })

    return result
  }
}