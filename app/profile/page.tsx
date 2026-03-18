"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"; // import Footer

// type for user data coming from backend
type UserType = {
  username: string;
  email: string;
  stats?: {
    totalScore?: number;
    gamesPlayed?: number;
    highestScore?: number;
    correctAnswers?: number;
  };
};

export default function ProfilePage() {

  // store user data
  const [user, setUser] = useState<UserType | null>(null);

  // loading state while fetching data
  const [loading, setLoading] = useState(true);

  // error message if something goes wrong
  const [error, setError] = useState("");

  useEffect(() => {

    // function to fetch user from API
    async function fetchUser() {
      try {

        // call backend API
        const res = await fetch("/api/auth/me");

        // if response not ok → throw error
        if (!res.ok) {
          throw new Error("Failed to fetch user");
        }

        // convert response to JSON
        const data = await res.json();

        // save user data to state
        setUser(data);

      } catch (err) {

        // if anything fails, log + show error
        console.log("Failed to load user");
        setError("Unable to load profile");

      } finally {

        // stop loading no matter what
        setLoading(false);
      }
    }

    // run this when page loads
    fetchUser();

  }, []);

  // generate avatar based on username
  const getAvatar = (username: string) =>
    `https://api.dicebear.com/7.x/pixel-art/png?seed=${username}`;

  return (
    // top-level container with flex-col so Footer can stick to bottom
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-yellow-100 to-yellow-200 text-gray-900">

      {/* Main content grows to push Footer down */}
      <div className="flex-1 flex flex-col">

        {/* top navbar */}
        <Navbar />

        <div className="flex flex-col items-center py-10 px-4">

          {/* page title */}
          <h1 className="text-4xl font-extrabold text-yellow-600 mb-10">
            My Profile
          </h1>

          {/* show loading text while fetching */}
          {loading && (
            <p className="text-gray-600">Loading...</p>
          )}

          {/* show error if something went wrong */}
          {!loading && error && (
            <p className="text-red-500">{error}</p>
          )}

          {/* show profile only when data is ready */}
          {!loading && user && (

            <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6">

              {/* ================= USER INFO BOX ================= */}
              <div className="flex-1 bg-yellow-50/70 backdrop-blur-md rounded-3xl shadow-xl border border-yellow-200 p-6 flex flex-col items-center justify-center
              transition-all duration-300 hover:shadow-yellow-400/40 hover:scale-105">

                {/* profile avatar */}
                <img
                  src={getAvatar(user.username || "user")} // fallback if no username
                  className="w-24 h-24 rounded-full border-4 border-yellow-400 shadow-lg mb-4"
                />

                {/* username with label, added extra top margin */}
                <h2 className="text-xl font-bold text-[#8B5E3C] mt-4 mb-1">
                  Username: {user.username || "Unknown User"}
                </h2>

                {/* email with label */}
                <p className="text-gray-600">
                  Email: {user.email || "No email"}
                </p>

              </div>

              {/* ================= STATS BOX ================= */}
              <div className="flex-1 bg-yellow-50/70 backdrop-blur-md rounded-3xl shadow-xl border border-yellow-200 p-11
                              transition-all duration-300 hover:shadow-yellow-400/40 hover:scale-105">

                <h2 className="text-2xl font-bold text-yellow-600 mb-7 text-center">
                  Game Stats
                </h2>

                <div className="space-y-4">

                  {/* total score */}
                  <div className="flex justify-between bg-gradient-to-r from-yellow-200/70 to-yellow-300/70 px-4 py-3 rounded-xl
                                  transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-yellow-300/40 cursor-pointer">
                    <span>Total Score</span>
                    <span className="font-bold">
                      {user.stats?.totalScore ?? 0}
                    </span>
                  </div>

                  {/* games played */}
                  <div className="flex justify-between bg-gradient-to-r from-yellow-200/70 to-yellow-300/70 px-4 py-3 rounded-xl
                                  transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-yellow-300/40 cursor-pointer">
                    <span>Games Played</span>
                    <span className="font-bold">
                      {user.stats?.gamesPlayed ?? 0}
                    </span>
                  </div>

                  {/* highest score */}
                  <div className="flex justify-between bg-gradient-to-r from-yellow-200/70 to-yellow-300/70 px-4 py-3 rounded-xl
                                  transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-yellow-300/40 cursor-pointer">
                    <span>Highest Score</span>
                    <span className="font-bold">
                      {user.stats?.highestScore ?? 0}
                    </span>
                  </div>

                  {/* correct answers */}
                  <div className="flex justify-between bg-gradient-to-r from-yellow-200/70 to-yellow-300/70 px-4 py-3 rounded-xl
                                  transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-yellow-300/40 cursor-pointer">
                    <span>Correct Answers</span>
                    <span className="font-bold">
                      {user.stats?.correctAnswers ?? 0}
                    </span>
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>
      </div>

      {/* Footer always at bottom */}
      <Footer />
    </div>
  );
}