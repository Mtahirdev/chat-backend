import { body } from "express-validator";

const PasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required")
    .isLength({ min: 8 })
    .withMessage("Current password must be at least 8 characters"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters"),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .isLength({ min: 8 })
    .withMessage("Confirm password must be at least 8 characters")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

export default PasswordValidation;
