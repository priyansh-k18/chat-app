


//Get all users except the logged in user

import Message from "../models/message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

export const getUsersForSiderbar = async (req,res) => {
    try{
        const userId = req.user._id;
        const filteredUsers = await User.find({_id:{$ne:userId}}).select("-password");

        const unseenMessages = {}
        const promises = filteredUsers.map(async (user) => {
            const messages = await Message.find({
                senderId:user._id,
                receiverId:userId,
                seen:false
            })
            if(messages.length > 0){
                unseenMessages[user._id] = messages.length;
            }

             
        })
        await Promise.all(promises);

        res.json({success:true, users:filteredUsers, unseenMessages});

    }catch(error){
        console.log(error.message);
        res.status(500).json({success:false, message:error.message});
    }
}

//Get all messages for a user
export const getMessages = async (req,res) => {
    try{
        const {id:selectedUserId} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or:[
                {senderId: myId, receiverId:selectedUserId},
                {senderId: selectedUserId, receiverId:myId}
            ]
        }).sort({createdAt: 1}); // Sort by creation time

        // Mark messages from selected user as seen
        await Message.updateMany({
            receiverId: myId,
            senderId: selectedUserId,
            seen: false
        }, { seen: true });

        res.json({success:true, messages});
    }
    catch(error){
        console.log(error.message);
        res.status(500).json({success:false, message:error.message});
    }
}


//api to make message as seen using message id
export const makeMessageSeen = async (req,res) => {
    try{
        const {id} = req.params;
        await Message.findByIdAndUpdate(id, {seen:true});
        res.json({success:true, message:"Message marked as seen"});

    }catch(error){
         console.log(error.message);
         res.status(500).json({success:false, message:error.message});
    }
}

//send message to selected user
export const sendMessage = async (req,res) => {
    try{
        const {text,image} = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        console.log("Sending message:", { text, image: !!image, receiverId, senderId });

        let imageUrl;
        if(image){
           const uploadResponse = await cloudinary.uploader.upload(image) 
            imageUrl = uploadResponse.secure_url;
        }
        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image:imageUrl || "",
          })
          
          console.log("Message created:", newMessage._id);
          
          //Emit message to receiver
          const receiverSocketId = userSocketMap[receiverId];
          console.log("Receiver socket ID:", receiverSocketId, "User socket map:", userSocketMap);
          
          if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage);
            console.log("Message emitted to socket:", receiverSocketId);
          } else {
            console.log("Receiver not online, message saved to database");
          }
          
        res.json({success:true, message:"Message sent successfully", newMessage});
    }
    catch(error){
        console.log(error.message);
        res.status(500).json({success:false, message:error.message});
    }
}