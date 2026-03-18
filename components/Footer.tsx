"use client";

import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");

  function handleSubscribe() {
    if (!email) return;
    alert("Subscribed with " + email);
    setEmail("");
  }

  return (
    <footer className="w-full mt-16">

      {/* Glow Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-80" />

      <div className="bg-gradient-to-r from-yellow-300 via-yellow-100 to-orange-200 backdrop-blur-md border-t border-yellow-300 px-6 py-12 text-center">

        <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Let’s connect!
          </h2>

          <p className="text-gray-600 text-sm text-center">
            Stay updated with new features, announcements, and banana-powered energy 
          </p>

          {/* Input + Button */}
          <div className="flex items-center w-full max-w-md gap-2">
            <input
              type="email"
              placeholder="Type your e-mail here..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 text-sm outline-none rounded-full shadow-md bg-white"
            />
            <button
              onClick={handleSubscribe}
              className="bg-yellow-400 hover:bg-yellow-500 px-6 py-3 text-sm font-bold transition rounded-full"
            >
              Join
            </button>
          </div>

          {/* Footer Bottom */}
          <p className="text-gray-500 text-xs mt-4">
            © {new Date().getFullYear()} Banana Rush • All rights reserved
          </p>

        </div>
      </div>
    </footer>
  );
}