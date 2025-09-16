"use client"
import { Mochiy_Pop_One,Outfit } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react"
import picture from "../assets/Playboard.svg"
import { FaGithub } from "react-icons/fa";
import { SlSocialTwitter } from "react-icons/sl";
import { TbBrandLinkedin } from "react-icons/tb";
import { Button } from "@/components/Button";
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
   weight: ["300","700"],
  variable: "--font-outfit", 
});

export default function Home(){
      const router = useRouter()
    const parent ={
        initial:{opacity: 1},
        visible:{
            transition:{
                staggerChildren:0.2,
            }
        }
    }

    const child={
    visible:{
        y:0,
        opacity:1,
        transition:{
                duration:1
            }
    },
    initial:{
        y:50,
        opacity:0
    }
    }

    const startBoard = async()=>{
        const token = localStorage.getItem('jwtToken');
        if(token){
            const res = await axios.get(http+"/verify-token",{
            headers:{
                Authorization:token
            }
            })
            const id = res.data.userId;
            if(id){ 
                try{
                const Roomres  = await axios.get(`${http}/userRooms/${id}`)
                const rooms  =Roomres.data.data
                const lastroom = rooms[rooms.length - 1];
                const roomidres  = await axios.get(`${http}/room/${lastroom.slug}`)
                const roomid = roomidres.data.id
                router.push(`/canvas/${roomid}`);
                }catch(e){
                    console.log(e)
                }
            }
        }else{
            router.push("/Signin")
        }
    }

    return <>
  <div className="absolute top-[10vh] left-0 w-full h-[1px] bg-gray-300 opacity-10"></div>
    <div className="absolute left-[10vw]  md:left-[20vw] w-[1px] h-screen md:h-[100rem] bg-gray-300 opacity-10"></div>
      <div className="absolute right-[10vw]  md:right-[20vw]  w-[1px] h-screen md:h-[100rem] bg-gray-300 opacity-10"></div>
      <div className="absolute -z-20 w-full h-screen md:h-[100rem] bg-gradient-to-b from-[#120066] from-[-54.58%] to-black"></div>
      <div
        className=" w-full h-[1000px] md:h-[1701px]  flex flex-col  items-center justify-between ">
        <div className="flex flex-col  items-center justify-between">
        <div className=" w-[400px]   md:w-[clamp(60rem,85vw,100rem)] h-[56px] mt-4 flex items-center justify-between px-2">
            <div className="w-[120px] drop-shadow-md">
            <h1 className={`${mochiy.className} text-2xl`} >Playboard</h1>
            </div>
            <div className="w-[550px] hidden md:flex h-[45px] p-[2px]  bg-linear-to-b from-[#2300C3] to-[#02000A] rounded-full drop-shadow-lg">
            <div className="w-[550px] h-[45px] flex items-center  justify-around px-5 rounded-full  bg-[linear-gradient(0deg,#281191_-117.86%,#000000_130.36%)]">
                <Link href="/" className=" hover:drop-shadow-[0_0_10px_rgba(0,115,255,0.9)] transition duration-300 ">Home</Link>
                <Link href="/Dashboard" className=" hover:drop-shadow-[0_0_10px_rgba(0,115,255,0.9)] transition duration-300 ">Product</Link>
                <Link href="/" className=" hover:drop-shadow-[0_0_10px_rgba(0,115,255,0.9)] transition duration-300 ">About</Link>
            </div>
            </div>
            <div className="w-[100px] md:w-[135px]">
                <Link rel="stylesheet" href="/Signup">
            <Button btnscale={true}  btnsize="small" prop="blue" content="SignUp"/>
                </Link>
            </div>
        </div>
    <motion.div 
    variants={parent}
    initial="initial"
    animate="visible"
    >
    <motion.div  className="mt-30 flex flex-col  items-center">
        <motion.h1 variants={child} className={` text-[clamp(1.5rem,2.604vw,3rem)] text-min flex-wrap ${outfit.className}  font-bold relative z-10`}>Sketch, Share, and Build Together</motion.h1>
        <motion.h2 variants={child} className={`${outfit.className} text-[clamp(0.8rem,2.604vw,1.25rem)] `}>Collaborate live on the same canvas with anyone</motion.h2>
    </motion.div>
        <motion.div variants={child} className="mt-10 flex z-10 flex-col items-center">
            <Button btnscale={true} btnsize="medium" btnfunction={()=>startBoard()} prop="pink" content="Start board" />
        </motion.div>
        <motion.div 
        variants={child}
        className='relative -z-10'>
            <Image  className="relative  z-10 mask-b-from-20% mask-b-to-80%" alt="online sketchboard image " src={picture} priority  /> 
            <div className=" absolute left-1/2 -translate-x-1/2 inset-0 w-[clamp(300px,45vw,1000px)] h-[clamp(300px,45vw,1-00px)] bg-blue-700 blur-[200px] z-0"></div>
        </motion.div>
            </motion.div>
       
        </div>
        <div className="w-full h-[250px] bg-gradient-to-b from-black flex items-center justify-center to-[#120066]">
            <div className="w-[1280px] h-[56px] mt-4 flex items-center justify-between px-2">
            <div className="w-[120px] drop-shadow-md">
                <h1 className={`${mochiy.className} text-[4vw] md:text-2xl`}>Playboard</h1>
            </div>
            <div className="opacity-50 text-sm">Made by Avi</div>
            <div className="w-[100px] md:w-[160px] drop-shadow-md flex items-center justify-between">
                            <Link  href="https://github.com/adi-ty-a"  target="_blank" rel="noopener noreferrer">
                            <FaGithub className="text-white w-6 h-6 sm:w-10 sm:h-10" />
                            </Link>
                            <Link  href="https://x.com/avi_0t" target="_blank" rel="noopener noreferrer">
                            <SlSocialTwitter className="text-white w-6 h-6 sm:w-10 sm:h-10"/>
                            </Link>
                            <Link  href="https://www.linkedin.com/in/aditya-srivastava-662829317/" target="_blank" rel="noopener noreferrer">
                            <TbBrandLinkedin className="text-white w-6 h-6 sm:w-10 sm:h-10"/>
                            </Link>
            </div>
            </div>
        </div>
    </div>
             </> 
}


