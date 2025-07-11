import mongoose from "mongoose";

//Function to connect to MongoDb database

export const connectDb = async () => {
    try{
        mongoose.connection.on("connected", () => {});

       await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`)
    }catch(error){
       // console.log(error);
    }
}