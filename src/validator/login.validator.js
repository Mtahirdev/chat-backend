import { body } from "express-validator";

let LoginValidator = [
  body("email").trim().isEmail().withMessage("Enter a valid email"),
  body("password")
    .trim()
    .isLength({ min: 8, max: 8 })
    .withMessage("Password must be 8 character"),
];

export default LoginValidator;
