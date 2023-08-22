import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { googleJwtCallback, authJwtCallback } from  './handleJwt'

const authServer = process.env.NEXT_PUBLIC_AUTH_SERVER
const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI

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
          const details = {
            grant_type: 'authorization_code',
            code: context.params.code,
            code_verifier: 's256example',
            redirect_uri: `${redirectUri}/api/auth/callback/auth`
          }

          var formBody = [];
          for (const property in details) {
            var encodedKey = encodeURIComponent(property)
            var encodedValue = encodeURIComponent(details[property])
            formBody.push(encodedKey + '=' + encodedValue)
          }
          formBody = formBody.join('&')
          
          const response = await fetch(`${authServer}/oauth/token`, {
            method: 'POST',
            body: formBody,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': 'Basic MjIyMjIyOjIyMjIyMjIy'
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
      clientId: '222222',
      clientSecret: '22222222',
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
      session.idToken = token.idToken
      session.accessToken = token.accessToken
      session.user = { name: token.name, email: token.email }
      return session      
    },
    async jwt({ token, account }) {
      const provider = account?.provider ?? token.provider

      if (provider === 'google') {
        return googleJwtCallback(token, account)
      }

      if (provider === 'auth') {
        return authJwtCallback(token, account)
      }

      return token
    },
  },
})