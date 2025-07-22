import {z} from "zod"

export const CreateUserSchema = z.object({
    username:z.string().max(30).min(5),
    password:z.string().max(30).min(5),
    name:z.string().max(30).min(5)
    })

export const SiginSchema = z.object({
    username:z.string().max(30).min(5),
    password:z.string().max(30).min(5)
    })    

export const CreateRoomSchema = z.object({
    name:z.string().min(3).max(20)
})