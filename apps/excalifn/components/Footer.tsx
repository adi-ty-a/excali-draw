"use client";

import Link from "next/link";
import { Mochiy_Pop_One } from "next/font/google";
import { FaGithub } from "react-icons/fa";
import { SlSocialTwitter } from "react-icons/sl";
import { TbBrandLinkedin } from "react-icons/tb";
import { HiOutlineSparkles } from "react-icons/hi2";

const mochiy = Mochiy_Pop_One({
  weight: "400", 
  subsets: ["latin"],
  variable: "--font-mochiy",
});

export function Footer() {
  return (
    <footer className="w-full bg-gradient-to-b from-[#0d0042] via-[#060021] to-black border-t border-blue-600/20 relative z-10 pt-16 pb-12">
      {/* Decorative top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-20 bg-blue-600/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <h2 className={`${mochiy.className} text-2xl md:text-3xl text-white drop-shadow-[0_0_15px_rgba(0,115,255,0.6)]`}>
                Playboard
              </h2>
            </Link>
            <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
              The real-time collaborative digital whiteboard designed for teams to sketch, design, and share ideas effortlessly.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-emerald-400">WebSocket Services Operational</span>
            </div>
          </div>

          {/* Column 1: Navigation */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Navigation</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/Dashboard" className="hover:text-blue-400 transition-colors">Dashboard</Link>
              </li>
              <li>
                <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
              </li>
              <li>
                <a href="#faq" className="hover:text-blue-400 transition-colors">FAQ</a>
              </li>
              <li>
                <Link href="/Signup" className="hover:text-blue-400 transition-colors">Sign Up</Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Capabilities */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Features</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li className="flex items-center gap-1.5">
                <HiOutlineSparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Infinite Whiteboard</span>
              </li>
              <li className="flex items-center gap-1.5">
                <HiOutlineSparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Multiplayer Sync</span>
              </li>
              <li className="flex items-center gap-1.5">
                <HiOutlineSparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>Shape & Pen Suite</span>
              </li>
              <li className="flex items-center gap-1.5">
                <HiOutlineSparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Instant Link Join</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Connect & Social */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Connect</h3>
            <p className="text-xs text-gray-400 mb-4">Follow updates and contribute to open-source development.</p>
            <div className="flex items-center gap-4">
              <Link 
                href="https://github.com/adi-ty-a" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-800/50 flex items-center justify-center text-gray-300 hover:text-white hover:border-blue-400 hover:bg-blue-900/60 transition-all duration-300 shadow-md"
                aria-label="GitHub"
              >
                <FaGithub className="w-5 h-5" />
              </Link>
              <Link 
                href="https://x.com/avi_0t" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-800/50 flex items-center justify-center text-gray-300 hover:text-white hover:border-blue-400 hover:bg-blue-900/60 transition-all duration-300 shadow-md"
                aria-label="Twitter"
              >
                <SlSocialTwitter className="w-5 h-5" />
              </Link>
              <Link 
                href="https://www.linkedin.com/in/aditya-srivastava-662829317/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-800/50 flex items-center justify-center text-gray-300 hover:text-white hover:border-blue-400 hover:bg-blue-900/60 transition-all duration-300 shadow-md"
                aria-label="LinkedIn"
              >
                <TbBrandLinkedin className="w-5 h-5" />
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Playboard. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Designed & Developed by <span className="text-gray-300 font-medium hover:text-blue-400 transition-colors">Avi</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
