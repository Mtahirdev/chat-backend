import express from "express";
import ConversationValidator from "../validator/addconversation.validator.js";
import {
  GetMsg,
  SendMsg,
  SetConversation,
  uploadVoice,
} from "../Controller/chat.controller.js";
import multer from "multer";

let ChatRouter = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 1 * 1024 * 1024, // 10 MB per file
    files: 2,
  },
});

ChatRouter.post(
  "/chat/addconversation",
  express.json(),
  ConversationValidator,
  SetConversation,
);

ChatRouter.post("/chat/getmessage", express.json(), GetMsg);
ChatRouter.post(
  "/chat/sendmessage",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  SendMsg,
);

export default ChatRouter;
