import express  from "express";
import jwt from "jsonwebtoken";
import { Middleware } from "./middleware";
import {CreateUserSchema} from "@repo/common-package/types"

const app = express();

app.use(express.json())

app.get("/signUp",(req,res)=>{

    const zodvalidation = CreateUserSchema.safeParse(req.body);
    if(!zodvalidation.success){
        res.status(403).json({
            msg:"invalid inputs"
        })
        return
    }else{
        const [username,password]  =req.body;

    }
})

app.get("/signIn",(req,res)=>{
    const zodvalidation = CreateUserSchema.safeParse(req.body);
    if(!zodvalidation.success){
        res.status(403).json({
            msg:"invalid inputs"
        })
        return
    }else{

    const [username,password]  =req.body;
    const secert = process.env.JWT_SECRET as string;
    const token = res.send("hlw")
    jwt.sign({
        username
    },secert)
    res.json(token)
}
    
})

app.get("/create-room",Middleware,(req,res)=>{

    res.send("hlw")
})

app.listen(3001);