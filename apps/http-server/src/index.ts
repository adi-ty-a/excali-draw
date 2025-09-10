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
            msg:"signedup"
        })
    }catch(e : any ){
        if(e.code == "P2002"){
            res.status(409).json({
                error:'user already exist',
                feild:e.meta?.target
            })
        }
         return res.status(500).json({
        error: "Something went wrong, please try again later"
  });
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
    const {email,password}  =req.body;
    const response = await prismaClient.users.findFirst({
        where:{
            email:email,
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
    res.json({
        msg:"logged in",
        token
    })
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

app.get("/room/:slug",async(req,res)=>{
    const slug = req.params.slug;
    console.log(slug)
    const response = await prismaClient.rooms.findFirst({
        where:{
            slug:slug
        },
        select:{
            id:true
        }
    })
    if(!response){
        res.status(404).json({
            msg:"no room of this name"
        })
    }
    res.json({
        msg:"room found",
        id:response?.id
    })

})

app.get("/slug/:id",async(req,res)=>{
    const id = req.params.id;
    try{
    const response = await prismaClient.rooms.findFirst({
        where:{
            id:Number(id)
        },
        select:{
            slug:true
        }
    })
    if(!response){
        return res.status(404).json({
            msg:"no slug of this id"
        })
    }
    res.json({
        msg:"slug found",
        slug:response?.slug
    })
    }catch (err) {
    console.error(err);
    res.status(500).json({ msg: "server error" });
  }

})

app.get("/verify-token", Middleware, (req, res) => {
  res.json({ valid: true, userId: req.userid });
});
// show rooms created by user in frontend
app.get("/userRooms/:id",async (req, res) => {
    const id = req.params.id
    const rooms = await prismaClient.rooms.findMany({
    where:{
        adminId:Number(id)
    },
    select:{
        slug:true
    },
    orderBy:{slug: 'asc'}
    })
    res.json({
        data:rooms
    });
});

app.get("/closeroom/:slug")

app.listen(3001);