import { Mochiy_Pop_One,Outfit } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import picture from "../assets/Playboard.svg"
import { SiInstagram } from "react-icons/si";
import { SlSocialTwitter } from "react-icons/sl";
import { TbBrandLinkedin } from "react-icons/tb";
const mochiy = Mochiy_Pop_One({
  weight: "400", // only one weight available
  subsets: ["latin"],
  variable: "--font-mochiy",
});

const outfit = Outfit({
  subsets: ["latin"],
   weight: ["300","700"],
  variable: "--font-outfit", // optional CSS variable
});

export default function Home(){
    return <>
  <div className="absolute top-[75px] left-0 w-full h-[1px] bg-gray-300 opacity-10"></div>
    <div className="absolute  left-[275px] w-[1px] h-[1701px] bg-gray-300 opacity-10"></div>
      <div className="absolute  right-[275px]  w-[1px] h-[1701px] bg-gray-300 opacity-10"></div>
      <div
    className=" w-full h-[1701px]  flex flex-col  items-center justify-between bg-gradient-to-b from-[#120066] from-[-54.58%] to-black">
        <div>
        <div className="w-[1280px] h-[56px] mt-4 flex items-center justify-between px-2">
            <div className="w-[120px] drop-shadow-md">
            <h1 className={`${mochiy.className} text-2xl`}>Playboard</h1>
            </div>
            <div className="w-[650px] h-[50px] p-[2px]  bg-linear-to-b from-[#2300C3] to-[#02000A] rounded-full drop-shadow-lg">
            <div className="w-[650px] h-[50px] flex items-center  justify-around px-5 rounded-full  bg-[linear-gradient(0deg,#281191_-117.86%,#000000_130.36%)]">
                <Link href="/dashboard">Home</Link>
                <Link href="/dashboard">Product</Link>
                <Link href="/dashboard">About</Link>
            </div>
            </div>
            <div className="w-[120px]">
            <button className="flex flex-row justify-center items-center p-[10px] gap-[10px] 
             w-[100px] h-[39px] 
             bg-gradient-to-b from-[#2E00FF] to-[#13006C] 
             drop-shadow-md rounded-[15px] 
             flex-none order-2 grow-0">SignUp</button>
            </div>
        </div>
    <div className="mt-45 flex flex-col items-center">
        <h1 className={` text-[49px] ${outfit.className} font-bold `}>Sketch, Share, and Build Together</h1>
        <h2 className={`${outfit.className} text-[20px]`}>Collaborate live on the same canvas with anyone</h2>
    </div>
        <div className="mt-10 flex flex-col items-center">
            <button className={`flex flex-row justify-center items-center p-[10px] gap-[10px] 
             w-[210px] h-[52px] 
             bg-gradient-to-b from-[#D800FF] to-[#8E009B] 
             drop-shadow-md rounded-[8px]     shadow-[0_0_20px_rgba(216,0,255,0.7)]
             flex-none order-2 grow-0 text-xl font-medium text-shadow-white border-b-[1px] border-r border-l border-white ${outfit.className}`}>
            Start Board
            </button>
        </div>
        <div className='relative'>
            <Image  className="relative z-10 mask-b-from-20% mask-b-to-80%" alt="online sketchboard image" src={picture} /> 
            <div className=" absolute left-[425px] inset-0 w-[500px] h-[500px] bg-blue-700 blur-[200px] z-0"></div>
        </div>
       
        </div>
        <div className="w-full h-[250px] bg-gradient-to-b from-black flex items-center justify-center to-[#120066]">
            <div className="w-[1280px] h-[56px] mt-4 flex items-center justify-between px-2">
            <div className="w-[120px] drop-shadow-md">
                <h1 className={`${mochiy.className} text-3xl`}>Playboard</h1>
            </div>
            <div className="opacity-50">Made by Avi</div>
            <div className="w-[160px] drop-shadow-md flex items-center justify-between">
                            <SiInstagram size={32} className="text-white" />
                            <SlSocialTwitter size={32} className="text-white"/>
                            <TbBrandLinkedin size={32} className="text-white"/>
            </div>
            </div>
        </div>
    </div>
             </> 
}


