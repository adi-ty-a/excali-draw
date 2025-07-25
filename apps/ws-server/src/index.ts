import { WebSocketServer } from 'ws';
import Jwt, { JwtPayload }  from 'jsonwebtoken';
import WebSocket from 'ws';
import {prismaClient} from "@repo/db/clients"
require('dotenv').config();
interface user{
  ws:WebSocket,
  rooms:String[],
  userId:number
}

const users:user[]=[];


const wss = new WebSocketServer({ port: 8080 });

function checkuser(token : string) : number | null{
  const response = Jwt.verify(token,process.env.JWT_SECRET as string)
  console.log(response);
  if(typeof response === "string"){
    return null
  }
  if(!response || !(response as JwtPayload).id){
    return null
  }
  return response.id;
}

wss.on('connection', function connection(ws,request) {
    const url = request.url;
    if(!url){
      return
    }
    
    const queryurl = new URLSearchParams(url.split("?")[1]);
    const token = queryurl.get("token") || "";
    const userId = checkuser(token)
    if(!userId){
      ws.close();
      return null
    }
    
  users.push({
    userId:userId,
    ws,
    rooms:[]
  })
  
  ws.on('message', async function message(data) {
  const parsedData = JSON.parse(data as unknown as string);

  if(parsedData.type == "join_room"){
    const user = users.find(x => x.ws == ws)
    user?.rooms.push(parsedData.room);
  }

  if(parsedData.type == "leave_room"){
    const user = users.find(x => x.ws == ws)
    if(!user){
      return
    }
    user?.rooms.filter(x => x == parsedData.room);
  }

  if(parsedData.type == "chat"){
    const roomId = parsedData.room
    const message = parsedData.message
    const roomno = Number(roomId)
    console.log(typeof roomno);
    await prismaClient.chat.create({
      data:{
        roomid:roomno,
        message:message,
        userId

      }
    })

    users.forEach(user =>{
      if(user.rooms.includes(roomId)){
        user.ws.send(JSON.stringify({
          type:"chat",
          roomId:roomId,
          message:message
        }))
      }
    })
  }
  });
  

});