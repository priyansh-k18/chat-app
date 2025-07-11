import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { getMessages, getUsersForSiderbar, makeMessageSeen, sendMessage } from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUsersForSiderbar);
messageRouter.get("/:id", protectRoute, getMessages);
messageRouter.put("/mark/:id", protectRoute, makeMessageSeen);
messageRouter.post("/send/:id", protectRoute, sendMessage);

export default messageRouter;