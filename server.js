import app from "./app.js";
import dotenv from "dotenv";
import http from "http";
import { connectMongo } from "./src/config/dbConnect.js";
import { initializeSocket } from "./src/socket/socket.js"; 

dotenv.config({ path: "./.env" });

const port = process.env.PORT || 3000;

const server = http.createServer(app);

initializeSocket(server); 

connectMongo();

server.listen(port, function () {
    console.log("🚀 Server is Running on", port);
});