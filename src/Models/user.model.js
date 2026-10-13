import mongoose from "mongoose";

let user_schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    required: true,
    default: "auth",
  },

  verified: {
    type: Boolean,
    required: true,
    default: false,
  },
  conversation: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
  ],
  msg: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
    },
  ],
  userarr: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },
  ],
});

let UserModel = mongoose.model("UserModel", user_schema);

export default UserModel;
