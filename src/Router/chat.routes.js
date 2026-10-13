import express from "express";
import ConversationValidator from "../validator/addconversation.validator.js";
import {
  GetMsg,
  SendMsg,
  SetConversation,
} from "../Controller/chat.controller.js";

let ChatRouter = express.Router();

ChatRouter.post(
  "/chat/addconversation",
  express.json(),
  ConversationValidator,
  SetConversation,
);

ChatRouter.post("/chat/getmessage", express.json(), GetMsg);
ChatRouter.post("/chat/sendmessage", express.json(), SendMsg);

export default ChatRouter;
