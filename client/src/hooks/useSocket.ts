import { useContext } from "react";
import { SocketContext, type SocketContextValue } from "../contexts/SocketContext";

export const useSocket = (): SocketContextValue => {
    const context = useContext(SocketContext);
    return context || { socket: null, connected: false };
};
