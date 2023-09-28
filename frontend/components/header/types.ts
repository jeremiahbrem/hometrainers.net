import { Session } from "next-auth";

export type SessionType = Session & {
  idToken: string
  accessToken: string
  refreshToken: string
  provider: string
  user: { name: string, email: string}
  error?: string
}
