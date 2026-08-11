"use client";

import intindraw from "@/draw/draw";
import { useEffect, useRef, useState } from "react";
import { useRouter } from 'next/navigation';
import { LuCircle, LuRectangleHorizontal, LuPencil, LuRotateCw } from "react-icons/lu";
import { FaRegHand } from "react-icons/fa6";
import { RxEraser, RxExit } from "react-icons/rx";
import { HiPlus, HiMinus } from "react-icons/hi2";

export function Canvaspage({ roomid, WebSocket, slug }: {
  roomid: string,
  WebSocket: WebSocket,
  slug: string
}) {
  const router = useRouter();
  const usecanvas = useRef<HTMLCanvasElement>(null);
  const tool = useRef<string>("rec");
  const viewportTransform = useRef<{ x: number, y: number, scale: number }>({
    x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
    y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
    scale: 1
  });
  const [highlight, sethighlight] = useState<string>("rec");
  const [zoomPercent, setZoomPercent] = useState<number>(100);

  const handleZoomChange = (percent: number) => {
    setZoomPercent(percent);
  };

  const roomId = roomid;

  useEffect(() => {
    const canvas = usecanvas.current;
    if (!canvas) return;

    // Set canvas dimensions to fill window
    const updateDimensions = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    updateDimensions();

    // Initialize center viewport transform if uninitialized
    if (viewportTransform.current.x === 0 && viewportTransform.current.y === 0) {
      viewportTransform.current.x = window.innerWidth / 2;
      viewportTransform.current.y = window.innerHeight / 2;
      viewportTransform.current.scale = 1;
    }

    let cleanupFn: (() => void) | void;
    intindraw(canvas, roomId, WebSocket, tool, viewportTransform, handleZoomChange).then((cleanup) => {
      cleanupFn = cleanup;
    });

    const handleResize = () => {
      updateDimensions();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (typeof cleanupFn === "function") {
        cleanupFn();
      }
    };
  }, [roomId, WebSocket]);

  const leave = () => {
    WebSocket.send(JSON.stringify({
      type: "leave_room",
      roomId: roomid
    }));
    WebSocket.close();
    router.push('/Dashboard');
  };

  const toolchange = (newtool: string) => {
    sethighlight(newtool);
    tool.current = newtool;
  };

  const resetZoom = () => {
    viewportTransform.current.x = window.innerWidth / 2;
    viewportTransform.current.y = window.innerHeight / 2;
    viewportTransform.current.scale = 1;
    setZoomPercent(100);
    // Dispatch custom event to trigger re-draw
    window.dispatchEvent(new Event("canvas-view-reset"));
  };

  const zoomIn = () => {
    const oldScale = viewportTransform.current.scale;
    const newScale = Math.min(5, oldScale * 1.2);
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const ratio = newScale / oldScale;
    
    viewportTransform.current.x = centerX - (centerX - viewportTransform.current.x) * ratio;
    viewportTransform.current.y = centerY - (centerY - viewportTransform.current.y) * ratio;
    viewportTransform.current.scale = newScale;
    setZoomPercent(Math.round(newScale * 100));
    window.dispatchEvent(new Event("canvas-view-reset"));
  };

  const zoomOut = () => {
    const oldScale = viewportTransform.current.scale;
    const newScale = Math.max(0.1, oldScale / 1.2);
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const ratio = newScale / oldScale;
    
    viewportTransform.current.x = centerX - (centerX - viewportTransform.current.x) * ratio;
    viewportTransform.current.y = centerY - (centerY - viewportTransform.current.y) * ratio;
    viewportTransform.current.scale = newScale;
    setZoomPercent(Math.round(newScale * 100));
    window.dispatchEvent(new Event("canvas-view-reset"));
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* Floating Toolbar */}
      <div className="absolute flex items-center w-fit px-4 py-1.5 bg-gradient-to-b z-20 from-[#120066]/90 to-[#030014]/90 backdrop-blur-md left-1/2 rounded-2xl justify-center gap-1.5 -translate-x-1/2 top-4 border border-blue-500/30 shadow-xl text-white">
        <button 
          title="Circle Tool" 
          className={`p-2 rounded-xl text-lg transition-all ${highlight === "circle" ? "bg-blue-600/80 text-white shadow-md" : "hover:bg-white/10 text-gray-300"}`} 
          onClick={() => toolchange("circle")}
        >
          <LuCircle />
        </button>

        <button 
          title="Rectangle Tool" 
          className={`p-2 rounded-xl text-xl transition-all ${highlight === "rec" ? "bg-blue-600/80 text-white shadow-md" : "hover:bg-white/10 text-gray-300"}`} 
          onClick={() => toolchange("rec")}
        >
          <LuRectangleHorizontal />
        </button>

        <button 
          title="Pencil Tool" 
          className={`p-2 rounded-xl text-lg transition-all ${highlight === "pencil" ? "bg-blue-600/80 text-white shadow-md" : "hover:bg-white/10 text-gray-300"}`} 
          onClick={() => toolchange("pencil")}
        >
          <LuPencil />
        </button>

        <button 
          title="Select / Hand Pan Tool" 
          className={`p-2 rounded-xl text-lg transition-all ${highlight === "select" ? "bg-blue-600/80 text-white shadow-md" : "hover:bg-white/10 text-gray-300"}`} 
          onClick={() => toolchange("select")}
        >
          <FaRegHand />
        </button>

        <button 
          title="Eraser Tool" 
          className={`p-2 rounded-xl text-lg transition-all ${highlight === "erase" ? "bg-blue-600/80 text-white shadow-md" : "hover:bg-white/10 text-gray-300"}`} 
          onClick={() => toolchange("erase")}
        >
          <RxEraser />
        </button>

        <div className="h-5 w-[1px] bg-white/20 mx-1" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button title="Zoom Out" className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300" onClick={zoomOut}>
            <HiMinus className="w-4 h-4" />
          </button>
          
          <button title="Reset Zoom & Center View" onClick={resetZoom} className="text-xs font-mono w-14 text-center hover:text-blue-300 transition-colors">
            {zoomPercent}%
          </button>

          <button title="Zoom In" className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300" onClick={zoomIn}>
            <HiPlus className="w-4 h-4" />
          </button>

          <button title="Reset View" className="p-1.5 text-sm rounded-lg hover:bg-white/10 text-gray-300" onClick={resetZoom}>
            <LuRotateCw />
          </button>
        </div>

        <div className="h-5 w-[1px] bg-white/20 mx-1" />

        <div className="px-3 py-1 text-xs font-medium text-blue-200 bg-blue-950/60 rounded-lg border border-blue-800/40 truncate max-w-[150px]">
          Room: {slug || roomid}
        </div>

        <button title="Exit Room" className="p-2 rounded-xl hover:bg-red-500/20 text-gray-300 hover:text-red-400 transition-colors" onClick={() => leave()}>
          <RxExit className="text-xl" />
        </button>
      </div>

      {/* Fullscreen Infinite Canvas */}
      <canvas 
        ref={usecanvas} 
        className="block w-full h-full cursor-crosshair touch-none"
      />
    </div>
  );
}
