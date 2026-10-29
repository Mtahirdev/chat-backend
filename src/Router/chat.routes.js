import express from "express";
import ConversationValidator from "../validator/addconversation.validator.js";
import PasswordValidation from "../validator/PasswordValidation.js";
import {
  ChangePassword,
  GetMsg,
  SendMsg,
  SetConversation,
  SetProfileimg,
  SetUsername,
  uploadVoice,
} from "../Controller/chat.controller.js";
import multer from "multer";

let ChatRouter = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 3 * 1024 * 1024, // 10 MB per file
    files: 2,
  },
});

const uploadFields = upload.fields([
  { name: "audio", maxCount: 1 },
  { name: "file", maxCount: 1 },
]);

const handleUpload = (req, res, next) => {
  uploadFields(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          msgerr: "File size must not exceed 3 MB.",
        });
      }

      return res.status(400).json({
        msgerr: `Upload failed: ${err.message}`,
      });
    }

    if (err) {
      return res.status(500).json({
        msgerr: "An error occurred while uploading the file.",
      });
    }

    next();
  });
};

ChatRouter.post("/chat/sendmessage", handleUpload, SendMsg);

ChatRouter.post(
  "/chat/addconversation",
  express.json(),
  ConversationValidator,
  SetConversation,
);

ChatRouter.post("/chat/getmessage", express.json(), GetMsg);

ChatRouter.post("/chat/setimg", upload.single("img"), SetProfileimg);

ChatRouter.post("/chat/setusername", express.json(), SetUsername);

ChatRouter.post(
  "/chat/setpassword",
  express.json(),
  PasswordValidation,
  ChangePassword,
);

// ChatRouter.post(
//   "/chat/sendmessage",
//   upload.fields([
//     { name: "audio", maxCount: 1 },
//     { name: "file", maxCount: 1 },
//   ]),
//   SendMsg,
// );

export default ChatRouter;
