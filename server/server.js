import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "http://127.0.0.1:5173",
    },
});

io.on("connection", (socket) =>{

    socket.on("onMessage", (data) => {
        socket.broadcast.emit("onMessage", data)
    })

    socket.on("disconnect", () => console.log("disconnected"))
})

httpServer.listen(8080, ()=> console.log("listening at 8080`"));