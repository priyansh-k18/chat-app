import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDb } from "./lib/db.js";
import messageRouter from "./routes/messageRoutes.js";
import userRouter from "./routes/userRoutes.js";
import { Server } from "socket.io";






//Create Express app and Http server
const app = express();
const server = http.createServer(app);


//Initialize socket.io server

export const io = new Server(server, {
    cors:{
        origin:"*"
    }
})

export const userSocketMap = {}; //{userId:socketId}

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("user connected", userId);

    if(userId) userSocketMap[userId] = socket.id;

    //Emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("user disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })
})

//Middleware setup
app.use(express.json({limit:"4mb"}));
app.use(cors());

//Routes setup

console.log("Adding /api/status route");
app.use("/api/status", (req,res) => res.send("server is live"));
console.log("Adding /api/auth route");
app.use("/api/auth", userRouter);
console.log("Adding /api/messages route");
app.use("/api/messages",messageRouter)

// Catch-all 404 route
app.use((req, res) => {
  res.status(404).send("Not Found");
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

(async () => {
  await connectDb();
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log("server is running on port: "+PORT));
})();

