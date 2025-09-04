import { WebSocketServer } from 'ws';
import Jwt, { JwtPayload }  from 'jsonwebtoken';
import WebSocket from 'ws';
import {prismaClient} from "@repo/db/clients"
require('dotenv').config();
interface user{
  ws:WebSocket,
  rooms:number[],
  userId:number
}

const users:user[]=[];


const wss = new WebSocketServer({ port: 8090 });

function checkuser(token : string) : number | null{
  const response = Jwt.verify(token,process.env.JWT_SECRET as string)
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
  
    if(!token){
      ws.close()
      return 
    }
    const userId = checkuser(token)
    if(!userId){
      ws.close();
      return 
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
    if(user){
    const room = Number(parsedData.roomId)
    user?.rooms.push(room);
    }
  }

  if(parsedData.type == "leave_room"){
    const user = users.find(x => x.ws == ws)
    if(!user){
      return
    }
      const room = Number(parsedData.room)
    user.rooms = user?.rooms.filter(x => x !== room);
  }

  if(parsedData.type == "chat"){
    const roomId = parsedData.roomId
    const message = parsedData.message
    const parsemsg = JSON.parse(message)
    const tempid = parsemsg.shape.id
    const roomno = Number(roomId)
    const  shape = await prismaClient.chat.create({
      data:{
        roomid:roomno,
        message:message,
        userId,
      }
    })
    console.log(shape.id);

    users.forEach(user =>{
      if(user.rooms.includes(roomno)){
        user.ws.send(JSON.stringify({
          type:"chat",
          roomId:roomno,
          message:message,
          id:shape.id,
          tempid : tempid
        }))
      }
    })
  }

  if(parsedData.type == "move_shape"){
    const roomId = parsedData.roomId
    const message = parsedData.message
    const parsemsg = JSON.parse(message)
    const shapid = parsemsg.shape.id
    const roomno = Number(roomId)
    console.log(parsedData)
    const  shape = await prismaClient.chat.update({
      where:{
        id:shapid
      },
      data:{
        message:message,
      }
    })

    users.forEach(user =>{
      if(user.rooms.includes(roomno)){
        user.ws.send(JSON.stringify({
          type:"move_shape",
          roomId:roomno,
          message:message,
          id:shape.id,
        }))
      }
    })
  }

  });
  

});