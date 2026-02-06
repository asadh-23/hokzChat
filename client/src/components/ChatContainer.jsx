import React, { useContext, useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ChatContainer = () => {
    const scrollContainerRef = useRef(null);
    const scrollEndRef = useRef(null);

    const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } = useContext(ChatContext);
    const { authUser, onlineUsers } = useContext(AuthContext);

    const [input, setInput] = useState("");
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

    // Fetch messages when selected user changes
    useEffect(() => {
        if (selectedUser) {
            getMessages(selectedUser._id);
        }
    }, [selectedUser]);

    // Detect user scroll
    const handleScroll = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

        setShouldAutoScroll(isNearBottom);
    };

    // Auto scroll only if user near bottom
    useEffect(() => {
        if (shouldAutoScroll && scrollEndRef.current) {
            scrollEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, shouldAutoScroll]);

    // Send text
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        await sendMessage({ text: input.trim() });
        setInput("");
    };

    // Send image
    const handleSendImage = async (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith("image/")) {
            toast.error("Select an image file");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            await sendMessage({ image: reader.result });
            e.target.value = "";
        };

        reader.readAsDataURL(file);
    };

    if (!selectedUser) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-2 bg-white/10 max-md:hidden">
                <img src={assets.logo_icon} className="max-w-16" alt="logo" />
                <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col backdrop-blur-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 py-3 px-4 border-b border-stone-500 shrink-0">
                <img
                    src={selectedUser.profilePic || assets.defaultProfilePic}
                    alt="user"
                    className="w-8 h-8 rounded-full object-cover"
                />

                <p className="flex-1 text-lg text-white flex items-center gap-2 truncate">
                    {selectedUser.fullName}
                    {onlineUsers.includes(selectedUser._id) && <span className="w-2 h-2 rounded-full bg-green-500" />}
                </p>

                <img
                    onClick={() => setSelectedUser(null)}
                    src={assets.arrow_icon}
                    alt="Back"
                    className="md:hidden w-7 cursor-pointer"
                />
            </div>

            {/* Messages */}
            <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-3 space-y-4">
                {messages?.map((msg) => {
                    const isMe = msg.senderId?.toString() === authUser?._id?.toString();

                    return (
                        <div key={msg._id} className={`flex items-end gap-3 ${isMe ? "justify-end" : "justify-start"}`}>
                            {/* Message bubble */}
                            <div className="flex flex-col gap-1 max-w-[230px]">
                                {msg.image ? (
                                    <img src={msg.image} alt="message" className="rounded-lg border border-gray-700" />
                                ) : (
                                    <p
                                        className={`px-3 py-2 text-sm break-words rounded-lg ${
                                            isMe
                                                ? "bg-violet-500/30 text-white rounded-br-none"
                                                : "bg-[#282142] text-white rounded-bl-none"
                                        }`}
                                    >
                                        {msg.text}
                                    </p>
                                )}

                                {/* Time + ticks */}
                                <div className="flex items-center justify-end gap-1 text-xs text-gray-400">
                                    <span>{formatMessageTime(msg.createdAt)}</span>

                                    {isMe && (
                                        <span className={`text-sm ${msg.seen ? "text-blue-500" : "text-gray-400"}`}>
                                            {msg.seen ? "✓✓" : msg.delivered ? "✓✓" : "✓"}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Avatar */}
                            <img
                                src={
                                    isMe
                                        ? authUser.profilePic && authUser.profilePic !== ""
                                            ? authUser.profilePic
                                            : assets.defaultProfilePic
                                        : selectedUser.profilePic && selectedUser.profilePic !== ""
                                          ? selectedUser.profilePic
                                          : assets.defaultProfilePic
                                }
                                alt="avatar"
                                className="w-7 h-7 rounded-full object-cover"
                            />
                        </div>
                    );
                })}

                <div ref={scrollEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-stone-600 p-3 flex items-center gap-3 bg-[#1f1b36] shrink-0">
                <div className="flex items-center gap-3 flex-1 bg-[#282142] px-4 py-2 rounded-full">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage(e) : null)}
                        type="text"
                        placeholder="Send a message..."
                        className="flex-1 bg-transparent text-white text-sm outline-none"
                    />

                    <input type="file" id="image" hidden onChange={handleSendImage} />
                    <label htmlFor="image">
                        <img src={assets.gallery_icon} alt="Upload" className="w-5 cursor-pointer" />
                    </label>
                </div>

                <img onClick={handleSendMessage} src={assets.send_button} alt="Send" className="w-6 cursor-pointer" />
            </div>
        </div>
    );
};

export default ChatContainer;
