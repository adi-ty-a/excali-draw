"use client"

import intindraw from "@/draw/draw";
import { useEffect, useRef } from "react";

export function Canvaspage({roomid,WebSocket}:{
    roomid:string,
    WebSocket:WebSocket
}){
    const usecanvas = useRef<HTMLCanvasElement>(null);
    const tool = useRef<string>("rec")
    const roomId= roomid
    useEffect(()=>{
        if(usecanvas.current){
            intindraw(usecanvas.current,roomId,WebSocket,tool);
                }
            },[usecanvas,roomid,WebSocket])

    return <div>
        <button className="p-1 m-1 bg-green-500 rounded-md text-white" onClick={()=> {
            console.log(tool.current)
            return tool.current="circle"} 
        }>Circle</button>
        <button className="p-1 m-1 bg-purple-500 rounded-md text-white"onClick={()=> {
            console.log(tool.current)
            return tool.current="rec"}} >Rectagle</button>
        <button className="p-1 m-1 bg-blue-500 rounded-md text-white" onClick={()=> {
            console.log(tool.current)
            return tool.current="select"}}>Line</button>
        <button className="p-1 m-1 bg-gray-500 rounded-md text-white" onClick={()=> {
            console.log(tool.current)
            return tool.current="Move"}}>Move</button>
        <canvas ref={usecanvas} width={1920} height={1080}></canvas>
    </div>
}
