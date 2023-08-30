import React, { useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Session } from 'next-auth'

type SessionType = Session & { idToken: string; error?: string }

export default function AuthTest(){
  const response = useSession()
  const data = response.data as SessionType | null
  console.log(data)
 
  const checkId = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth-check`, {
      method: 'POST',
      body: JSON.stringify({
        token: data?.idToken
      }),
      headers: {
        'Authorization': `Bearer ${data?.idToken}`,
      }
    })
  }

  useEffect(() => {
    const timer = setInterval(() => {
      if (data) {
        response.update()
      }
    }, 5000)
    return (() => { clearInterval(timer) })
  }, [data])

  if (data && !data.error) {
    return (
      <>
        <p className='.signed-in'>Signed in as {data.user?.email ?? ''}</p> <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    )
  }
  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn('google')}>Sign in</button>
      <button onClick={() => signIn('auth')}>Sign in auth</button>
    </>
  )
}