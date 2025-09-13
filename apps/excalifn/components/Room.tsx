"use client"
import { useEffect, useState } from "react";
import { Canvaspage } from "./Canvas";
import axios from "axios";
import {http, wslink} from "./endpoints";
export function Roomcanvas({roomid}:{
    roomid:string
}){
    const [socket,setsocket] = useState<WebSocket>()
    const [slug,setslug] =  useState("");
    useEffect(()=>{
        axios.get(`${http}/slug/${roomid}`).then((e)=>{
            setslug(e.data.slug)
        })
        const ws = new WebSocket(`${wslink}?token=${localStorage.getItem("jwtToken")}`);
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
 return <Canvaspage roomid={roomid} WebSocket={socket} slug={slug}/>
}