"use client";

import { useState, useEffect } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [scrollY, setScrollY] = useState(0);

  function handleSubscribe() {
    if (!email) return;
    alert("Subscribed with " + email);
    setEmail("");
  }

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <footer className="w-full relative overflow-hidden">

      {/* Glow Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent opacity-80" />

      {/* BACKGROUND IMAGE SECTION */}
      <div
        className="relative border-t border-white/10 px-2 pt-10 pb-12 text-center bg-cover bg-center"
        style={{
          backgroundImage: "url('/galaxy-bg.jpg')",
          transform: `translateY(${scrollY * 0.02}px)`,
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="relative max-w-3xl mx-auto flex flex-col items-center gap-6">

          <h2
            className="text-2xl sm:text-3xl font-bold text-white drop-shadow-[0_0_12px_rgba(192,132,252,0.7)] animate-twinkle transition-transform duration-300 mb-0"
            style={{ transform: `translateY(${scrollY * 0.03}px)` }}
          >
            Let’s connect 
          </h2>

          <p
            className="text-gray-300 text-sm text-center transition-transform duration-300"
            style={{ transform: `translateY(${scrollY * 0.05}px)` }}
          >
            Stay updated with new features, announcements, and banana-powered energy
          </p>

          <div
            className="flex items-center w-full max-w-md gap-2 transition-transform duration-300"
            style={{ transform: `translateY(${scrollY * 0.06}px)` }}
          >
            <input
              type="email"
              placeholder="Type your e-mail here..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 text-sm outline-none rounded-full shadow-md bg-white/10 text-white placeholder-gray-400 border border-white/20 backdrop-blur-sm"
            />
            <button
              onClick={handleSubscribe}
              className="ml-4 relative border border-white/20 bg-white/5 text-white font-bold px-6 py-3 text-sm rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all duration-300"
            >
              Join
              <span className="absolute inset-0 rounded-full opacity-20 bg-white/20 animate-ping"></span>
            </button>
          </div>

          <p
            className="text-gray-400 text-xs mt-4 transition-transform duration-300"
            style={{ transform: `translateY(${scrollY * 0.04}px)` }}
          >
            © {new Date().getFullYear()} Banana Rush • All rights reserved
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 1; text-shadow: 0 0 3px #ededed, 0 0 12px #ee9ec6; }
          25% { opacity: 0.8; text-shadow: 0 0 2px #d6c5e7, 0 0 6px #dbc9d2; }
          50% { opacity: 0.6; text-shadow: 0 0 1px #dad7de, 0 0 10px #f3bdd5; }
          75% { opacity: 0.9; text-shadow: 0 0 1px #f5f0fb, 0 0 8px #ffc2e0; }
        }
        .animate-twinkle { animation: twinkle 2s infinite ease-in-out; }
      `}</style>

    </footer>
  );
}