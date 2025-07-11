import mongoose from "mongoose";

//Function to connect to MongoDb database

export const connectDb = async () => {
    try{
        console.log('MONGODB_URI:', process.env.MONGODB_URI); // Debug log
        mongoose.connection.on("connected", () => console.log("Database connected"));

       await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`)
    }catch(error){
       console.log(error);
    }
}