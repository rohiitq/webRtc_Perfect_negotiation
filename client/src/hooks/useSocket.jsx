import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { handelMessage } from "../utils/socketRoutes";

export default function useSocket(peerConnection, stream) {
    const [socket, setSocket] = useState(null)

    useEffect(() => {
        const socketInstance = io("http://localhost:8080", {
            transports: ['websocket'],
        })
        setSocket(socketInstance)

        return () => {
            socketInstance.close()
            setSocket(null)
        }
    }, [])

    useEffect(() => {
        if (socket) {
            
            socket.on("message", handelMessage)

            return () => {
                socket.off("connected")
            }
        }
    }, [socket])

}