"use client"
import { useEffect, useState } from "react";
import { Canvaspage } from "./Canvas";
export function Roomcanvas({roomid}:{
    roomid:string
}){

    const [socket,setsocket] = useState<WebSocket>()
    useEffect(()=>{
        const ws = new WebSocket("ws://localhost:8080?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzUzMzcyMDQyfQ.dD5_SYXCs60HIAo1eKmGFjSahannI2tK-YpBjEEB4RE");
        ws.onopen =()=>{
            setsocket(ws);
            ws.send(JSON.stringify({
                type:"join_room",
                room:roomid
            }))
        }
        return () => {
            ws.close();
        };
    },[roomid])

    if(!socket){
        return <div>loading</div>
    }
 return <Canvaspage roomid={roomid} WebSocket={socket}/>
}