"use client"
import { useEffect, useState } from "react";
import { Canvaspage } from "./Canvas";
export function Roomcanvas({roomid}:{
    roomid:string
}){

    const [socket,setsocket] = useState<WebSocket>()
    useEffect(()=>{
        const ws = new WebSocket(`ws://localhost:8090?token=${localStorage.getItem("jwtToken")}`);
        ws.onopen =()=>{
            setsocket(ws);
            ws.send(JSON.stringify({
                type:"join_room",
                roomId:roomid
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