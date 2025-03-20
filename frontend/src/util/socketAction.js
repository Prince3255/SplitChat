import { setOnlineUsers } from "../redux/user/userSlice";
import { io } from "socket.io-client";

const BASE_URL =
import.meta.env.VITE_NODE_ENV === "development"
? "http://localhost:3000"
: "/";

let socket = null;

export const connectSocket = (userId) => (dispatch) => {
  if (socket && socket?.connected) return socket

  socket = io(BASE_URL, {
    path: "/socket.io",
    query: { userId },
    transports: ["websocket"],
    withCredentials: true,
  });

  socket.on("connect", () => {
    // console.log("Socket connected:", socket.id);
  });

  socket.on("getOnlineUser", (users) => {
    dispatch(setOnlineUsers(users));
  });

  socket.on('disconnect', () => {
    console.log('socket disconnect')
  })
};

export const disconnectSocket = () => {

  if (socket && socket?.connected) {
    socket.disconnect();
    socket = null
  }
};

export const getSocket = () => socket;