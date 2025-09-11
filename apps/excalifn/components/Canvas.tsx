"use client"

import intindraw from "@/draw/draw";
import { useEffect, useRef } from "react";
import { useRouter } from 'next/navigation'
import { LuCircle } from "react-icons/lu";
import { LuRectangleHorizontal } from "react-icons/lu";
import { FaRegHand } from "react-icons/fa6";
import { RxEraser } from "react-icons/rx";
import { RxExit } from "react-icons/rx";
export function Canvaspage({roomid,WebSocket,slug}:{
    roomid:string,
    WebSocket:WebSocket,
    slug:string
}){
    const router = useRouter()
    const usecanvas = useRef<HTMLCanvasElement>(null);
    const tool = useRef<string>("rec")
    const roomId= roomid
    useEffect(()=>{

        if(usecanvas.current){
            intindraw(usecanvas.current,roomId,WebSocket,tool);
            }
            },[usecanvas,roomid,WebSocket])

        const leave =()=>{
            WebSocket.send(JSON.stringify({
                type:"leave_room",
                roomId:roomid
            }))
            WebSocket.close()
            router.push('/Dashboard');
            return
        }

    return <div>
        <div className="absolute flex w-fit px-6 bg-gradient-to-b z-10 from-[#120066]/50 from-[-54.58%] to-blue-[#000814] left-1/2 rounded-2xl justify-center gap-2 -translate-x-1/2 top-3 border-2 border-white/10">
        <button className="p-1 m-1 text-xl rounded-md" onClick={()=> {return tool.current="circle"}  }>
            <LuCircle  className="text-purple-300 "/></button>
        <button className="p-1 text-2xl m-1 rounded-md"onClick={()=> { return tool.current="rec"}} >
                <LuRectangleHorizontal className="text-purple-300 "/></button>
        <button className="p-1 m-1 text-xl rounded-md" onClick={()=> { return tool.current="select"}}>
                <FaRegHand  className="text-purple-300 "/></button>
        <button className="p-1 m-1 text-xl rounded-md" onClick={()=> {return tool.current="erase"}}>
                <RxEraser  className="text-purple-300 "/></button>
        <button className="p-1 m-1 text-2xl rounded-md" onClick={()=>leave()}>
            <RxExit  className="text-purple-300 "/></button> 
        <div className="px-4 py-1 m-1 w-fit text-purple-300 rounded-md ">Room- {slug}</div>
            </div>
        <canvas ref={usecanvas} width={1920} height={1080}></canvas>
    </div>
}
