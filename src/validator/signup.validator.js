import { body } from "express-validator";

let SignupValidation = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username must be required")
    .isLength({ min: 5, max: 15 })
    .withMessage("Username must me 5 character"),
  body("email").trim().isEmail().withMessage("Please enter valid email"),
  body("password")
    .trim()
    .isLength({ max: 6 })
    .withMessage("Password must be four character"),
  // body("confirmPassword")
  //   .trim()
  //   .notEmpty()
  //   .withMessage("Confirm password is required")
  //   .custom((value, { req }) => {
  //     // Check if confirmPassword matches password
  //     if (value !== req.body.password) {
  //       throw new Error("Passwords do not match");
  //     }
  //     // Return true if they match to indicate the validation passed
  //     return true;
  //   }),
];

export default SignupValidation;
