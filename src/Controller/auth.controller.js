import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import UserModel from "../Models/user.model.js";
import OTP from "../Models/otp.model.js";
import Session from "../Models/session.model.js";
import { sendEmail } from "../services/email.services.js";
import config from "../config/config.js";
import jwt from "jsonwebtoken";
import { emailTemplate, generateotp } from "../utils/utils.js";
import crypto from "crypto";
import ConversationModel from "../Models/conversation.model.js";
import mongoose from "mongoose";

export let SignupFun = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const token_cookie = req.cookies.refresh_token;

    let error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ msg_validation: error.array()[0] });
    }

    let hashed_password = await bcrypt.hash(password, 12);

    let newuser = new UserModel({ username, email, password: hashed_password });

    let otp = generateotp();
    let html = emailTemplate(otp);

    console.log(otp);

    const hashedOtp = await crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    const otpstore = new OTP({
      userId: newuser._id,
      email: newuser.email,
      otp: hashedOtp,
    });
    await otpstore.save();

    await sendEmail(
      newuser.email,
      "OTP Verification",
      `your otp is ${otp}`,
      html,
    );

    const refresh_token = jwt.sign(
      { userId: newuser._id, verified: newuser.verified, email: newuser.email },
      config.jwtsecret,
      { expiresIn: "7d" },
    );

    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    await newuser.save();

    return res.json({ msg_user: "User is created otp is send to your email " });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ msgerr: "Internal sever error" });
  }
};

export let OtpFun = async (req, res) => {
  try {
    const token_cookie = req.cookies.refresh_token;

    if (!token_cookie) {
      return res.status(400).json({ msg_login: "please Login" });
    }

    const { otp } = req.body;

    console.log(otp);

    if (!otp) {
      return res.status(400).json({ msg_otperr: "please enter otp" });
    }

    const decoded = jwt.verify(token_cookie, config.jwtsecret);

    const user = await UserModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(200).json({ msg_signup: "please signup" });
    }

    if (user.verified === true) {
      return res.status(200).json({ msg_already: "you are already verified" });
    }
    const hashedotp = await crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    const otpfind = await OTP.findOne({ otp: hashedotp });

    if (!otpfind) {
      return res
        .status(400)
        .json({ msg_otpincorrect: "please enter correct otp" });
    }

    const currentTime = Date.now();
    const otpCreatedTime = otpfind.createdAt.getTime();

    const timeDifference = currentTime - otpCreatedTime;

    console.log(currentTime, otpCreatedTime, timeDifference);
    // OTP expires after 1 minute
    const otpExpiryTime = 240 * 1000;

    console.log(otpExpiryTime);

    if (timeDifference > otpExpiryTime) {
      await OTP.deleteOne({ _id: otpfind._id });
      return res.status(400).json({
        msg_otpexpired: "OTP has expired. Please request a new OTP",
      });
    }

    const refreshtoken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        verified: true,
      },
      config.jwtsecret,
      { expiresIn: "7d" },
    );
    const accesstoken = jwt.sign({ userId: user._id }, config.jwtsecret, {
      expiresIn: "10m",
    });

    res.cookie("refresh_token", refreshtoken, {
      sameSite: "none",
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    let ipAddress = req.ip;
    let userAgent = req.get("User-Agent");
    let userId = user._id;
    let token = crypto.createHash("sha256").update(refreshtoken).digest("hex");

    const session = new Session({ token, userId, userAgent, ipAddress });

    await session.save();

    await OTP.deleteOne({ _id: otpfind._id });

    user.verified = true;
    user.type = "chat";

    await user.save();

    return res.json({
      msg_success: "verified successfully",
      data: {
        accesstoken,
        user: user,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ msgerr: "Internal sever error" });
  }
};

export const LoginFun = async (req, res) => {
  const { email, password } = req.body;

  const err = validationResult(req);

  if (!err.isEmpty()) {
    return res
      .status(400)
      .json({ msg_validation: "validation error", validation: err.array()[0] });
  }

  const user = await UserModel.findOne({ email });

  if (!user) {
    return res.status(400).json({ msg_signup: "please signup" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ msg_password: "Incorrect Password" });
  }

  if (user.verified == false) {
    let otp = generateotp();
    let html = emailTemplate();

    console.log(otp);

    const hashedOtp = await crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    const otpstore = new OTP({
      userId: user._id,
      email: user.email,
      otp: hashedOtp,
    });
    await otpstore.save();
    const refresh_token = jwt.sign(
      { userId: user._id, verified: user.verified, email: user.email },
      config.jwtsecret,
      { expiresIn: "7d" },
    );

    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await sendEmail(user.email, "OTP Verification", `your otp is ${otp}`, html);
    return res.json({ msg_otp: "please verify your email " });
  }

  const refresh_token = jwt.sign(
    { userId: user._id, verified: user.verified, email: user.email },
    config.jwtsecret,
    { expiresIn: "7d" },
  );

  const accesstoken = jwt.sign({ userId: user._id }, config.jwtsecret, {
    expiresIn: "10m",
  });

  let userId = user._id;
  let userAgent = req.get("User-Agent");
  let ipAddress = req.ip;
  let token = crypto.createHash("sha256").update(refresh_token).digest("hex");
  const session = new Session({ userId, userAgent, ipAddress, token });

  await session.save();

  res.cookie("refresh_token", refresh_token, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  let conversation = await ConversationModel.find({
    participants: { $in: user._id },
  });

  let id = user._id;

  let userarray = [];

  for (const ele of conversation) {
    let arr = ele.participants;
    for (const e of arr) {
      let usera = await UserModel.findById({ _id: e });
      if (id.equals(usera._id)) {
        continue;
      } else {
        let a = { arr: usera, id: ele._id };
        userarray.push(a);
      }
    }
  }

  console.log(userarray);

  return res.status(200).json({
    msg_success: "Login successfully",
    data: {
      accesstoken,
      user: user,
      userarray,
    },
  });
};

export const RequesOtp = async (req, res) => {
  try {
    const token = req.cookies.refresh_token;

    if (!token) {
      return res.status(400).json({ msg_login: "please Login" });
    }

    const decoded = jwt.verify(token, config.jwtsecret);

    const user = await UserModel.findById({ _id: decoded.userId });

    if (!user) {
      return res.status(400).json({ msg_signup: "please signup" });
    }

    console.log(user);

    if (user.verified == true) {
      return res.status(400).json({ msg_already: "you are already verified" });
    }
    const otp = generateotp();
    const html = emailTemplate(otp);

    console.log(otp);

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    const otpstore = new OTP({
      userId: user._id,
      email: user.email,
      otp: hashedOtp,
    });
    await otpstore.save();
    await sendEmail(user.email, "OTP Verification", `your otp is ${otp}`, html);

    return res.json({ msg_success: "otp is send to your email" });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ msgerr: "Internal server error" });
  }
};

