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

type handles = {
    x:number,
    y:number,
    r:number
    id:number,
    position:"topleft" | "topright" | "bottomleft" | "bottomright"
}

export default async function  intindraw(canvas:HTMLCanvasElement,roomId:string,WebSocket:WebSocket,tool:RefObject<string>){
    const existing: shapes[] =  await getExistingshapes(roomId); 
    let selectedShapeId: number | null = null
    let circleshandles:handles[] = [] 
    let handleposition :string | null = null
    if(canvas){
        const ctx = canvas.getContext("2d");

        if(!ctx){
            return
        }

        WebSocket.onmessage = (event)=>{
            const message = JSON.parse(event.data);
            if(message.type == "chat"){
                const parsedmsg = JSON.parse(message.message)
                const last = existing.find(e => e.id == parsedmsg.shape.id )
                if(last){
                    if (selectedShapeId === last.id) {
                    selectedShapeId = message.id;
                    console.log(existing)
                }
                last.id = message.id;
                }else if (!last) {
                existing.push(parsedmsg.shape);
        }
                clearcanvas(existing,canvas,ctx,circleshandles)

            }else if (message.type == "move_shape"){
                const parsemsg = JSON.parse(message.message)
                const shape = existing.find(e => e.id == parsemsg.shape.id);
                if(shape){
                    if (selectedShapeId === parsemsg.shape.id) {
                        selectedShapeId = parsemsg.shape.id;
                    }
                    Object.assign(shape,parsemsg.shape);
                }
                clearcanvas(existing,canvas,ctx,circleshandles,selectedShapeId)  
            }
            else if (message.type == "delete_shape"){
                const easeshapeid = JSON.parse(message.id)
                const index = existing.findIndex(e => e.id == easeshapeid);
                if(index !== -1){
                    console.log(existing)
                    existing.splice(index,1)
                    console.log(existing)
                }
                if (selectedShapeId === easeshapeid) {
                    selectedShapeId = null;
                }
                clearcanvas(existing,canvas,ctx,circleshandles,selectedShapeId)  
            }
        }

        let clicked = false;
        let sizing = false;
        let moving = false;
        let initialwidth = 0;
        let initialheight = 0 
        let startx = 0;
        let starty = 0;
        let shapestartx = 0;
        let shapestarty = 0;
        let sizestartx = 0;
        let sizestarty = 0;
        let shapetoease = 0;
        let initialradius = 0;
        ctx.fillStyle ="rgb(0,0,0)";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        clearcanvas(existing,canvas,ctx,circleshandles)

        canvas.addEventListener("mousedown",(e)=>{
                clicked = true
                 const { x, y } = getCanvasCoords(canvas, e);
                startx = x;
                starty = y;

                if(tool.current == "select"){
                    const hanlde = ishandleclicked(circleshandles,startx,starty)
                    if(hanlde){
                        handleposition =hanlde
                        sizing = true;
                    }
                    const newselection = checkselection(existing,startx,starty,ctx)
                    if(newselection){
                        if(newselection !== selectedShapeId){
                            selectedShapeId = newselection;
                            circleshandles.length = 0;
                            clearcanvas(existing,canvas,ctx,circleshandles,selectedShapeId)
                        }
                        const selectedshape = existing.find((e)=> e.id == selectedShapeId)
                        if(selectedshape){
                            if(selectedshape.type == "rect" ){
                                initialwidth = selectedshape.width;
                                initialheight = selectedshape.height;
                                shapestartx = selectedshape.x;
                                shapestarty = selectedshape.y;
                                sizestartx =selectedshape.x;
                                sizestarty =selectedshape.y;
                            }
                            if(selectedshape.type == "circle" ){
                                initialradius = selectedshape.raidus;
                                shapestartx = selectedshape.x;
                                shapestarty = selectedshape.y;
                                sizestartx =selectedshape.x;
                                sizestarty =selectedshape.y;
                            }
                        }
                        clearcanvas(existing,canvas,ctx,circleshandles,selectedShapeId)
                    }else{
                        moving = false
                    }
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
                    id:   (Date.now() + Math.floor(Math.random() * 1000)) % 2147483647,
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
                    id: (Date.now() + Math.floor(Math.random() * 1000)) % 2147483647,
                    type:"rect",
                    x:startx,
                    y:starty,
                    height,
                    width
                 }

             }else if (tool.current == "select"){
                 if(sizing){
                     const isshape = existing.find((e)=> e.id == selectedShapeId)
                       if(isshape){
                            if (isshape && isshape.type == "rect" && (sizestartx !== 0 || sizestarty !== 0)) {
                        const { x: mouseX, y: mouseY } = getCanvasCoords(canvas, e);
                        const cx = sizestartx + initialwidth / 2;
                        const cy = sizestarty + initialheight / 2;
                        const scaleX = (mouseX - cx) / (startx - cx);
                        const scaleY = (mouseY - cy) / (starty - cy);
                        isshape.width = initialwidth * scaleX;
                        isshape.height = initialheight * scaleY;
                        isshape.x = cx - isshape.width / 2;
                        isshape.y = cy - isshape.height / 2;
                    }
                    else if(isshape && isshape.type == "circle" && (sizestartx !== 0 || sizestarty !== 0)){
                            const { x: mouseX, y: mouseY } = getCanvasCoords(canvas, e);
                            const dx = mouseX - isshape.x;
                            const dy = mouseY - isshape.y;
                            const newRadius = Math.sqrt(dx * dx + dy * dy);
                            isshape.raidus = newRadius;
                        }
                    shape = isshape
                    
                    }
                    
                    sizing = false
                 }  
                if(!sizing ){
                    const isshape = existing.find((e)=> e.id == selectedShapeId)

                    if(isshape && (shapestartx !== 0 || shapestarty !== 0) ){
                        if(isshape.type == "rect" || isshape.type == "circle"){
                            const { x: mouseX, y: mouseY } = getCanvasCoords(canvas, e)
                            const x = mouseX- startx 
                            const y = mouseY - starty 
                            isshape.x =  shapestartx + x
                            isshape.y =  shapestarty + y
                        }
                        shapestartx=0
                        shapestarty=0
                        sizestartx=isshape.x
                        sizestarty=isshape.y
                        shape = isshape
                    }
                }
            }
            if(shape){
                if(tool.current == "rec" || tool.current == "circle" ){
                    existing.push(shape);
                    WebSocket.send(JSON.stringify({
                       type:"chat",
                       message:JSON.stringify({shape}),
                       roomId,
                    }));
                }
                else if(tool.current =="select"){
                     WebSocket.send(JSON.stringify({
                       type:"move_shape",
                       message:JSON.stringify({shape}),
                       roomId
                    }));
                    moving = false; 
                }
            }
            else if(tool.current =="erase" && shapetoease !==0 ){
                     WebSocket.send(JSON.stringify({
                       type:"delete_shape",
                       shapetoease,
                       roomId
                    }));
                    shapetoease=0
                }

        })
        canvas.addEventListener("mousemove",(e)=>{
            if(clicked){
                const width = e.clientX-startx;
                const height = e.clientY-starty;
                const raidus = width/2;
                clearcanvas(existing,canvas,ctx,circleshandles,selectedShapeId)
                ctx.strokeStyle = "rgb(255,255,255)";
                if(tool.current == "select" ){
                    const shape = existing.find((e)=> e.id == selectedShapeId)
                    if((shapestartx !== 0 || shapestarty !== 0) && shape){
                        if(shape.type == "rect" || shape.type == "circle"){
                        const { x: mouseX, y: mouseY } = getCanvasCoords(canvas, e)
                        const x = mouseX- startx 
                        const y = mouseY - starty 
                        shape.x =  shapestartx + x
                        shape.y =  shapestarty + y
                    }
                    }
                }

                if(sizing){
                 const isshape = existing.find((e)=> e.id == selectedShapeId)
                    if(isshape){
                        if (isshape && isshape.type == "rect" && (sizestartx !== 0 || sizestarty !== 0)) {
                            const { x: mouseX, y: mouseY } = getCanvasCoords(canvas, e);
                            const cx = sizestartx + initialwidth / 2;
                            const cy = sizestarty + initialheight / 2;
                            const scaleX = (mouseX - cx) / (startx - cx);
                            const scaleY = (mouseY - cy) / (starty - cy);
                            isshape.width = initialwidth * scaleX;
                            isshape.height = initialheight * scaleY;
                            isshape.x = cx - isshape.width / 2;
                            isshape.y = cy - isshape.height / 2;
                        }else if(isshape && isshape.type == "circle" && (sizestartx !== 0 || sizestarty !== 0)){
                            const { x: mouseX, y: mouseY } = getCanvasCoords(canvas, e);
                            const dx = mouseX - isshape.x;
                            const dy = mouseY - isshape.y;
                            const newRadius = Math.sqrt(dx * dx + dy * dy);
                            isshape.raidus = newRadius;
                        }
                }
             }
                if(tool.current == "erase"){
                    const { x: mouseX, y: mouseY } = getCanvasCoords(canvas, e);
                    const eraseshape = checkselection(existing,mouseX,mouseY,ctx);
                    if(eraseshape){
                        shapetoease =eraseshape
                        console.log(shapetoease);
                    }

                }

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

function clearcanvas(exisitingshapes:shapes[], canvas:HTMLCanvasElement ,ctx:CanvasRenderingContext2D,circleshandles :handles[],selectedShapeId?:number | null){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle ="rgb(0,0,0)";
    circleshandles.length = 0;
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
    if(!selectedshape || !selectedShapeId ){
        return
    }
    if(selectedshape){
        if(selectedshape.type == "rect" ){
            ctx.strokeStyle = "rgb(255,158,255)";
            ctx.strokeRect(
    selectedshape.x - 15 * Math.sign(selectedshape.width),
    selectedshape.y - 15 * Math.sign(selectedshape.height),
    selectedshape.width + 30 * Math.sign(selectedshape.width),
    selectedshape.height + 30 * Math.sign(selectedshape.height)
    );
    drawCircle(ctx,selectedshape.x - 15 * Math.sign(selectedshape.width),selectedshape.y - 15 * Math.sign(selectedshape.height),7,circleshandles,selectedShapeId,"topleft");
    drawCircle(ctx,selectedshape.x + 15 * Math.sign(selectedshape.width) + selectedshape.width,selectedshape.y - 15 * Math.sign(selectedshape.height),7,circleshandles,selectedShapeId,"topright");
    drawCircle(ctx,selectedshape.x - 15 * Math.sign(selectedshape.width),selectedshape.y  + selectedshape.height + 15 * Math.sign(selectedshape.height) ,7,circleshandles,selectedShapeId,"bottomleft");
    drawCircle(ctx,selectedshape.x + 15 * Math.sign(selectedshape.width) + selectedshape.width,selectedshape.y + 15 * Math.sign(selectedshape.height) + selectedshape.height ,7,circleshandles,selectedShapeId,"bottomright");
    }else if(selectedshape.type == "circle" ){
    ctx.strokeStyle = "rgb(255,158,255)";
    ctx.strokeRect(selectedshape.x - selectedshape.raidus -15,selectedshape.y - selectedshape.raidus -15,selectedshape.raidus * 2 + 30 ,selectedshape.raidus *2 + 30);
    
    drawCircle(ctx,selectedshape.x - 15 - selectedshape.raidus,selectedshape.y - 15 - selectedshape.raidus,7,circleshandles,selectedShapeId,"topleft");
    drawCircle(ctx,selectedshape.x + 15 - selectedshape.raidus  + selectedshape.raidus *2,selectedshape.y - 15 - selectedshape.raidus,7,circleshandles,selectedShapeId,"topright");
    drawCircle(ctx,selectedshape.x - 15 - selectedshape.raidus,selectedshape.y + 15 + selectedshape.raidus,7,circleshandles,selectedShapeId,"bottomleft");
    drawCircle(ctx,selectedshape.x + 15 - selectedshape.raidus  + selectedshape.raidus *2,selectedshape.y + 15 + selectedshape.raidus ,7,circleshandles,selectedShapeId,"bottomright");  
}
    
}
    
}

async function  getExistingshapes(roomId : string){
    const res = await axios.get(`http://playboard.byadi.me/api/chats/${roomId}`);
    
    if(!res.data){
        return []
    }
    const messages = res.data;
    const shapes = messages.map((e : {id:number,message: string})=> {
        const parsedData = JSON.parse(e.message);
        parsedData.shape.id = e.id
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
                return selectedshape.id
    }else{
        return null
    }
    return null
}

function ispointinshape(shape:shapes ,startx:number,starty:number,){
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

function drawCircle(ctx : CanvasRenderingContext2D,x:number, y:number, r:number,circleshandles:handles[],selectedShapeId:number,position:handles["position"]){
  ctx.beginPath();
  ctx.arc(x, y, r, 0,6.28);
  ctx.fillStyle = "#000000";
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgb(255,158,255)";
  ctx.stroke();
  circleshandles.push({x, y, r,id:selectedShapeId,position})
  
}

function ishandleclicked(circleshandles:handles[],startx:number,starty:number){
    for(const h of circleshandles){
        if (insidehandle(h, startx, starty)) {
            return h.position; 
        }
    }
    return null
}
function insidehandle(shape:handles ,startx:number,starty:number,){
    if(shape){
        const dx = startx - shape.x;
        const dy = starty - shape.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= shape.r
    }
    return false;   
}

function getCanvasCoords(canvas: HTMLCanvasElement, e: MouseEvent) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

function sizingcal(startx:number,starty:number,endx:number,endy:number){
    const width = endx - startx;
    const height = endy - starty
    return {height,width}
}