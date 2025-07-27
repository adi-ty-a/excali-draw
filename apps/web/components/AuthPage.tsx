export function AuthPage({isSignin}:{
    isSignin:boolean 
}){
    return  <div className="w-screen h-screen justify-center items-center">
        <div className="p-6 m-2 bg-white rounded">
                <div className="p-2"><input type="text" placeholder="email"/></div>
                <div className="p-2"><input type="password" placeholder="passowrd"/></div>
                <div className="p-2"><button>{isSignin === true ? "signin" :"signup" }</button></div>
            </div>
        </div>
}