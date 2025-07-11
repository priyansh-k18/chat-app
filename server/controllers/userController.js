import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";



//Signup a new user
export const signup = async (req,res) => {
    const {fullName, email, password, bio} = req.body;
    try{
        if(!fullName || !email || !password || !bio){
            return res.status(400).json({success:false, message:"All fields are required"});
        }

        //check if user already exists
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.json({success:false, message:"User already exists"});
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = await User.create({
            fullName,email,password:hashedPassword,bio
        });
        const token = generateToken(newUser._id);

        res.status(201).json({success:true, message:"User created successfully", user:newUser, token});
    }catch(error){
        console.log(error.message);
        res.status(500).json({success:false, message:error.message});
    }

}


// Controller to login a user
export const login = async (req,res) => {
     try{
        const {email, password} = req.body;

        const userData = await User.findOne({email});

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);

        if(!isPasswordCorrect){
            return res.json({success:false, message:"Invalid credentials"});
        }

        const token = generateToken(userData._id);
        res.status(200).json({success:true, message:"Login successful", user:userData, token});
     }catch(error){
        console.log(error.message);
        res.status(500).json({success:false, message:error.message});
     }
}

//controller to check if user is authenticated

export const checkAuth = (req,res) => {
    res.status(200).json({success:true,user:req.user});
}

//controller to upload profile details

export const updateProfile = async (req,res) => {
    try{
        const {profilePic, bio, fullName} = req.body;

        const userId = req.user._id;
        let updatedUser;

        if(!profilePic){
            updatedUser = await User.findByIdAndUpdate(userId, {fullName,bio}, {new:true});
            
        }else{
            const upload = await cloudinary.uploader.upload(profilePic);

            updatedUser = await User.findByIdAndUpdate(userId, {fullName,bio,profilePic:upload.secure_url}, {new:true});
        }
        res.json({success:true, message:"Profile updated successfully", user:updatedUser});
    }catch(error){
        console.log(error.message);
        res.status(500).json({success:false, message:error.message});
    }
}
