import { serve } from "https://deno.land/std@0.150.0/http/server.ts";
import { Server } from "https://deno.land/x/socket_io@0.1.1/mod.ts";

const io = new Server();
let users: string[] = [];

function makePeer(socketId: string): void {
  if (!users.includes(socketId)) {
    users.push(socketId);
  }

  if (users.length === 2) {
    io.to(users[0]).emit('peer', { strangerId: users[1], polite: true });
    io.to(users[1]).emit('peer', { strangerId: users[0], polite: false });
    users = []; 
  }
}

io.on("connection", (socket) => {
  console.log('A user connected');

  socket.on('connectPeer', () => makePeer(socket.id));

  socket.on('message', (m: { to: string; content: string }) => {
    io.to(m.to).emit('message', m);
  });

  socket.on('disconnect', () => {
    users = users.filter(id => id !== socket.id);

    if (users.length > 0) {
      io.to(users[0]).emit('strangerLeft');
    }
  });
});

await serve(io.handler(), {
  port: 3000,
});
