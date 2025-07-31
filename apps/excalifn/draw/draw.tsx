import axios from "axios"

type shapes ={
    type:"rect",
    x:number,
    y:number,
    width:number,
    height:number
} | {
    type:"circle",
    x:number,
    y:number,
    raidus:number
}

export default async function intindraw(canvas:HTMLCanvasElement,roomId:string,WebSocket:WebSocket){
    console.log(roomId);
    const existing: shapes[] = await getExistingshapes(roomId); 
    console.log(existing);

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
                console.log(parsedmsg.shape)
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
                console.log(existing);
        })
        canvas.addEventListener("mouseup",(e)=>{
             clicked = false
             const width = e.clientX-startx;
             const height = e.clientY-starty;
             const shape:shapes = {
                type:"rect",
                x:startx,
                y:starty,
                height,
                width
             }
             existing.push(shape);
             WebSocket.send(JSON.stringify({
                type:"chat",
                message:JSON.stringify({shape}),
                roomId
             }));

        })
        canvas.addEventListener("mousemove",(e)=>{
            if(clicked){
                const width = e.clientX-startx;
                const height = e.clientY-starty;
                clearcanvas(existing,canvas,ctx)
                ctx.strokeStyle = "rgb(255,255,255)";
                ctx.strokeRect(startx,starty,width,height);
            }
        }) 
}
}

function clearcanvas(exisitingshapes:shapes[], canvas:HTMLCanvasElement ,ctx:CanvasRenderingContext2D){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle ="rgb(0,0,0)";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    exisitingshapes.map((shapes)=>{
        if(shapes.type == "rect"){
            ctx.strokeStyle = "rgb(255,255,255)";
        ctx.strokeRect(shapes.x,shapes.y,shapes.width,shapes.height);
        }
    })
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