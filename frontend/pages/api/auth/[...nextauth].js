import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.idToken = token.idToken
      session.user = { name: token.name, email: token.email }
      return session      
    },
    async jwt({ token, account }) {
      if (account.provider === 'google') {
        return googleJwtCallback(token, account)
      }

      return token
    }
  },
})