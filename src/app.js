import express from "express";
import cors from "cors";
import AuthRouter from "./Router/auth.routes.js";
import cookieParser from "cookie-parser";
import ChatRouter from "./Router/chat.routes.js";

let app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(cookieParser());

app.use(AuthRouter);
app.use(ChatRouter);
export default app;
