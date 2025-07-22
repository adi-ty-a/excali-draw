import { WebSocketServer } from 'ws';
import Jwt, { JwtPayload }  from 'jsonwebtoken';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws,request) {
    const url = request.url;
    if(!url){
      return
    }
    const queryurl = new URLSearchParams(url.split("?")[1]);
    const token = queryurl.get("token") || "";
    const response = Jwt.verify(token,process.env.JWT_SECRET as string)
    if(!response || !(response as JwtPayload).userid){
      ws.close()
      return 
    }

  ws.on('message', function message(data) {
    ws.send('something');
  });


});