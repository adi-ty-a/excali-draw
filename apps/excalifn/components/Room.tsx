"use client"
import { useEffect, useState } from "react";
import { Canvaspage } from "./Canvas";
export function Roomcanvas({roomid}:{
    roomid:string
}){

    const [socket,setsocket] = useState<WebSocket>()
    useEffect(()=>{
        const ws = new WebSocket("ws://localhost:8080?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiaWF0IjoxNzU1NzE2Mjc3fQ.C7T4Rlp6vFwOYLjv6ovRM5EaA0jDOZ6See_KK0QVT18");
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