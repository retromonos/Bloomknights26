import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: "http://localhost:3001"
})

export default function handleSignup(email: string, password: string, name: string) {
  return authClient.signUp.email({ email, password, name, callbackURL: "/onboarding/location" })
}
