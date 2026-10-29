import { Server } from "socket.io";
import UserModel from "./Models/user.model.js";
import MessageModel from "./Models/message.model.js";
import ConversationModel from "./Models/conversation.model.js";

export let io;

const userSocketMap = {};

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
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
    socket.on("handelseen", async (props) => {
      console.log(props, "props");

      let msg = await MessageModel.updateMany(
        { conversationId: props.conversationId, seen: false },
        { $set: { seen: true } },
      );
      console.log(msg, "msg");

      let conversation = await ConversationModel.findById(props.conversationId);

      let arr = conversation.messages;

      let messagearray = [];

      for (const ele of arr) {
        let msg = await MessageModel.findById({ _id: ele });
        messagearray.push(msg);
      }
      let socketid = userSocketMap[props.receiverId];
      console.log(socketid);

      io.to(socketid).emit("message-read", messagearray);
    });
  });

  return io;
};

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];
