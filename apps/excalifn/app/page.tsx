import { Mochiy_Pop_One,Outfit } from "next/font/google";
import Link from "next/link";

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
    return <div
    className="bg-linear-to-b  w-screen h-[1701px] from-[#120066] to-[#000000] flex flex-col  items-center">
        <div className="w-[1520px] h-[56px] mt-4 flex items-center justify-between px-2">
            <h1 className={`${mochiy.className} text-xl`}>Playboard</h1>
            <div className="w-[650px] h-[50px] flex items-center mr-25 justify-around px-5 rounded-4xl  bg-[linear-gradient(0deg,#281191_-117.86%,#000000_130.36%)]            ">
                <Link href="/dashboard">Home</Link>
                <Link href="/dashboard">Product</Link>
                <Link href="/dashboard">About</Link>
            </div>
            <button>SignUp</button>
        </div>
    <div className="mt-45 flex flex-col items-center">
        <h1 className={` text-[49px] ${outfit.className} font-bold `}>Sketch, Share, and Build Together</h1>
        <h2 className={`${outfit.className} text-[20px]`}>Collaborate live on the same canvas with anyone</h2>
    </div>
    </div>
}