export const RefreshToken = async (req, res) => {
  try {
    const token = req.cookies.refresh_token;
    if (!token) {
      return res.status(400).json({ msg_login: "please Login" });
    }
    const decoded = jwt.verify(token, config.jwtsecret);

    const user = await UserModel.findById({ _id: decoded.userId });
    if (!user) {
      return res.status(400).json({ msg_signup: "please signup" });
    }

    const access_token = jwt.sign({ userId: user._id }, config.jwtsecret, {
      expiresIn: "10m",
    });
    let newtoken = crypto.createHash("sha256").update(token).digest("hex");

    const session = await Session.findOne({
      token: newtoken,
    });

    console.log(session);

    if (!session || session.revoked) {
      return res.status(401).json({ msg_login: "please Login" });
    }

    const newRefreshToken = jwt.sign(
      { userId: user._id, verified: user.verified, email: user.email },
      config.jwtsecret,
      { expiresIn: "7d" },
    );

    session.token = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");
    await session.save();

    res.cookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ access_token });
  } catch (error) {
    return res.status(500).json({ msgerr: "Internal sever error" });
  }
};

export const Logout = async (req, res) => {
  try {
    const token = req.cookies.refresh_token;

    if (!token) {
      return res.status(400).json({ msg_login: "please Login" });
    }

    const access_token = req.headers.authorization?.split(" ")[1];

    if (!access_token) {
      return res.status(400).json({ msg_login: "please Login" });
    }

    const decoded = jwt.verify(access_token, config.jwtsecret);

    const user = await UserModel.findById({ _id: decoded.userId });

    if (!user) {
      return res.status(400).json({ msg_signup: "please signup" });
    }

    const hashedToken = await crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    await Session.findOneAndUpdate(
      { userId: user._id, token: hashedToken },
      { revoked: true },
    );

    res.clearCookie("refresh_token");
    res.status(200).json({ msg: "Logout successful", type: "auth" });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ msg: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ msg: "Token expired" });
    }
    return res.status(500).json({ msgerr: "Internal server error" });
  }
};

export let Getme = async (req, res) => {
  try {
    const token = req.cookies.refresh_token;
    if (!token) {
      return res.status(400).json({ msg_login: "please Login without token" });
    }

    console.log(token);

    const decoded = jwt.verify(token, config.jwtsecret);

    const user = await UserModel.findById({ _id: decoded.userId });
    if (!user) {
      return res.status(400).json({ msg_signup: "please signup" });
    }

    const accesstoken = jwt.sign({ userId: user._id }, config.jwtsecret, {
      expiresIn: "10m",
    });
    let newtoken = crypto.createHash("sha256").update(token).digest("hex");

    const session = await Session.findOne({
      token: newtoken,
    });

    if (!session || session.revoked) {
      return res.status(401).json({ msg_login: "please Login" });
    }

    const newRefreshToken = jwt.sign(
      { userId: user._id, verified: user.verified, email: user.email },
      config.jwtsecret,
      { expiresIn: "7d" },
    );

    session.token = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");
    await session.save();

    res.cookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    let conversation = await ConversationModel.find({
      participants: { $in: user._id },
    });

    let id = user._id;

    let userarray = [];

    for (const ele of conversation) {
      let arr = ele.participants;
      for (const e of arr) {
        let usera = await UserModel.findById({ _id: e });
        if (id.equals(usera._id)) {
          continue;
        } else {
          let a = { arr: usera, id: ele._id };
          userarray.push(a);
        }
      }
    }

    console.log(userarray);

    return res.status(200).json({
      msg_success: "user verified",
      accesstoken,
      user,
      userarray,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ msgerr: "Internal sever error" });
  }
};
