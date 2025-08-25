"use client"

import { motion } from "motion/react"

type btntype={
    prop:"blue" | "pink",
    content:string,
    btnsize:"small"|"medium" | "larger",
    btnscale:boolean,
    btndisable? : boolean
}
export const Button=({prop,content,btnsize,btnscale,btndisable}:btntype)=>{
    const btnvairant ={
        "blue":"flex flex-row justify-center items-center   text  bg-gradient-to-b from-[#2E00FF] to-[#13006C] drop-shadow-md  hover:from-[#0073ff] hover:to-[#003473] flex-none order-2 grow-0 transition duration-300",
        "pink":"flex flex-row justify-center items-center relative bg-gradient-to-b from-[#D800FF] to-[#8E009B] drop-shadow-md  z-10 shadow-[0_0_20px_rgba(216,0,255,0.7)] flex-none order-2 grow-0 text-xl font-medium text-shadow-white border-b-[1px] border-r border-l border-white hover:from-[#d94fff] hover:to-[#ff4ffc] transition duration-300"
    }
    const size ={
        "small":"w-[80px] h-[30px] p-[18px] rounded-[15px] ",
        "medium":" p-[10px] w-[175px] h-[48px] rounded-[12px]",
        "larger":"w-[300px] h-[42px] rounded-[4px]"
    }

    return (
        <motion.button 
            disabled={btndisable} 
            whileHover={btnscale ? { scale: 1.05 } : { scale: 1 }}
            transition={{
                duration:.2
            }}
            className={`${btnvairant[prop]} ${size[btnsize]}  ${
      btndisable ? "opacity-50 " : ""
    }` }>{content}</motion.button>
    )
}