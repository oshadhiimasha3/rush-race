"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"


export default function RegisterPage() {

  const router = useRouter()

  const [username,setUsername] = useState("")
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [confirmPassword,setConfirmPassword] = useState("")
  const [error,setError] = useState("")
  const [loading,setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {  //runs when user clicks Register

    e.preventDefault()
    setLoading(true)
    setError("")

    // email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|net|org|edu)$/i
    if(!emailRegex.test(email)){
      setError("Enter a valid email (example@gmail.com)")
      setLoading(false)
      return
    }

    // password validation
    const passwordRegex = /^[A-Za-z0-9]{8,}$/
    const hasNumber = /\d/

    if(!passwordRegex.test(password)){
      setError("Password must be at least 8 characters and no symbols")
      setLoading(false)
      return
    }

    if(!hasNumber.test(password)){
      setError("Password must include at least 1 number")
      setLoading(false)
      return
    }

    // confirm password
    if(password !== confirmPassword){
      setError("Passwords do not match")
      setLoading(false)
      return
    }

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

    <div className="flex justify-center items-center h-screen bg-yellow-100">

      <form
        onSubmit={handleRegister}
        className="
          flex flex-col gap-5 
          p-10 
          bg-white 
          shadow-xl 
          rounded-2xl 
          w-[420px] 
          border border-yellow-300

          transition-all duration-300 ease-in-out
          hover:shadow-yellow-300/50 
          hover:shadow-2xl 
          hover:scale-[1.02]
          hover:border-yellow-400
        "
      >

        
        <h1 className="text-3xl font-bold text-center text-yellow-500">
          🍌 RUSH RACE
        </h1>

        <p className="text-center text-gray-500 text-sm">
          Create your account
        </p>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
          className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e)=>setConfirmPassword(e.target.value)}
          className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        {error && (
          <p className="text-red-500 text-sm text-center">
            {error}
          </p>
        )}

        {/* Register Button Design*/}
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
          {loading ? "Creating..." : "Register"}
        </button>

        <p className="text-sm text-center text-gray-600">
          Already have an account?{" "}
          <span
            onClick={()=>router.push("/login")}
            className="text-yellow-500 cursor-pointer font-semibold"
          >
            Login
          </span>
        </p>

      </form>

    </div>
  )
}