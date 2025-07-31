import { Roomcanvas } from "@/components/Room";

type param= Promise<{ roomid: string }>

export default async function Canvas({
    params
}:{
    params:param
}){
    const {roomid} = await params;
    console.log(roomid);
    return <Roomcanvas roomid={roomid} />
}
