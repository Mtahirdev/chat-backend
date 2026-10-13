import app from "./src/app.js";
import ConnectDB from "./src/config/Database.js";
import config from "./src/config/config.js";
import { createServer } from "http";
import { initSocket } from "./src/socket.js";
import httpServer from "./src/app.js";
console.log("server file load");

console.log("server file load 2");

httpServer.listen(process.env.PORT || config.PORT || 5000, () => {
  console.log("Server is running");
});
