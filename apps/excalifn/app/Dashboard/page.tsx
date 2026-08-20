"use client";

import { Card } from "@/components/Cards";
import { http } from "@/components/endpoints";
import axios from "axios";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { Mochiy_Pop_One, Outfit } from "next/font/google";
import Link from "next/link";
import { motion } from "motion/react";
import {
  HiOutlinePencilSquare,
  HiOutlineArrowLeftOnRectangle,
  HiOutlinePlus,
  HiOutlineArrowRight,
  HiOutlineFolderOpen
} from "react-icons/hi2";

const mochiy = Mochiy_Pop_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mochiy",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "500", "700"],
  variable: "--font-outfit",
});

export default function Dashboard() {
  const [input, setinput] = useState("");
  const router = useRouter();
  const [disable, setdisable] = useState(false);
  const [loading, setloading] = useState(true);
  const [rooms, setrooms] = useState<null | { slug: string }[]>(null);
  const [userid, setuserid] = useState<number | null>(null);
  const [newerror, seterror] = useState<null | string>(null);

  useEffect(() => {
    const checkauth = async () => {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        router.push('/Signin');
        return;
      }
      try {
        const res = await axios.get(http + "/verify-token", {
          headers: { Authorization: token },
        });
        const resid = res.data.userId;
        setuserid(resid);
        setloading(false);
        if (resid !== null) {
          const roomres = await axios.get(`${http}/userRooms/${resid}`);
          if (roomres) {
            setrooms(roomres.data.data);
          }
        }
      } catch (e) {
        localStorage.removeItem("jwtToken");
        router.push("/");
        console.log(e);
      }
    };
    checkauth();
  }, [router]);

  const Createroom = async () => {
    if (!input.trim()) {
      seterror("Please enter a room name");
      return;
    }
    seterror(null);
    setdisable(true);
    try {
      const slugifiedInput = input.trim().replace(/\s+/g, "-");
      const response = await axios.post(http + "/create-room", {
        name: slugifiedInput
      }, {
        headers: {
          Authorization: localStorage.getItem("jwtToken")
        }
      });
      if (response.status === 200) {
        if (response.data.status == false) {
          setdisable(false);
          seterror("enter a unique RoomName");
          return
        }
        setdisable(false);
        router.push(`/canvas/${response.data}`);
      }
    } catch (e) {
      setdisable(false);
      if (axios.isAxiosError(e)) {
        seterror(e.response?.data?.msg || "Failed to create room");
      } else {
        console.error(e);
      }
    }
  };

  const Joinroom = async (value?: string) => {
    const targetRoom = value !== undefined ? value : input.trim();
    if (!targetRoom) {
      seterror("Please enter a room name to join");
      return;
    }
    seterror(null);
    setdisable(true);
    try {
      const responsed = await axios.get(`${http}/room/${targetRoom}`);
      if (responsed.data) {
        setdisable(false);
        setrooms(null);
        router.push(`/canvas/${responsed.data.id}`);
      }
    } catch (e) {
      setdisable(false);
      if (axios.isAxiosError(e)) {
        seterror(e.response?.data?.msg || "Room not found");
      } else {
        console.error(e);
      }
    }
  };

  const deleteroom = async (slug: string) => {
    try {
      await axios.get(`${http}/closeroom/${slug}`);
      if (userid !== null) {
        const roomres = await axios.get(`${http}/userRooms/${userid}`);
        if (roomres) {
          setrooms(roomres.data.data);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const logout = () => {
    localStorage.removeItem("jwtToken");
    router.push("/Signin");
  };

  return (
    <div className={`min-h-screen w-full bg-black text-white relative overflow-x-hidden ${outfit.className}`}>
      {/* Background continuous ambient gradient */}
      <div className="absolute inset-0  w-full h-full bg-gradient-to-b from-[#0d001f] via-[#090033] to-black"></div>

      {/* Background grid lines */}
      <div className="absolute top-[10vh] left-0 w-full h-[1px] bg-gray-300 opacity-10 z-0"></div>
      <div className="absolute left-[5vw] md:left-[15vw] w-[1px] h-full bg-gray-300 opacity-10 z-0"></div>
      <div className="absolute right-[5vw] md:right-[15vw] w-[1px] h-full bg-gray-300 opacity-10 z-0"></div>

      {/* Header Bar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between relative z-10 border-b border-blue-500/10">
        <div className="flex items-center gap-3">
          <Link href="/">
            <h1 className={`${mochiy.className} text-xl md:text-2xl text-white hover:text-blue-300 transition-colors`}>
              Playboard
            </h1>
          </Link>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-800/50 font-medium">
            Dashboard
          </span>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-950/40 hover:bg-red-500/10 border border-blue-500/20 hover:border-red-500/30 text-gray-300 hover:text-red-400 text-sm font-medium transition-all duration-200 cursor-pointer"
        >
          <HiOutlineArrowLeftOnRectangle className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 relative z-10">

        {loading ? (
          <div className="w-full py-24 flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <p className="text-gray-400 text-sm">Authenticating dashboard...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-10"
          >
            {/* Title Section */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-purple-200">
                Your Whiteboards
              </h1>
              <p className="text-gray-400 text-sm md:text-base mt-2">
                Create a new collaborative canvas or resume work on your existing rooms.
              </p>
            </div>

            {/* Room Creation / Join Input Card */}
            <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-b from-[#180854]/60 to-[#0a0229]/80 border border-blue-500/20 backdrop-blur-xl shadow-xl space-y-4">
              <label htmlFor="room-input" className="block text-xs font-semibold text-blue-300 uppercase tracking-wider">
                Room Name or Slug
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="room-input"
                  placeholder="Enter room name (e.g. project-brainstorm)"
                  value={input}
                  onChange={(e) => {
                    setinput(e.target.value);
                    if (newerror) seterror(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") Createroom();
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-black/50 border border-blue-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all text-sm md:text-base"
                  type="text"
                />

                <div className="flex gap-2.5 sm:flex-none">
                  <button
                    disabled={disable}
                    onClick={() => Createroom()}
                    className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    <HiOutlinePlus className="w-4 h-4" />
                    <span>{disable ? "Working..." : "Create"}</span>
                  </button>

                  <button
                    disabled={disable}
                    onClick={() => Joinroom()}
                    className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-blue-950/80 hover:bg-blue-900/80 border border-blue-700/50 text-blue-200 hover:text-white text-sm font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <span>{disable ? "..." : "Join"}</span>
                    <HiOutlineArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {newerror && (
                <p className="text-xs text-red-400 pt-1 flex items-center gap-1 font-medium">
                  <span>•</span> {newerror}
                </p>
              )}
            </div>

            {/* Recent Rooms List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <HiOutlineFolderOpen className="w-5 h-5 text-blue-400" />
                  <span>Recent Rooms</span>
                </h2>
                {rooms && rooms.length > 0 && (
                  <span className="text-xs text-gray-400 font-medium px-2.5 py-1 rounded-full bg-blue-950/50 border border-blue-800/40">
                    {rooms.length} {rooms.length === 1 ? "room" : "rooms"}
                  </span>
                )}
              </div>

              {rooms === null || rooms.length === 0 ? (
                <div className="p-10 rounded-2xl border border-dashed border-blue-500/20 bg-[#120042]/20 text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-gray-400">
                    <HiOutlinePencilSquare className="w-6 h-6" />
                  </div>
                  <p className="text-gray-300 text-sm font-medium">No canvas rooms created yet</p>
                  <p className="text-gray-500 text-xs max-w-xs">
                    Type a room name in the input above and click &quot;Create&quot; to start your first whiteboard!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {rooms.map((e: { slug: string }) => (
                    <Card
                      key={e.slug}
                      roomname={e.slug}
                      joinfuntion={() => Joinroom(e.slug)}
                      deleterm={() => deleteroom(e.slug)}
                    />
                  ))}
                </div>
              )}
            </div>

          </motion.div>
        )}

      </main>
    </div>
  );
}