"use client"

import { useState } from "react"

export default function Register() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function register() {
    await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password })
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl ring-1 ring-slate-200">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create account</h1>
          <p className="mt-2 text-sm text-slate-600">Start your journey with us today.</p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Username</label>
            <input
              className="block w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="johndoe"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Email address</label>
            <input
              className="block w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="name@company.com"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input
              className="block w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="••••••••"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            onClick={register}
            className="group relative flex w-full justify-center rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Create Account
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          By registering, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  )
}
