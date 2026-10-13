import { Server } from "socket.io";

export let io;

const userSocketMap = {};

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin:
        process.env.FRONTEND_URL || "https://chat-frontend-two-psi.vercel.app",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    const userId = socket.handshake.query.userId;

    if (userId && userId !== "undefined") {
      userSocketMap[userId] = socket.id;
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
      }

      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

  return io;
};

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];
