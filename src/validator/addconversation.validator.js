import { body } from "express-validator";

let ConversationValidator = [
  body("username").trim().notEmpty().withMessage("username is required"),
  body("email").trim().isEmail().withMessage("Enter a valid email"),
];

export default ConversationValidator;
