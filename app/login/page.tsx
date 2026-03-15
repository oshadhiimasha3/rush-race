<<<<<<< Updated upstream
=======
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {

  const router = useRouter()

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [error,setError] = useState("")
  const [loading,setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {

    e.preventDefault()

    setLoading(true)
    setError("")

    try {

      const res = await fetch("/api/auth/login", {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      const data = await res.json()

      // error cases
      if(!res.ok){

        if(data.error === "Invalid user"){
          setError("Invalid user")
        }
        else if(data.error === "Invalid credentials. Please check again"){
          setError("Invalid credentials. Please check again")
        }
        else{
          setError("Login failed")
        }

        setLoading(false)
        return
      }

      // success case
      alert("Login successful")

      router.replace("/play")

    } catch {

      setError("Something went wrong")

    }

    setLoading(false)

  }

  return (

    <div className="flex justify-center items-center h-screen">

      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-4 p-8 border rounded-lg w-96"
      >

        <h1 className="text-2xl font-bold text-center">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          className="border p-2 rounded"
        />

        {error && (
          <p className="text-red-500 text-sm">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="bg-green-500 text-white p-2 rounded"
        >

          {loading ? "Logging in..." : "Login"}

        </button>

      </form>

    </div>

  )

}
>>>>>>> Stashed changes
