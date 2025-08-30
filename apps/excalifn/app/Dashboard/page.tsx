"use client"
import { Button } from "@/components/Button";
import axios from "axios";
import { useRouter } from 'next/navigation'
import { useState } from "react";

export default function  Dashboard() {

  const [input,setinput] = useState("");
  const router = useRouter()
  const [disable,setdisable] = useState(false); 

  const Createroom = async()=>{
    setdisable(true);
    try{
    const response = await axios.post("http://localhost:3001/create-room",{
    name:input
    },{
    headers: {
      Authorization:localStorage.getItem("jwtToken")
    }
  });
     if (response.status === 200) {
      setdisable(false);
      console.log(response.data);
        // router.push(`/canvas/${response.data}`)
     }

    }catch(e){
      console.log(e);
    }
  }

  const Joinroom =async()=>{
      setdisable(true);
    try{
      const response = await axios.get(`http://localhost:3001/room/${input}`)
      if(response.data){
        setdisable(false);
        router.push(`/canvas/${response.data.id}`)
      }
    }catch(e){
      setdisable(false);
      console.log(e);
    }
  }

  return (
    <>
      <div className="w-full flex justify-center items-center h-screen bg-gradient-to-b from-[#120066] from-[-54.58%] to-black">
        <div className="flex justify-center items-center bg-white/10 backdrop-blur-lg border border-white/20 w-[600px] h-[450px] rounded-lg shadow-lg">
          <div className="flex flex-col w-[600px]  items-center h-full p-12">
                <input onChange={(e)=>setinput(e.target.value)} className="focus:outline-none focus:ring-0 h-[55px]  border-2 px-2 text-white border-white/10 w-full rounded-md" type="text" />
                <div className="flex w-[300px] gap-2 justify-center items-center mt-4 ">
                <Button btndisable={disable} btnfunction={Createroom} btnscale={false} btnsize="medium" prop="blue" content={disable? "...":'create'}/>
                <Button btndisable={disable} btnscale={false} btnfunction={Joinroom} btnsize="medium" prop="blue" content={disable?"...":"Join"}/>
                </div>
                <div className="border-white/10 h-full w-full border rounded-md mt-[20px] "></div>
          </div>
        </div>
      </div>
    </>
  );
}