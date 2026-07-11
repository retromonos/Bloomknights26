import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: "http://localhost:3001"
})

export default function handleSignup(email: string, password: string, name: string) {
    authClient.signUp.email({email, password, name, callbackURL: "/"}, {
      onRequest: (ctx) => {
        console.log("Requesting signup with email and password...", ctx)
        // show loading
      },
      onSuccess: (ctx) => {
        console.log("Successfully signed up!", ctx)
        // redirect to the dashboard or sign in page
      },
      onError: (ctx) => {
        // display the error message
        alert(ctx.error.message);
      },
    })
}