import { createFileRoute } from '@tanstack/react-router'
import handleSignup, { authClient } from '#/lib/auth'
import { useState } from 'react'

export const Route = createFileRoute('/')({ component: App })

function App() {

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <h1>Welcome to the App</h1>
      <form>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button type="button" className='cursor-pointer' onClick={() => handleSignup(email, password, name)}>Sign Up</button>
      </form>
    </main>
  )
}
