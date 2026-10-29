import mongoose from "mongoose";

// possible types

// text

// text with img

// text with video

// text

const MessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    audiourl: {
      type: String,
      default: "",
    },
    attachedfileurl: {
      type: String,
      default: "",
    },
    msg: {
      type: String,
      required: true,
    },
    seen: {
      type: Boolean,
      default: false,
    },
    delivered: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const MessageModel = mongoose.model("Message", MessageSchema);

export default MessageModel;
