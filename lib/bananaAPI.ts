// Import the Axios library to make HTTP requests
import axios from "axios";

// Define an async function to fetch puzzle data based on the stage
export async function getPuzzle(stage: number) {

  // Send a GET request to the external Banana API
  const res = await axios.get("https://marcconrad.com/uob/banana/api.php");
  return res.data;
}