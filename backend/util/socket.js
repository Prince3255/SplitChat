import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import express from "express";
import { group } from "console";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
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
    const callerSocketId = userSocketMap[data.from];
    if (callerSocketId) {
      io.to(callerSocketId).emit("answer", {
        from: data.from,
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

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getOnlineUser", Object.keys(userSocketMap));
  });

});

const PORT = 3000;

server.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});

export { io, app, server };
