"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "../../components/Navbar"

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

    <div className="flex justify-center items-center h-screen bg-yellow-100">

      <form
        onSubmit={handleLogin}
        className="
          flex flex-col gap-5 
          p-15 
          bg-white 
          shadow-xl 
          rounded-2xl 
          w-[430px] 
          border border-yellow-300

          transition-all duration-300 ease-in-out
          hover:shadow-yellow-300/50 
          hover:shadow-2xl 
          hover:scale-[1.02]
          hover:border-yellow-400
        "
      >

        <h1 className="text-3xl font-bold text-center text-yellow-500">
          🍌 Banana Rush
        </h1>

        <p className="text-center text-gray-500 text-sm">
          Welcome back
        </p>

        {/* email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        {/* password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        {/* error */}
        {error && (
          <p className="text-red-500 text-sm text-center">
            {error}
          </p>
        )}

        {/* button */}
        
        <button
          type="submit"
          className="
            bg-yellow-400 hover:bg-yellow-500 
            transition text-white 
            w-60 py-2 
            rounded-full 
            font-semibold 
            self-center
          "     
>
  {loading ? "Logging in..." : "Login"}
</button>

        {/* go to register */}
        <p className="text-sm text-center text-gray-600">
          Don’t have an account?{" "}
          <span
            onClick={()=>router.push("/register")}
            className="text-yellow-500 cursor-pointer font-semibold"
          >
            Register
          </span>
        </p>

      </form>

    </div>

  )
}
