import {  useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {io} from "socket.io-client";
import {AuthContext} from "./AuthContext";
import { BACKEND_URL } from "../src/config/config.js";

const backendUrl = BACKEND_URL;
axios.defaults.baseURL = backendUrl;


export const AuthProvider = ({children}) => {

    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);


    //check if user is authenticated and if so,set the user data and connect the socket
    const checkAuth = async () => {
         try{
            const {data} = await axios.get("/api/auth/check");
            if(data.success){
                setAuthUser(data.user);
                connectSocket(data.user);
             }
    }catch(error){
       toast.error(error.message);
    }
 }


 //Login function to handle user authentication and socket connection
   const login = async (state, credentials) => {
    try{
        const {data} = await axios.post(`/api/auth/${state}`, credentials);
        if(data.success){
            setAuthUser(data.user);
            connectSocket(data.user);
            axios.defaults.headers.common["token"] = data.token;
            setToken(data.token);
            localStorage.setItem("token", data.token);
            toast.success("Login successful");
            
        }else{
            toast.error(data.message);
        }

    } catch(error){
         toast.error(error.message);
      }
   }

   //Logout function to handle user logout and socket disconnection
   const logout = () => {
      localStorage.removeItem("token");
      setToken("");
      setAuthUser(null);
      setOnlineUsers([]);
      axios.defaults.headers.common["token"] = null;
     
      toast.success("Logged out successfully");
      socket.disconnect();
   }

   //update user profile function

   const updateProfile = async (body) => {
      try{
         const {data} = await axios.put("/api/auth/update-profile", body);
         if(data.success){
            setAuthUser(data.user);
            toast.success("Profile updated successfully");
         }else{
            toast.error(data.message);
         }
      }catch(error){
         toast.error(error.message);
      }
   }


 //connect to socket
 const connectSocket =  (userData) => {
    if(!userData || socket?.connected) return;
    const newSocket = io(backendUrl, {
        query: {
            userId: userData._id
        }
    });

    newSocket.connect();
    setSocket(newSocket);
    newSocket.on("getOnlineUsers", (userIds) => {
        setOnlineUsers(userIds);
    })
    
 }

 useEffect(() => {
     if(token){
        axios.defaults.headers.common["token"] = token;
     }
     checkAuth();

 },[])

    const value = {
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}