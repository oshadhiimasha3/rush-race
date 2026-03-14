"use client"

import { useState } from "react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function login() {
    await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">Login</h1>
        
        <div className="space-y-4">
          <input
            className="w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:ring-2 focus:ring-blue-500"
            placeholder="Email"
            type="email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:ring-2 focus:ring-blue-500"
            placeholder="Password"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <button
            onClick={login}
            className="w-full rounded-full bg-blue-700 p-3 font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98]"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  )
}
