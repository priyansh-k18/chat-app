import mongoose from "mongoose";

//Function to connect to MongoDb database
export const connectDb = async () => {
    try {
        // Connection options for better stability
        const options = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            bufferCommands: false,
            bufferMaxEntries: 0
        };

        mongoose.connection.on("connected", () => {
            console.log("✅ Database connected successfully");
        });

        mongoose.connection.on("error", (err) => {
            console.error("❌ Database connection error:", err);
        });

        mongoose.connection.on("disconnected", () => {
            console.log("⚠️ Database disconnected");
        });

        await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`, options);
        
        console.log("🚀 MongoDB connection established");
    } catch (error) {
        console.error("❌ Error connecting to database:", error);
        throw error; // Re-throw to handle in main server
    }
}