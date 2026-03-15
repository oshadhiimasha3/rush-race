"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {

  const router = useRouter()

  const [username,setUsername] = useState("")
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [error,setError] = useState("")
  const [loading,setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {

    e.preventDefault()
    setLoading(true)
    setError("")

    try{

      const res = await fetch("/api/auth/register",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          username,
          email,
          password
        })
      })

      const data = await res.json()

      if(!res.ok){
        setError(data.error || "Registration failed")
        setLoading(false)
        return
      }

      alert("Registration successful!")

      router.push("/login")

    }catch(err){

      setError("Something went wrong")

    }

    setLoading(false)

  }

  return(

    <div className="flex justify-center items-center h-screen">

      <form
        onSubmit={handleRegister}
        className="flex flex-col gap-4 p-8 border rounded-lg w-96"
      >

        <h1 className="text-2xl font-bold text-center">
          Register
        </h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
          className="border p-2 rounded"
        />

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
          className="bg-blue-500 text-white p-2 rounded"
        >

          {loading ? "Creating..." : "Register"}

        </button>

      </form>

    </div>

  )
}
