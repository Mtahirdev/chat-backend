import { body } from "express-validator";

let LoginValidator = [
  body("email").trim().isEmail().withMessage("Enter a valid email"),
  body("password")
    .trim()
    .isLength({ max: 6 })
    .withMessage("Password must be four character"),
];

export default LoginValidator;
