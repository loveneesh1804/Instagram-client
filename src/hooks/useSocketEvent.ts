import { useEffect } from "react";
import { Socket } from "socket.io-client";

export const useSocketEvents = (
  socket: Socket,
  handlers : {[key : string] : (...args: any[]) => void}
) => {
  useEffect(() => {
    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, [socket,handlers]);
};
