import React from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Session } from 'next-auth'

type SessionType = Session & { idToken: string }

export default function AuthTest(){
  const response = useSession()
  const data = response.data as SessionType | null
 
  const checkId = async () => {
    await fetch(`http://localhost:8080/auth-check`, {
      method: 'POST',
      body: JSON.stringify({
        token: data?.idToken
      }),
      headers: {
        'Authorization': `Bearer ${data?.idToken}`,
      }
    })
  }

  if (data) {
    return (
      <>
        <p className='.signed-in'>Signed in as {data.user?.email ?? ''}</p> <br />
        <button onClick={() => signOut()}>Sign out</button>
        <button onClick={checkId}>check id</button>
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