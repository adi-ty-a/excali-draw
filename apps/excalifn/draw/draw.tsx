import axios from "axios"
import { RefObject } from "react";

type shapes ={
    id:number,
    type:"rect",
    x:number,
    y:number,
    width:number,
    height:number
} | {
    id:number,
    type:"circle",
    x:number,
    y:number,
    raidus:number,
    startangle:0,
    endangle:6.28
} 

export default async function  intindraw(canvas:HTMLCanvasElement,roomId:string,WebSocket:WebSocket,tool:RefObject<string>){
    const existing: shapes[] =  await getExistingshapes(roomId); 
    let selectedShapeId: number | null = null
    if(canvas){
        const ctx = canvas.getContext("2d");

        if(!ctx){
            return
        }

        WebSocket.onmessage = (event)=>{
            const message = JSON.parse(event.data);
            if(message.type == "chat"){
                const parsedmsg = JSON.parse(message.message)
                existing.push(parsedmsg.shape);
                clearcanvas(existing,canvas,ctx)

            }
        }

        let clicked = false;
        let startx = 0;
        let starty = 0;
        ctx.fillStyle ="rgb(0,0,0)";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        clearcanvas(existing,canvas,ctx)

        canvas.addEventListener("mousedown",(e)=>{
                clicked = true
                startx = e.clientX;
                starty= e.clientY;

                if(tool.current == "select"){
                    selectedShapeId = checkselection(existing,startx,starty,ctx)
                    clearcanvas(existing,canvas,ctx,selectedShapeId)
                    console.log(selectedShapeId);
                }
        })
        canvas.addEventListener("mouseup",(e)=>{
             clicked = false
             const width = e.clientX-startx;
             const height = e.clientY-starty;
             let shape:shapes |null = null;
              if(tool.current == "circle"){
                const radius =  Math.abs(width / 2); 
                const centerX = startx ;
                const centerY = starty ;
                shape = {
                    id: Date.now(),
                    type: "circle",
                    x: centerX,
                    y: centerY,
                    raidus: radius,
                    startangle: 0,
                    endangle: 6.28
                };
            }

             
             else if(tool.current == "rec"){
                 shape = {
                    id:Date.now(),
                    type:"rect",
                    x:startx,
                    y:starty,
                    height,
                    width
                 }
             }
            if(shape){
                existing.push(shape);
                WebSocket.send(JSON.stringify({
                   type:"chat",
                   message:JSON.stringify({shape}),
                   roomId
                }));
            }
             

        })
        canvas.addEventListener("mousemove",(e)=>{
            if(clicked){
                const width = e.clientX-startx;
                const height = e.clientY-starty;
                const raidus = width/2;
                clearcanvas(existing,canvas,ctx)
                ctx.strokeStyle = "rgb(255,255,255)";

                if(tool.current == "rec"){
                    ctx.strokeRect(startx,starty,width,height);
                }
                else if(tool.current == "circle"){
                    ctx.beginPath();
                    ctx.arc(startx,starty,Math.abs(raidus),0, 6.28);
                    ctx.stroke();
                }
            }
        }) 
}
}

function clearcanvas(exisitingshapes:shapes[], canvas:HTMLCanvasElement ,ctx:CanvasRenderingContext2D,selectedShapeId?:number | null){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle ="rgb(0,0,0)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    exisitingshapes.map((shapes)=>{
    
        if(shapes.type == "rect"){
            ctx.strokeStyle = "rgb(255,255,255)";
            ctx.setLineDash([])
        ctx.strokeRect(shapes.x,shapes.y,shapes.width,shapes.height);
        }
        else if(shapes.type == "circle"){
            ctx.setLineDash([])
            ctx.strokeStyle = "rgb(255,255,255)";
            ctx.beginPath();
            ctx.arc(shapes.x,shapes.y,Math.abs(shapes.raidus),0,6.28);
            ctx.stroke();
        }
    })
    const selectedshape :shapes | undefined = exisitingshapes.find((e)=> e.id == selectedShapeId)
    if(!selectedshape){
        return
    }
    if(selectedshape.type == "rect" ){
    ctx.strokeStyle = "rgb(255,158,255)";
    ctx.setLineDash([20,5]);
    ctx.strokeRect(
    selectedshape.x - 15 * Math.sign(selectedshape.width),
    selectedshape.y - 15 * Math.sign(selectedshape.height),
    selectedshape.width + 30 * Math.sign(selectedshape.width),
    selectedshape.height + 30 * Math.sign(selectedshape.height)
    );
    }else if(selectedshape.type == "circle" ){
    ctx.strokeStyle = "rgb(255,158,255)";
    ctx.setLineDash([20,5]);
    ctx.strokeRect(selectedshape.x - selectedshape.raidus -15,selectedshape.y - selectedshape.raidus -15,selectedshape.raidus * 2 + 30 ,selectedshape.raidus *2 + 30);
    }
    
}

async function  getExistingshapes(roomId : string){
    const res = await axios.get(`http://localhost:3001/chats/${roomId}`);
    
    if(!res.data){
        return []
    }
    const messages = res.data;
    const shapes = messages.map((e : {message: string})=> {
        const parsedData = JSON.parse(e.message);
        return parsedData.shape;
    })
    return shapes
}

function checkselection(existing:shapes[],startx:number,starty:number,ctx:CanvasRenderingContext2D){
    let selectedshape : shapes | null = null;
    for(let i = existing.length -1 ; i>=0;i--){
        const isSelected = ispointinshape(existing[i],startx,starty)
        if(isSelected){
            selectedshape = existing[i]
        break;
        }
    }
    if(selectedshape){
                console.log(selectedshape.type)
                return selectedshape.id
    }else{
        console.log("no shape selected ")
        return null
    }
    return null
}

function ispointinshape(shape:shapes,startx:number,starty:number,){
    if(shape.type == 'rect'){
    const left   = Math.min(shape.x, shape.x + shape.width);
    const right  = Math.max(shape.x, shape.x + shape.width);
    const top    = Math.min(shape.y, shape.y + shape.height);
    const bottom = Math.max(shape.y, shape.y + shape.height);
        return ( 
        startx >= left&&
        startx <= right &&
        starty >= top && 
        starty <= bottom
        )
    }else if(shape.type == 'circle'){
    const dx = startx - shape.x;
    const dy = starty - shape.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= shape.raidus
    }
    return false;   
}