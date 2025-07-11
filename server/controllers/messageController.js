


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
         res.status(500).json({success:false, message:error.message});
    }
}

//send message to selected user
export const sendMessage = async (req,res) => {
    try{
        const {text,image} = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        let imageUrl = "";
        if(image){
            try {
                
                const uploadResponse = await cloudinary.uploader.upload(image, {
                    resource_type: "image",
                    transformation: [
                        { width: 800, height: 800, crop: "limit" }, // Limit size
                        { quality: "auto" } // Optimize quality
                    ]
                });
                imageUrl = uploadResponse.secure_url;
            } catch (uploadError) {
                
                // Check if it's a configuration issue
                if (uploadError.message.includes("Invalid api_key") || uploadError.message.includes("Invalid signature")) {
                    return res.status(500).json({
                        success: false, 
                        message: "Image upload service configuration error. Please contact support."
                    });
                }
                
                // Check if it's a network issue
                if (uploadError.message.includes("ENOTFOUND") || uploadError.message.includes("ETIMEDOUT")) {
                    return res.status(500).json({
                        success: false, 
                        message: "Network error while uploading image. Please check your connection and try again."
                    });
                }
                
                // Check if it's a file format issue
                if (uploadError.message.includes("Invalid image file") || uploadError.message.includes("format")) {
                    return res.status(400).json({
                        success: false, 
                        message: "Invalid image format. Please use PNG, JPEG, or GIF files."
                    });
                }
                
                return res.status(400).json({
                    success: false, 
                    message: `Failed to upload image: ${uploadError.message}`
                });
            }
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text: text || "",
            image: imageUrl,
        });
          
          
        //Emit message to receiver
        const receiverSocketId = userSocketMap[receiverId];
          
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage);
        } else {
        }
          
        res.json({success:true, message:"Message sent successfully", newMessage});
    }
    catch(error){
        res.status(500).json({success:false, message:error.message});
    }
}