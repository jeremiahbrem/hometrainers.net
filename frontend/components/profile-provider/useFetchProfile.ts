import { useFetchWithAuth } from "@/utils/useFetchWithAuth";
import { Profile } from "./types";
import { useState } from "react";
import { useRouter } from "next/navigation";

type FetchProfileReturn = {
  loading: boolean
  fetchProfile: () => Promise<void>
}

export function useFetchProfile(
  updateProfile: (profile: Profile | null) => void
): FetchProfileReturn {
  const fetchWithAuth = useFetchWithAuth()
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  const fetchProfile = async () => {
    setLoading(true)

    const response = await fetchWithAuth({
      method: 'GET',
      path: '/profile'
    })

    setLoading(false)

    let profile: Profile | null = null

    try {
      const result = await response.json()
      profile = result?.email ? result : null
    }
    finally {
      updateProfile(profile)
    }

    if (!profile) {
      router.push('/profiles')
    }
  }

  return { fetchProfile, loading }
}