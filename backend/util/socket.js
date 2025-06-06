import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
const server = http.createServer(app);
const allowedOrigins = [
  'https://splitchat.vercel.app',
  'http://localhost:5173' // for local testing
];
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    transports: ["websocket", "polling"],
  },
  path: "/socket.io",
});

const userSocketMap = {};
const groups = new Map();

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUser", Object.keys(userSocketMap));

  socket.on("join-group", (groupId) => {
    socket.join(groupId);
    groups.set(groupId, (groups.get(groupId) || []).concat(socket.id));
  });

  socket.on("leave-group", (groupId) => {
    socket.leave(groupId);
    const memberId = groups.get(groupId);
    if (memberId) {
      groups.set(
        groupId,
        memberId.filter((id) => id !== socket.id)
      );
      if (memberId.size === 0) {
        groups.delete(groupId);
      }
    }
  });

  socket.on("incoming-call", ({ id, from, name, profilePicture }) => {
    const receiverSocketId = userSocketMap[id];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incoming-call", { id, name, profilePicture, from });
    }
  });

  socket.on("already-on-call", (data) => {
    const receiverSocketId = userSocketMap[data.from];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("already-on-call", data.username);
    }
  })

  socket.on("accept-click", ({ id1, id }) => {
    const receiverSocketId = userSocketMap[id1];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("accept-click", { id1, id });
    } 
  })

  socket.on("decline-click", ({ id1 }) => {
    const receiverSocketId = userSocketMap[id1];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("decline-click", { id1 });
    }
  })

  socket.on("offer", (data) => {
    console.log("offer ", data);
    const receiverSocketId = userSocketMap[data.to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("offer", {
        from: data.callerId,
        offer: data.offer
      })
    }
  })

  socket.on("answer", (data) => {
    console.log("data ", data);
    let callerSocketId = null
    if (data.to == data.id) {
      callerSocketId = userSocketMap[socket.id] 
    }
    else {
      callerSocketId = userSocketMap[data.to];
    }
    if (callerSocketId) {
      io.to(callerSocketId).emit("answer", {
        from: data.to,
        answer: data.answer
      })
    }
  })

  socket.on("ice-candidate", (data) => {
    const targetSocketId = userSocketMap[data.id]
    if (targetSocketId) {
      io.to(targetSocketId).emit("ice-candidate", {
        candidate: data.candidate
      })
    }
  })

  socket.on("error-caller", (data) => {
    const targetSocketId = userSocketMap[data.to]
    if (targetSocketId) {
      io.to(targetSocketId).emit("error-caller", {
        error: data.error
      })
    }
  })

  socket.on("delete-message", (data) => {
    const targetSocketId = userSocketMap[data.id]
    if (targetSocketId) {
      io.to(targetSocketId).emit("delete-message", {
        msgId: data.msgId
      })
    }
  })

  socket.on("error-reciever", (data) => {
    const targetSocketId = userSocketMap[data.to]
    if (targetSocketId) {
      io.to(targetSocketId).emit("error-reciever", {
        error: data.error
      })
    }
  })

  socket.on('end-call', (data) => {
    const receiverSocketId = userSocketMap[data.to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('end-call');
    }
  })

  socket.on('end-call-by-caller', (data) => {
    const receiverSocketId = userSocketMap[data.to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('end-call-by-caller');
    }
  })

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getOnlineUser", Object.keys(userSocketMap));
  });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});

export { io, app, server };
