import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

type decode = {
    id: number
}

export function Middleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization ?? "";
    if (!token) {
        return res.status(403).json({
            msg: "login first"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as decode;
        if (decoded && decoded.id) {
            req.userid = decoded.id;
            next();
        } else {
            return res.status(403).json({
                msg: "incorrect token"
            });
        }
    } catch (e) {
        return res.status(403).json({
            msg: "invalid or expired token"
        });
    }
}