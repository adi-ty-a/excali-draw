"use client"
import { Button } from "@/components/Button";
import { Card } from "@/components/Cards";
import axios, { AxiosError } from "axios";
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react";

export default function  Dashboard() {

  const [input,setinput] = useState("");
  const router = useRouter()
  const [disable,setdisable] = useState(false); 
  const [loading,setloading] = useState(true);
  const [rooms,setrooms] = useState<null | {slug:string}[]>(null)
  const [userid,setuserid] = useState<number | null>(null)
  const [newerror,seterror]= useState<null | string>(null)
  useEffect( ()=>{
    const checkauth =async()=>{
      const token = localStorage.getItem("jwtToken")
      if(!token){
        router.push('/Signin')
      }
      try{
         const res = await axios.get(process.env.HTTP_URL+"/verify-token",{
          headers: { Authorization: token },
        });
        const resid = res.data.userId
        setuserid(resid)
        setloading(false)
        if(resid !== null){
          const roomres = await axios.get(`${process.env.HTTP_URL}/userRooms/${resid}`)
          if(roomres){
            setrooms(roomres.data.data);
            
          }
        }
      }catch(e){
        localStorage.removeItem("jwtToken");
        router.push("/")
      }
    }
    checkauth()
    
  },[router])

  const Createroom = async()=>{

    setdisable(true);
    try{
      const slugifiedInput = input.trim().replace(/\s+/g, "-");
    const response = await axios.post(process.env.HTTP_URL+"/create-room",{
    name:slugifiedInput
    },{
    headers: {
      Authorization:localStorage.getItem("jwtToken")
    }
  });

     if (response.status === 200) {
      setdisable(false);
      router.push(`/canvas/${response.data}`)
     }

    }catch(e){
      console.log(e);
    }
  }

  const Joinroom =async(value?:string|undefined)=>{
      setdisable(true);
    try{
      let responsed =null
      if(value !== undefined){ 
     
         responsed = await axios.get(`${process.env.HTTP_URL}/room/${value}`)
      }else{
         responsed = await axios.get(`${process.env.HTTP_URL}/room/${input}`)
      }
      if(responsed.data){
        setdisable(false);
        setrooms(null)
        router.push(`/canvas/${responsed.data.id}`)
      }
    }catch(e){
      if (axios.isAxiosError(e)) {
    seterror(e.response?.data?.msg || "Something went wrong");
  } else {
    console.error(e);
  }
    }
  }
  const deleteroom=async(slug:string)=>{
    await axios.get(`${process.env.HTTP_URL}/closeroom/${slug}`);
    const roomres = await axios.get(`${process.env.HTTP_URL}/userRooms/${userid}`)
          if(roomres){
            setrooms(roomres.data.data);
          }
  }

  const logout=()=>{
    localStorage.removeItem("jwtToken");
    router.push("/Signin")
  }

  return (
    <>
      <div className="w-full flex justify-center items-center h-screen bg-gradient-to-b from-[#120066] from-[-54.58%] to-black">
        <div className="absolute right-52 top-12">
        <Button btndisable={false} btnfunction={logout} btnscale={true} btnsize="small" prop="blue" content="Logout"/> 
        </div>
        <div className="flex justify-center items-center bg-white/10 backdrop-blur-lg border border-white/20 w-[600px] h-[450px] rounded-lg shadow-lg">
        {loading === true ? <div className="text-white"> Checking authentication ... </div> :  <div className="flex flex-col w-[600px]  items-center h-full px-12 py-10">
                <input placeholder="Enter room name" onChange={(e)=>setinput(e.target.value)} className="focus:outline-none focus:ring-0 h-[55px]  border-2 px-2 text-white border-white/10 w-full rounded-md" type="text" />
                <div className="flex w-[300px] gap-2 justify-center items-center mt-4 ">
                <Button btndisable={disable} btnfunction={()=>Createroom()} btnscale={false} btnsize="medium" prop="blue" content={disable? "...":'create'}/>
                <Button btndisable={disable} btnscale={false} btnfunction={()=>Joinroom()} btnsize="medium" prop="blue" content={disable?"...":"Join"}/>
                </div>
                <div className="flex items-start px-2 mt-[10px] w-full justify-between ">
                  <h1 className="text-white/40">Previous</h1> 
                  <h1 className="text-red-400/70">{newerror}</h1>
                </div>
                <div className="border-white/10 h-[400px] w-full border rounded-md mt-[10px] p-2 flex flex-col gap-2 overflow-y-scroll">
                {rooms !== null && rooms.map((e:{slug:string})=>{
                  return <Card key={e.slug} roomname={e.slug} joinfuntion={()=>Joinroom(e.slug)} deleterm={()=>deleteroom(e.slug)} />
                })}
                </div>
          </div> }
        </div>
      </div>
    </>
  );
}