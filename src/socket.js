import { Server } from "socket.io";
import UserModel from "./Models/user.model.js";
import MessageModel from "./Models/message.model.js";
import ConversationModel from "./Models/conversation.model.js";

export let io;

const userSocketMap = {};
const activeCalls = {};
const callTimeouts = {};

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
      try {
        if (userSocketMap[userId] === socket.id) {
          delete userSocketMap[userId];

          const user = await UserModel.findById(userId);
          if (user) {
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
          }
        }
      } catch (err) {
        console.error("disconnect error:", err);
      }

      // Always clean up call state, even if DB failed
      const other = activeCalls[userId];
      if (other) {
        const otherSocket = userSocketMap[other];
        if (otherSocket) io.to(otherSocket).emit("call:end", { from: userId });
        delete activeCalls[other];
        delete activeCalls[userId];
      }
      if (callTimeouts[userId]) {
        clearTimeout(callTimeouts[userId]);
        delete callTimeouts[userId];
      }

      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });

    socket.on("handelseen", async (props) => {
      try {
        await MessageModel.updateMany(
          { conversationId: props.conversationId, seen: false },
          { $set: { seen: true } },
        );

        const conversation = await ConversationModel.findById(
          props.conversationId,
        );
        if (!conversation) return;

        const messagearray = await MessageModel.find({
          _id: { $in: conversation.messages },
        });

        const socketid = userSocketMap[props.receiverId];
        if (socketid) io.to(socketid).emit("message-read", messagearray);
      } catch (err) {
        console.error("handelseen error:", err);
      }
    });

    // ================= CALL SIGNALING =================

    socket.on("call:offer", ({ to, offer, isVideo }) => {
      if (!to || !offer) return;

      if (activeCalls[to]) {
        socket.emit("call:failed", { reason: "User is busy" });
        return;
      }

      const targetSocket = userSocketMap[to];
      if (!targetSocket) {
        socket.emit("call:failed", { reason: "User is offline" });
        return;
      }

      activeCalls[userId] = to;
      activeCalls[to] = userId;

      io.to(targetSocket).emit("call:offer", {
        from: userId,
        offer,
        isVideo: !!isVideo,
      });

      // Fail-safe: auto-expire if nobody answers in 60s
      callTimeouts[userId] = setTimeout(() => {
        if (activeCalls[userId] === to) {
          delete activeCalls[userId];
          delete activeCalls[to];
          delete callTimeouts[userId];
          socket.emit("call:failed", { reason: "No answer" });
          const ts = userSocketMap[to];
          if (ts) io.to(ts).emit("call:end", { from: userId });
        }
      }, 60000);
    });

    socket.on("call:answer", ({ to, answer }) => {
      console.log(
        "answer: to=",
        to,
        "timerExists=",
        !!callTimeouts[to],
        "keys=",
        Object.keys(callTimeouts),
      );
      if (callTimeouts[to]) {
        clearTimeout(callTimeouts[to]);
        delete callTimeouts[to];
      }
      const targetSocket = userSocketMap[to];
      if (targetSocket) {
        io.to(targetSocket).emit("call:answer", { from: userId, answer });
      }
    });

    socket.on("call:ice-candidate", ({ to, candidate }) => {
      const targetSocket = userSocketMap[to];
      if (targetSocket) {
        io.to(targetSocket).emit("call:ice-candidate", {
          from: userId,
          candidate,
        });
      }
    });

    socket.on("call:reject", ({ to }) => {
      if (callTimeouts[userId]) {
        clearTimeout(callTimeouts[userId]);
        delete callTimeouts[userId];
      }
      const targetSocket = userSocketMap[to];
      if (targetSocket) {
        io.to(targetSocket).emit("call:rejected", { from: userId });
      }
      delete activeCalls[userId];
      delete activeCalls[to];
    });

    socket.on("call:end", ({ to }) => {
      if (callTimeouts[userId]) {
        clearTimeout(callTimeouts[userId]);
        delete callTimeouts[userId];
      }
      const targetSocket = userSocketMap[to];
      if (targetSocket) {
        io.to(targetSocket).emit("call:end", { from: userId });
      }
      delete activeCalls[userId];
      delete activeCalls[to];
    });
  });

  return io;
};

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];
