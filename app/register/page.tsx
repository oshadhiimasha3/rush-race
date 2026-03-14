"use client"

import {useState} from "react"

export default function Register(){

const[username,setUsername]=useState("")
const[email,setEmail]=useState("")
const[password,setPassword]=useState("")

async function register(){

await fetch("/api/auth/register",{

method:"POST",
body:JSON.stringify({username,email,password})

})

}

return(

<div className="container">

<h1>Register</h1>

<input placeholder="Username"
onChange={(e)=>setUsername(e.target.value)}/>

<input placeholder="Email"
onChange={(e)=>setEmail(e.target.value)}/>

<input placeholder="Password"
type="password"
onChange={(e)=>setPassword(e.target.value)}/>

<button onClick={register}>Register</button>

</div>

)

}