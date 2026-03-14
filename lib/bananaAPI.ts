import axios from "axios";

export async function getPuzzle() {
  const res = await axios.get("https://marcconrad.com/uob/banana/api.php");
  return res.data;
}