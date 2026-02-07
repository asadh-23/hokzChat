import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

    const { socket, axios, authUser } = useContext(AuthContext);

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
    const sendMessage = async (formData) => {
        if (!selectedUser) return;
        const tempId = Date.now().toString();

        const text = formData.get("text");
        const file = formData.get("file");

        // Memory optimize cheyyaan vendi oru temp variable
        let objectUrl = null;
        if (file) objectUrl = URL.createObjectURL(file);

        const optimisticMessage = {
            _id: tempId,
            senderId: authUser._id,
            receiverId: selectedUser._id,
            text: text || "",
            fileUrl: objectUrl,
            fileType: file ? file.type : null,
            createdAt: new Date().toISOString(),
            isSending: true,
        };

        setMessages((prev) => [...prev, optimisticMessage]);

        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (data.success) {
                setMessages((prev) => prev.map((msg) => (msg._id === tempId ? data.newMessage : msg)));
                if (objectUrl) {
                    setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
                }
            }
        } catch (error) {
            setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
            toast.error("Failed to send");
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        }
    };

    useEffect(() => {
        if (!socket) return;

        const handleBatchDelivered = ({ deliveredBy }) => {
            setMessages((prev) =>
                prev.map((msg) => (msg.receiverId === deliveredBy && !msg.delivered ? { ...msg, delivered: true } : msg)),
            );
        };

        socket.on("batchMessagesDelivered", handleBatchDelivered);

        return () => {
            socket.off("batchMessagesDelivered", handleBatchDelivered);
        };
    }, [socket]);

    // Subscribe to incoming socket messages (CORRECT WAY)
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = async (newMessage) => {
            // If message belongs to currently opened chat
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                setMessages((prev) => [...prev, newMessage]);

                setUnseenMessages((prev) => ({ ...prev, [newMessage.senderId]: 0 }));
                // mark message as seen
                try {
                    await axios.put(`/api/messages/mark/${newMessage._id}`);
                } catch (err) {
                    console.error("Mark seen failed");
                }
            } else {
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
        isRightSidebarOpen,
        setIsRightSidebarOpen,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
