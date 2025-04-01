import { Socket } from "socket.io-client";
import React, { createContext, useContext, useMemo } from "react";
import io from "socket.io-client";

export const SocketContext = createContext<Socket | {}>({});

export const SocketProvider = ({children}: { children: React.ReactNode })=>{
    const socket = useMemo(()=>(
        io(process.env.REACT_APP_SERVER as string,{withCredentials: true})
    ),[]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}

export const GetSocket = () => useContext(SocketContext) as Socket;
