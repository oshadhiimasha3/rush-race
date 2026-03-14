import Navbar from "../../components/Navbar"
import GameBoard from "../../components/GameBoard"

export default function Play(){

return(

<div className="min-h-screen bg-gradient-to-br from-purple-900 to-black text-white">

<Navbar/>

<div className="flex flex-col items-center justify-center mt-10">

<h1 className="text-4xl font-bold mb-6">Rush Race Arena 🎮</h1>

<GameBoard/>

</div>

</div>

)

}