import { Mochiy_Pop_One } from "next/font/google";
import Link from "next/link";

const mochiy = Mochiy_Pop_One({
  weight: "400", // only one weight available
  subsets: ["latin"],
  variable: "--font-mochiy",
});

export default function Home(){
    return <div
    className="bg-linear-to-b  w-screen h-[1701px] from-[#120066] to-[#000000] flex flex-col items-center">
        <div className="w-[1520px] h-[56px] mt-4 flex items-center justify-between px-2">
            <h1 className={`${mochiy.className} text-xl`}>playboard</h1>
            <div className="w-[650px] h-[50px] flex items-center justify-around px-5 rounded-4xl bg-linear-to-b  from-[#000000] to-[#281191]">
                <Link href="/dashboard">Home</Link>
                <Link href="/dashboard">Product</Link>
                <Link href="/dashboard">About</Link>
            </div>
            <button>SignUp</button>
        </div>
    </div>
}