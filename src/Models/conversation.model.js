import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
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
    type: {
      type: String,
      default: "double",
    },
  },
  {
    timestamps: true,
  },
);

const ConversationModel = mongoose.model("Conversation", ConversationSchema);

export default ConversationModel;
