"use client"
import intindraw from "@/draw/draw";
import { useEffect, useRef } from "react";

export default function Canvas(){

    const usecanvas = useRef<HTMLCanvasElement>(null);
    useEffect(()=>{
        if(usecanvas.current){
            intindraw(usecanvas.current);
                }
            },[usecanvas])
    return <>
    <div>
        <canvas ref={usecanvas} width={1000} height={1000}></canvas>
    </div></>
}