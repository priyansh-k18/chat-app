import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDb } from "./lib/db.js";
import messageRouter from "./routes/messageRoutes.js";
import userRouter from "./routes/userRoutes.js";
import { Server } from "socket.io";
import { testCloudinaryConfig } from "./lib/cloudinary.js";






//Create Express app and Http server
const app = express();
const server = http.createServer(app);

// Export server for production use
export default server;


//Initialize socket.io server

export const io = new Server(server, {
    cors:{
        origin:"*"
    }
})

export const userSocketMap = {}; //{userId:socketId}

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if(userId) userSocketMap[userId] = socket.id;

    //Emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })
})

//Middleware setup
app.use(express.json({limit:"4mb"}));
app.use(cors());

//Routes setup

app.use("/api/status", (req,res) => res.send("server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages",messageRouter)

// Catch-all 404 route
app.use((req, res) => {
  res.status(404).send("Not Found");
});

// Error-handling middleware
app.use((err, req, res, next) => {
  res.status(500).send("Something broke!");
});

(async () => {
  await connectDb();
  
  // Test Cloudinary configuration
  const cloudinaryTest = await testCloudinaryConfig();
  if (!cloudinaryTest) {
    console.warn("⚠️  Cloudinary configuration test failed. Image uploads may not work properly.");
  } else {
    console.log("✅ Cloudinary configuration test passed.");
  }

  if(process.env.NODE_ENV !== "production"){
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log("server is running on port: "+PORT));
  }
})();

