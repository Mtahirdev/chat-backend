import { Server } from "socket.io";
import UserModel from "./Models/user.model.js";

export let io;

const userSocketMap = {};

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "https://chat-frontend-one.vercel.app",
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

    socket.on("disconnect", async () => {
      if (userSocketMap[userId] === socket.id) {
        let user = await UserModel.findById({ _id: userId });
        const date = new Date();

        const time = date.toLocaleTimeString("en-US", {
          timeZone: "Asia/Karachi",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        user.userarr.push(time);

        await user.save();
        io.emit("gettime", time);

        delete userSocketMap[userId];
      }

      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

  return io;
};

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];
