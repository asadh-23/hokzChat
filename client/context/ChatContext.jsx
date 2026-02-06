import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});

    const { socket, axios } = useContext(AuthContext);

    // Get users for sidebar
    const getUsers = async () => {
        try {
            const { data } = await axios.get("/api/messages/users");
            if (data.success) {
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Get messages for selected user
    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Send message
    const sendMessage = async (messageData) => {
        if (!selectedUser) return;

        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);

            if (data.success) {
                setMessages((prev) => [...prev, data.newMessage]);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Subscribe to incoming socket messages (CORRECT WAY)
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = async (newMessage) => {
            // If message belongs to currently opened chat
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                setMessages((prev) => [...prev, newMessage]);

                // mark message as seen
                try {
                    await axios.put(`/api/messages/mark/${newMessage._id}`);
                } catch (err) {
                    console.error("Mark seen failed");
                }
            } else {
                // increase unseen count for sender
                setUnseenMessages((prev) => ({
                    ...prev,
                    [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
                }));
            }
        };

        socket.on("newMessage", handleNewMessage);

        // CLEANUP (VERY IMPORTANT)
        return () => {
            socket.off("newMessage", handleNewMessage);
        };
    }, [socket, selectedUser, axios]);

    useEffect(() => {
        if (!socket) return;

        const handleMessageDelivered = ({ messageId }) => {
            setMessages((prev) => prev.map((msg) => (msg._id === messageId ? { ...msg, delivered: true } : msg)));
        };

        socket.on("messageDelivered", handleMessageDelivered);

        return () => {
            socket.off("messageDelivered", handleMessageDelivered);
        };
    }, [socket]);

    useEffect(() => {
        if (!socket) return;

        const handleMessageSeen = ({ messageId }) => {
            setMessages((prev) => prev.map((msg) => (msg._id === messageId ? { ...msg, seen: true } : msg)));
        };

        socket.on("messageSeen", handleMessageSeen);

        return () => {
            socket.off("messageSeen", handleMessageSeen);
        };
    }, [socket]);

    const value = {
        messages,
        users,
        selectedUser,
        setSelectedUser,
        getUsers,
        getMessages,
        sendMessage,
        unseenMessages,
        setUnseenMessages,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
