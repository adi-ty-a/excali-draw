import express  from "express";
import jwt from "jsonwebtoken";
import { Middleware } from "./middleware";
import {CreateRoomSchema, CreateUserSchema, SiginSchema} from "@repo/common-package/types"
import {prismaClient} from "@repo/db/clients"
import * as bcrypt from "bcrypt";
import cors from "cors"
require('dotenv').config();
const app = express();
const saltRounds = 3;

app.use(express.json())
app.use(cors());

app.post("/signUp",async(req,res)=>{

    const zodvalidation = CreateUserSchema.safeParse(req.body);
    if(!zodvalidation.success){
        res.status(403).json({
            msg:"invalid inputs"
        })
        return
    }else{
        const {username,password,email}  =req.body;
        const hash = bcrypt.hashSync(password, saltRounds);
        try{
        const response = await prismaClient.users.create({
            data:{
                name:username,
                password:hash,
                email:email
            }
        })
        res.json({
            msg:response.id
        })
    }catch(e ){
        if(e)
        console.log(e)
    return
    }
    }
    
})

app.post("/signIn",async (req,res)=>{
    const zodvalidation = SiginSchema.safeParse(req.body);

    if(!zodvalidation.success){
        res.status(403).json({
            msg:"invalid inputs"
        })
        return
    }else{

    const {username,password}  =req.body;
    const response = await prismaClient.users.findFirst({
        where:{
            name:username,
        },
        select:{
            password:true,
            id:true
        }
        
    })
    if(!response){
        res.status(403).json({
            msg:"username or db error"
        })
        return 
    }
    const hash = response.password;
    const isuser = await bcrypt.compare(password, hash);
    if(isuser === false){
        res.status(403).json({
            msg:"wrong pass"
        })
        return 
    }
    const id = response.id
    const secert = process.env.JWT_SECRET as string;
    console.log(secert);
    const token = jwt.sign({id},secert);
    res.json(token)
}
})

app.post("/create-room",Middleware,async (req,res)=>{
    const data = CreateRoomSchema.safeParse(req.body);
    if(!data.success){
        res.status(403).json({
            msg:"wrong inputs"
        })
        return 
    }
    const userid = req.userid
    if(!userid){
        res.status(403).json({
            msg:"the userid is undefined"
        })
        return 
    }
    const resposne = await prismaClient.rooms.create({
        data:{
            slug:data.data.name,
            adminId:userid
        }
    })

    res.send(resposne.id)
})

app.get("/chats/:roomId",async (req,res)=>{
    const roomid = Number(req.params.roomId);
    const message = await prismaClient.chat.findMany({
        where:{
            roomid:roomid
        },
        orderBy:{
            id:"desc"
        },
        take:50
    })
    res.json(message);

    return 
})

app.get("/chats/:slug",async (req,res)=>{
    const slug = req.params.slug
    const roomid = prismaClient.rooms.findFirst({
        where:{
            slug
        },
        select:{
            id:true
        }
    })
    if(!roomid){
        res.status(403).json({
            msg:"no room"
        })
    }
    res.json({
        roomid
    })
    return 
})

app.listen(3001);