import { useContext, useEffect, useState, createContext } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

const ChatContext = createContext();

export const ChatProvider = ({children}) => {

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});

    const {socket, axios} = useContext(AuthContext)

    //function to get all users
    const getUsers = async () => {
        try{
            const {data} = await axios.get("/api/messages/users");
            if(data.success){
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages);
            }
        }catch(error){
            toast.error(error.message);
        }
    }

    //function to get messages for selected user
    const getMessages = async (userId) => {
        try{
           const {data} =  await axios.get(`/api/messages/${userId}`);
           if(data.success){
             setMessages(data.messages);
           }
        }catch(error){
            toast.error(error.message);
        }

    }

    //function to send message to selected user
    const sendMessage = async (messageData) => {
        if (!selectedUser) {
            toast.error("No user selected");
            return;
        }
        
        console.log("Sending message:", { messageData, selectedUser: selectedUser._id });
        
        try{
            const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
            console.log("Message response:", data);
            
            if(data.success){
                setMessages((prevMessages) => [...prevMessages, data.newMessage]);
                toast.success("Message sent successfully");
            }else{
                toast.error(data.message || "Failed to send message");
            }
        }catch(error){
            console.error("Error sending message:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to send message");
        }
    }

    //function to mark message as seen
    const subscribeToMessage = () => {
        if(!socket) return;
        
        // Remove any existing listeners first
        socket.off("newMessage");
        
        socket.on("newMessage", (newMessage) => {
            console.log("Received new message:", newMessage);
            
            if(selectedUser && newMessage.senderId === selectedUser._id){
                // Message is from currently selected user - mark as seen immediately
                newMessage.seen = true;
                setMessages((prevMessages) => [...prevMessages, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
            }else{
                // Message is from other user - increment unseen count
                setUnseenMessages((prevUnseenMessages) => ({
                    ...prevUnseenMessages,
                    [newMessage.senderId]: (prevUnseenMessages[newMessage.senderId] || 0) + 1
                }));
            }
        });
    }
   
    //function to unsubscribe from message
    const unsubscribeFromMessage = () => {
        if(!socket) return;
        socket.off("newMessage");
    }

    // Update unseen messages when selecting a user
    const handleUserSelection = async (user) => {
        setSelectedUser(user);
        if (user) {
            await getMessages(user._id);
            // Clear unseen messages for this user
            setUnseenMessages(prev => ({
                ...prev,
                [user._id]: 0
            }));
        }
    };

    useEffect(() => {
        subscribeToMessage();
        return () => unsubscribeFromMessage();
    }, [socket, selectedUser?._id]); // Only depend on selectedUser._id, not the entire object

    const value = {
        messages,
        users,
        selectedUser,
        getUsers,
        getMessages,
        sendMessage,
        setSelectedUser,
        handleUserSelection,
        unseenMessages,
        setUnseenMessages,
    }

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}

export { ChatContext };