"use client";

import { Mochiy_Pop_One, Outfit } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import picture from "../assets/Playboard.svg";
import { Button } from "@/components/Button";
import { FeatureSection } from "@/components/FeatureSection";
import { FaqSection } from "@/components/FaqSection";
import { Footer } from "@/components/Footer";
import { useRouter } from "next/navigation";
import axios from "axios";
import { http } from "@/components/endpoints";

const mochiy = Mochiy_Pop_One({
  weight: "400", 
  subsets: ["latin"],
  variable: "--font-mochiy",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "700"],
  variable: "--font-outfit", 
});

export default function Home() {
  const router = useRouter();

  const parent = {
    initial: { opacity: 1 },
    visible: {
      transition: {
        staggerChildren: 0.2,
      }
    }
  };

  const child = {
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 1
      }
    },
    initial: {
      y: 50,
      opacity: 0
    }
  };

  const startBoard = async () => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      try {
        const res = await axios.get(http + "/verify-token", {
          headers: {
            Authorization: token
          }
        });
        const id = res.data.userId;
        if (id) { 
          const Roomres = await axios.get(`${http}/userRooms/${id}`);
          const rooms = Roomres.data.data;
          if (rooms && rooms.length > 0) {
            const lastroom = rooms[rooms.length - 1];
            const roomidres = await axios.get(`${http}/room/${lastroom.slug}`);
            const roomid = roomidres.data.id;
            router.push(`/canvas/${roomid}`);
          } else {
            router.push("/Dashboard");
          }
        }
      } catch (e) {
        console.log(e);
        router.push("/Signin");
      }
    } else {
      router.push("/Signin");
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black text-white overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* Background grid lines & Ambient glow */}
      <div className="absolute top-[10vh] left-0 w-full h-[1px] bg-gray-300 opacity-10 z-0"></div>
      <div className="absolute left-[5vw] md:left-[15vw] w-[1px] h-full bg-gray-300 opacity-10 z-0"></div>
      <div className="absolute right-[5vw] md:right-[15vw] w-[1px] h-full bg-gray-300 opacity-10 z-0"></div>
      
      {/* Dynamic continuous background gradient */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-[#0d001f] via-[#090033] to-black"></div>

      {/* Main Content Wrapper */}
      <div className="w-full flex flex-col items-center ">
        
        {/* Navigation Bar */}
        <header className="w-full max-w-7xl px-4 mt-4 flex items-center justify-between z-20">
          <div className="w-[120px] drop-shadow-md">
            <h1 className={`${mochiy.className} text-2xl`}>Playboard</h1>
          </div>
          
          <nav className="w-[550px] hidden md:flex h-[45px] p-[2px] bg-gradient-to-b from-[#2300C3] to-[#02000A] rounded-full drop-shadow-lg">
            <div className="w-full h-full flex items-center justify-around px-5 rounded-full bg-[linear-gradient(0deg,#281191_-117.86%,#000000_130.36%)] text-sm font-medium">
              <Link href="/" className="hover:text-blue-400 hover:drop-shadow-[0_0_10px_rgba(0,115,255,0.9)] transition duration-300">Home</Link>
              <a href="#features" className="hover:text-blue-400 hover:drop-shadow-[0_0_10px_rgba(0,115,255,0.9)] transition duration-300">Features</a>
              <a href="#faq" className="hover:text-blue-400 hover:drop-shadow-[0_0_10px_rgba(0,115,255,0.9)] transition duration-300">FAQ</a>
              <Link href="/Dashboard" className="hover:text-blue-400 hover:drop-shadow-[0_0_10px_rgba(0,115,255,0.9)] transition duration-300">Dashboard</Link>
            </div>
          </nav>

          <div className="w-[100px] md:w-[135px]">
            <Link href="/Signup">
              <Button btnscale={true} btnsize="small" prop="blue" content="SignUp" />
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="w-full max-w-7xl px-4 pt-16 md:pt-24 pb-20 flex flex-col items-center text-center">
          <motion.div 
            variants={parent}
            initial="initial"
            animate="visible"
            className="flex flex-col items-center"
          >
            <motion.div className="flex flex-col items-center max-w-4xl">
              <motion.h1 
                variants={child} 
                className={`text-4xl sm:text-5xl md:text-6xl text-white ${outfit.className} font-bold leading-tight relative z-10 tracking-tight`}
              >
                Sketch, Share, and Build Together
              </motion.h1>
              <motion.h2 
                variants={child} 
                className={`${outfit.className} text-lg sm:text-xl md:text-2xl text-gray-300 mt-4 max-w-2xl font-light relative z-10`}
              >
                Collaborate live on the same canvas with anyone, anywhere.
              </motion.h2>
            </motion.div>

            <motion.div variants={child} className="mt-8 flex z-10 flex-col items-center">
              <Button btnscale={true} btnsize="medium" btnfunction={() => startBoard()} prop="pink" content="Start board" />
            </motion.div>

            <motion.div 
              variants={child}
              className="relative mt-12 w-full max-w-5xl px-2"
            >
              <Image 
                className="relative z-10 rounded-2xl border border-blue-500/30 shadow-2xl shadow-blue-600/20 mask-b-from-20% mask-b-to-80%" 
                alt="online sketchboard image" 
                src={picture} 
                priority 
              /> 
              <div className="absolute left-1/2 -translate-x-1/2 inset-0 w-[80%] h-[80%] bg-blue-600/30 blur-[150px] z-0 rounded-full"></div>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <FeatureSection />

        {/* FAQ Section */}
        <FaqSection />

        {/* Footer */}
        <Footer />
        
      </div>
    </div>
  );
}
