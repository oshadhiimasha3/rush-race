"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [error,setError] = useState("")
  const [loading,setLoading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/login", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()

      if(!res.ok){
        if(data.error === "Invalid user") setError("Invalid user")
        else if(data.error === "Invalid credentials. Please check again") setError("Invalid credentials. Please check again")
        else setError("Login failed")
        setLoading(false)
        return
      }

      alert("Login successful")
      router.replace("/game-map")

    } catch {
      setError("Something went wrong")
    }

    setLoading(false)
  }

  // Stars background
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
    if (!ctx) return

    let width = canvas.width = window.innerWidth
    let height = canvas.height = window.innerHeight

    const stars = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.6 + 0.3,
      pulseSpeed: Math.random() * 0.02 + 0.005,
      delta: Math.random()
    }))

    function animate() {
      ctx.clearRect(0, 0, width, height)
      stars.forEach(star => {
        star.delta += star.pulseSpeed
        const alpha = 0.4 + Math.sin(star.delta) * 0.4
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${alpha})`
        ctx.shadowColor = "white"
        ctx.shadowBlur = 8
        ctx.fill()
      })
      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="relative w-screen h-screen bg-[#01061c] overflow-hidden flex items-center justify-center">

      {/* Star Canvas */}
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none" />

      {/* Glassy Card with premium live hover effect */}
        <div className="
            relative z-10 flex w-[90%] max-w-5xl h-[80%] 
            bg-white/5 backdrop-blur-lg 
            border border-purple-300/30 rounded-3xl 
            shadow-[0_0_40px_rgba(192,132,252,0.3),0_0_80px_rgba(192,132,252,0.2)] 
            overflow-hidden
            transition-all duration-500
            hover:scale-[1.015] 
            hover:shadow-[0_0_60px_rgba(192,132,252,0.5),0_0_100px_rgba(192,132,252,0.4)]
            hover:border-purple-300/60
          ">
            
        {/* Left Side - Only Image */}
        <div className="w-1/2 h-full relative">
          <img 
            src="/images/login-left.png" 
            alt="Rush Race Illustration" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Transparent White Glowing Divider */}
        <div className="relative w-[2px] mx-0 flex justify-center">
          <div className="absolute top-0 w-[1px] h-full bg-white/18 rounded shadow-[0_0_15px_rgba(255,255,255,0.7)] animate-pulse-slow"></div>
        </div>

        {/* Right Side */}
        <div className="w-1/2 flex flex-col items-center justify-center p-10 gap-6 relative overflow-hidden">

          {/* Heading + Text */}
          <div className="flex flex-col items-center animate-pulse-slow mb-7">
            <h1 className="text-5xl font-bold text-white drop-shadow-lg">
              RUSH RACE
            </h1>
            <p className="mt-4 text-yellow-200 text-m text-center">
              Race through 9 puzzles and reach the finish line!
            </p>
          </div>

          {/* Form */}
          <form className="flex flex-col w-full gap-4" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              className="w-full border border-white/40 p-2 rounded focus:outline-none focus:ring-2 focus:ring-white bg-transparent text-white placeholder:text-gray-400"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              className="w-full border border-white/40 p-2 rounded focus:outline-none focus:ring-2 focus:ring-white bg-transparent text-white placeholder:text-gray-400"
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            {/* Glowing Login Button */}
            <button
              type="submit"
              className="relative flex items-center justify-center border border-white/20 bg-white/5 text-white font-bold px-12 py-4 rounded-full text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] transition-all duration-300 mt-2"
            >
              {loading ? "Logging in..." : "Login"}
              <span className="absolute inset-0 rounded-full opacity-20 bg-white/20 animate-ping"></span>
            </button>
          </form>

          
          {/* Register Link */}
<p className="text-sm text-center text-gray-400 mt-2">
  Don’t have an account?{" "}
  <span
    onClick={()=>router.push("/register")}
    className="text-yellow-200 cursor-pointer font-semibold hover:underline"
  >
    Register
  </span>
</p>

        </div>

      </div>

    </div>
  )
}