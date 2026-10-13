import app from "./src/app.js";
import ConnectDB from "./src/config/Database.js";
import config from "./src/config/config.js";
import { createServer } from "http";
import { initSocket } from "./src/socket.js";

await ConnectDB();

const httpServer = createServer(app);

initSocket(httpServer);

httpServer.listen(process.env.PORT || config.PORT || 5000, () => {
  console.log("Server is running");
});
