import jwt  from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
import { Request,Response,NextFunction} from "express";
// interface midreq extends Request{
//    userid:string
// }

type decode ={
    id:number 
}

export function Middleware(req : Request,res:Response,next : NextFunction){
    const token = req.headers.authorization?? "";
    if( token !== ""){
    const decoded :decode = jwt.verify(token as string, process.env.JWT_SECRET as string) as decode
    if(decoded){
        req.userid = decoded.id ;
        next();
    } else{
        res.status(403).json({
            msg:"incorrert token"
        })
    }
    }else{
         res.status(403).json({
            msg:"login first"
        })
    }
    
}