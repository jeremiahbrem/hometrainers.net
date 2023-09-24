import { Session } from "next-auth";

export type SessionType = Session & { idToken: string; error?: string }