import Navbar from "../components/Navbar"
import Link from "next/link"
import Footer from "../components/Footer"

export default function Home(){

return(

<div className="min-h-screen flex flex-col bg-gradient-to-br from-yellow-400 via-orange-500 to-purple-800 text-white">

<Navbar/>

{/* HERO SECTION */}

<div className="flex flex-col items-center justify-center text-center mt-24 px-6">

<h1 className="text-6xl font-extrabold mb-6 drop-shadow-lg">
🍌 RUSH RACE
</h1>

<p className="text-xl max-w-2xl mb-8">
Solve puzzles as fast as possible, earn points, and climb the global leaderboard.
Only the fastest minds win the race!
</p>

<Link href="/login">
<button className="bg-white text-purple-700 font-bold px-8 py-4 rounded-xl text-lg hover:scale-105 transition shadow-xl">
Start Game 🚀
</button>
</Link>

</div>


{/* FEATURES SECTION */}

<div className="grid md:grid-cols-3 gap-8 mt-32 px-10 pb-20">

<div className="bg-white/20 backdrop-blur-md p-6 rounded-xl text-center shadow-lg">
<h3 className="text-2xl font-bold mb-3">⚡ Fast Puzzles</h3>
<p>
Solve exciting number puzzles and test how quickly your brain can work under pressure.
</p>
</div>

<div className="bg-white/20 backdrop-blur-md p-6 rounded-xl text-center shadow-lg">
<h3 className="text-2xl font-bold mb-3">🏆 Leaderboard</h3>
<p>
Compete with other players and see who can reach the highest score.
</p>
</div>

<div className="bg-white/20 backdrop-blur-md p-6 rounded-xl text-center shadow-lg">
<h3 className="text-2xl font-bold mb-3">🎯 Challenge Yourself</h3>
<p>
Each puzzle is different. Stay focused and improve your speed and accuracy.
</p>
</div>

</div>

{/* Push footer to bottom */}
<div className="mt-auto">
  <Footer/>
</div>

</div>

)

}