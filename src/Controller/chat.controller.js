import config from "../config/config.js";
import UserModel from "../Models/user.model.js";
import { validationResult } from "express-validator";
import ConversationModel from "../Models/conversation.model.js";
import jwt from "jsonwebtoken";
import MessageModel from "../Models/message.model.js";
import { getReceiverSocketId } from "../socket.js";
import { io } from "../socket.js";

export let SetConversation = async (req, res) => {
  try {
    const token = req.cookies.refresh_token;

    if (!token) {
      return res.status(400).json({ msg_login: "please Login" });
    }

    let error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ validation: error.array()[0] });
    }

    const access_token = req.headers.authorization?.split(" ")[1];

    if (!access_token) {
      return res.status(400).json({ msg_login: "please Login" });
    }

    const decoded = jwt.verify(access_token, config.jwtsecret);

    const user = await UserModel.findById({ _id: decoded.userId });

    if (!user) {
      return res.status(400).json({ msg_signup: "please signup" });
    }
    let { email, username } = req.body;

    let finduser = await UserModel.findOne({ email });
    if (!finduser) {
      return res
        .status(400)
        .json({ not_found: "user is not found enter valid email" });
    }
    console.log(finduser);

    const senderId = user._id;
    const receiverId = finduser._id;

    // Check whether a conversation already exists
    let conversation = await ConversationModel.findOne({
      participants: { $all: [senderId, receiverId], $size: 2 },
    });

    // If not found, create a new conversation
    if (!conversation) {
      conversation = await ConversationModel.create({
        participants: [senderId, receiverId],
        messages: [],
      });
      console.log(conversation._id);

      console.log(user.conversation);

      user.conversation.push(conversation._id);
      finduser.conversation.push(conversation._id);
      await user.save();
      await finduser.save();
      // first user
      let conversationa = await ConversationModel.find({
        participants: { $in: user._id },
      });

      let id = user._id;

      let userarray = [];

      for (const ele of conversationa) {
        let arr = ele.participants;
        for (const e of arr) {
          let usera = await UserModel.findById({ _id: e });
          if (id.equals(usera._id)) {
            continue;
          } else {
            let a = { arr: usera, id: ele._id };
            userarray.push(a);
          }
        }
      }

      console.log(userarray);

      // second user
      let conversatione = await ConversationModel.find({
        participants: { $in: finduser._id },
      });

      let ida = finduser._id;

      let userarraya = [];

      for (const ele of conversatione) {
        let arr = ele.participants;
        for (const e of arr) {
          let usera = await UserModel.findById({ _id: e });
          if (ida.equals(usera._id)) {
            continue;
          } else {
            let a = { arr: usera, id: ele._id };
            userarraya.push(a);
          }
        }
      }

      console.log(userarraya);
      let receivedId = getReceiverSocketId(finduser._id);
      io.to(receivedId).emit("adduser", userarraya);
      return res.status(200).json({ success: "conversation set", userarray });
    }
    res.status(200).json({ already: "conversation already set" });
  } catch (error) {
    console.log(error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ msg: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ msg: "Token expired" });
    }
    return res.status(500).json({ msgerr: "Internal server error" });
  }
};

export let GetMsg = async (req, res) => {
  try {
    const token = req.cookies.refresh_token;

    if (!token) {
      return res.status(400).json({ msg_login: "please Login" });
    }

    const access_token = req.headers.authorization?.split(" ")[1];

    if (!access_token) {
      return res.status(400).json({ msg_login: "please Login" });
    }

    const decoded = jwt.verify(access_token, config.jwtsecret);

    const user = await UserModel.findById({ _id: decoded.userId });

    if (!user) {
      return res.status(400).json({ msg_signup: "please signup" });
    }
    let { id } = req.body;

    if (!id) {
      return res.status(400).json({ msg_id: "please give id" });
    }

    let conversation = await ConversationModel.findById({ _id: id });

    if (!conversation) {
      return res.status(400).json({ msg_notfound: "conversation not found" });
    }

    let arr = conversation.messages;

    let messagearray = [];

    for (const ele of arr) {
      let msg = await MessageModel.findById({ _id: ele });
      messagearray.push(msg);
    }
    return res
      .status(200)
      .json({ success: "message fetched", message: messagearray });
  } catch (error) {
    console.log(error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ msg: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ msg: "Token expired" });
    }
    return res.status(500).json({ msgerr: "Internal server error" });
  }
};

export let SendMsg = async (req, res) => {
  try {
    const token = req.cookies.refresh_token;

    if (!token) {
      return res.status(400).json({ msg_login: "please Login" });
    }

    const access_token = req.headers.authorization?.split(" ")[1];

    if (!access_token) {
      return res.status(400).json({ msg_login: "please Login" });
    }

    const decoded = jwt.verify(access_token, config.jwtsecret);

    const user = await UserModel.findById({ _id: decoded.userId });

    if (!user) {
      return res.status(400).json({ msg_signup: "please signup" });
    }
    let { msg, receiverid, senderid, conversationid } = req.body;

    let conversation = await ConversationModel.findById({
      _id: conversationid,
    });

    let newmsg = await MessageModel.create({
      message: msg,
      senderId: senderid,
      receiverId: receiverid,
    });

    conversation.messages.push(newmsg._id);
    await conversation.save();
    let receivedId = getReceiverSocketId(receiverid);
    io.to(receivedId).emit("message", newmsg);
    res.status(200).json(newmsg);
  } catch (error) {
    console.log(error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ msg: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ msg: "Token expired" });
    }
    return res.status(500).json({ msgerr: "Internal server error" });
  }
};
