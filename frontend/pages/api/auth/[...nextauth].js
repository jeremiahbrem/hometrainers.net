import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { googleJwtCallback, authJwtCallback } from  './handleJwt'
import { clientId, clientSecret } from './clientInfo'

const authServer = process.env.NEXT_PUBLIC_AUTH_SERVER
const redirectUri = process.env.NEXTAUTH_URL
const codeChallenge = process.env.NEXT_PUBLIC_CODE_CHALLENGE

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
    {
      id: 'auth',
      name: 'Auth',
      type: 'oauth',
      version: '2.0',
      scope: '',
      authorization: {
        url: process.env.NEXT_PUBLIC_LOGIN_URL,
        params: { grant_type: 'authorization_code' },
      },
      token: {
        url: `${authServer}/oauth/token`,
        async request(context) {
          const url =
          `${process.env.NEXT_PUBLIC_AUTH_SERVER}/oauth/token?` +
            new URLSearchParams({
              client_id: clientId,
              client_secret: clientSecret,
              grant_type: 'authorization_code',
              code: context.params.code,
              code_verifier: codeChallenge,
              redirect_uri: `${redirectUri}/api/auth/callback/auth`
            })
          
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          })
          const tokens = await response.json()
          return { tokens }
        }
      },
      params: { grant_type: 'authorization_code' },
      accessTokenUrl: `${authServer}/oauth/token`,
      requestTokenUrl: `${authServer}/oauth/token`,
      authorizationUrl: `${authServer}/oauth/authorize`,
      clientId,
      clientSecret,
      profileUrl: '',
      userinfo: {
        url: `${authServer}/user-info`
      },
      async profile(profile, _) {
        return profile
      },
    }
  ],
  callbacks: {
    async session({ session, token }) {
      session.idToken = token.idToken ?? session.idToken
      session.accessToken = token.accessToken
      session.refreshToken = token.refreshToken
      session.error = token.error
      session.provider = token.provider,
      session.user = { name: token.name, email: token.email }
      return session      
    },
    async jwt({ token, account }) {
      const provider = account?.provider ?? token.provider
 
      if (provider === 'google') {
        return googleJwtCallback(token, account)
      }

      if (provider === 'auth') {
        return await authJwtCallback(token, account)
      }

      return token
    },
    async redirect({ url, baseUrl }) {
      return url
    }
  },
})