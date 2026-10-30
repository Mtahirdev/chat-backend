import mongoose from "mongoose";

let group_Scheme = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel",
        required: true,
      },
    ],
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  {
    timestamps: true,
  },
);
