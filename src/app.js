import express from "express";
import cors from "cors";
import AuthRouter from "./Router/auth.routes.js";
import cookieParser from "cookie-parser";
import ChatRouter from "./Router/chat.routes.js";
import ConnectDB from "./config/Database.js";

let app = express();

app.use(
  cors({
    origin: "https://chat-frontend-two-psi.vercel.app/",
    credentials: true,
  }),
);

app.use(cookieParser());

await ConnectDB();

app.use(AuthRouter);
app.use(ChatRouter);
export default app;
