"use client"

import intindraw from "@/draw/draw";
import { useEffect, useRef } from "react";
import { useRouter } from 'next/navigation'

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

    return <div>
        <div className="flex">
        <button className="p-1 m-1 bg-green-500 rounded-md text-white" onClick={()=> {
            console.log(tool.current)
            return tool.current="circle"}  
        }>Circle</button>
        <button className="p-1 m-1 bg-purple-500 rounded-md text-white"onClick={()=> {
            console.log(tool.current)
            return tool.current="rec"}} >Rectagle</button>
        <button className="p-1 m-1 bg-blue-500 rounded-md text-white" onClick={()=> {
            console.log(tool.current)
            return tool.current="select"}}>select</button>
        <button className="p-1 m-1 bg-gray-500 rounded-md text-white" onClick={()=> {
            console.log(tool.current)
            return tool.current="erase"}}>erase</button>
        <button className="p-1 m-1 bg-slate-800 rounded-md text-white" onClick={()=> {
            WebSocket.send(JSON.stringify({
                type:"leave_room",
                roomId:roomid
            }))
            WebSocket.close()
            router.push('/Dashboard');
            return }}>Leave</button> 
        <div className="px-4 py-1 m-1 w-fit bg-slate-800 rounded-md text-white">Room- {slug}</div>
            </div>
        <canvas ref={usecanvas} width={1920} height={1080}></canvas>
    </div>
}
