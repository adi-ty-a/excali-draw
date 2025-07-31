"use client"

import intindraw from "@/draw/draw";
import { useEffect, useRef } from "react";

export function Canvaspage({roomid,WebSocket}:{
    roomid:string,
    WebSocket:WebSocket
}){
    const usecanvas = useRef<HTMLCanvasElement>(null);
    useEffect(()=>{
        if(usecanvas.current){
            intindraw(usecanvas.current,roomid,WebSocket);
                }

               
            },[usecanvas,roomid,WebSocket])

    return <div>
        <canvas ref={usecanvas} width={1920} height={1080}></canvas>
    </div>
}
