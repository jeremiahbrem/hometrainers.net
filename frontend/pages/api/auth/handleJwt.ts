import { Account } from "next-auth"

type Token = {
  refreshToken: string
  accessToken: string
  idToken: string
  accessTokenExpires: number
  provider: string
}

async function refreshGoogleToken(token: Token) {
  try {
    const url =
      "https://oauth2.googleapis.com/token?" +
      new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        client_secret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      } as Record<string, string>)

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    })

    const refreshedTokens = await response.json()

    if (!response.ok) {
      throw refreshedTokens
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      idToken: refreshedTokens.idToken,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken
    }
  } catch (error) {
    console.log(error)

    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

async function refreshAuthToken(token: Token) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/refresh`, {
      headers: {
        "Authorization": `Bearer ${btoa(JSON.stringify(token))}`,
      },
      method: "GET",
    })

    const refreshedTokens = await response.json()

    if (!response.ok) {
      throw refreshedTokens
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      idToken: '',
      accessTokenExpires: Date.now() + refreshedTokens.expires_at * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken
    }
  } catch (error) {
    console.log(error)

    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

export function googleJwtCallback(token: Token, account: Account) {
  if (account) {
    token.idToken = account.id_token as string
    token.refreshToken = account.refresh_token as string
    token.accessTokenExpires = Date.now() + (account.expires_in as number) * 1000
    token.provider = account.provider
  }

  if (Date.now() < token.accessTokenExpires) {
    return token
  }

  return refreshGoogleToken(token)
}

export function authJwtCallback(token: Token, account: Account) {
  if (account) {
    token.accessToken = account.access_token as string
    token.refreshToken = account.refresh_token as string
    token.accessTokenExpires = Date.now() + (account.expires_at as number) * 1000
    token.provider = account.provider
  }

  if (Date.now() < token.accessTokenExpires) {
    return token
  }

  return refreshAuthToken(token)
}