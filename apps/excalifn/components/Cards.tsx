export const Card =({roomname,joinfuntion}:{roomname:string,joinfuntion:()=>void})=>{
    return <>
    <div className=" flex flex-shrink-0 items-center justify-between px-4 w-full rounded-md h-[48px] bg-gradient-to-b from-[#2E00FF]/20 to-[#13006C]/20  bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-20 border border-white/20">
        <h1>{roomname}</h1>
        <div className="flex gap-2">
        <button onClick={joinfuntion} className="w-fit px-2 h-6 bg-gradient-to-b from-[#2E00FF]/80 to-[#13006C]/80  rounded-lg bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-20 ">Join</button>
        <button className="w-6 h-6 rounded-full bg-gradient-to-b from-red-400/80 to-red-800/80  bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-20">x</button>
        </div>
    </div>
    </>
}