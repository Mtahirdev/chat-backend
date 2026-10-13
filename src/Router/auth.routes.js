import express from "express";
import SignupValidation from "../validator/signup.validator.js";
import {
  LoginFun,
  OtpFun,
  RequesOtp,
  SignupFun,
  RefreshToken,
  Getme,
  Logout,
} from "../Controller/auth.controller.js";
import LoginValidator from "../validator/login.validator.js";

let AuthRouter = express.Router();

AuthRouter.post("/auth/signup", express.json(), SignupValidation, SignupFun);
AuthRouter.post("/auth/verify-otp", express.json(), OtpFun);
AuthRouter.get("/auth/request-otp", express.json(), RequesOtp);
AuthRouter.post("/auth/login", express.json(), LoginValidator, LoginFun);

AuthRouter.get("/auth/refresh-token", RefreshToken);

AuthRouter.get("/auth/getme", Getme);

AuthRouter.get("/auth/logout", Logout);
export default AuthRouter;
