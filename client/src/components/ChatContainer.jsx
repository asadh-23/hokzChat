import React, { useContext, useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { Info, Send, ImagePlus, FileText } from "lucide-react";

const ChatContainer = () => {
    const scrollContainerRef = useRef(null);
    const scrollEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const { messages, selectedUser, setSelectedUser, sendMessage, getMessages, isRightSidebarOpen, setIsRightSidebarOpen } =
        useContext(ChatContext);
    const { authUser, onlineUsers } = useContext(AuthContext);

    const [input, setInput] = useState("");
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const [filePreview, setFilePreview] = useState(null);
    const [fileToSend, setFileToSend] = useState(null);
    const [fileType, setFileType] = useState(null);

    useEffect(() => {
        if (selectedUser) {
            getMessages(selectedUser._id);
            setShouldAutoScroll(true); // Auto-scroll when opening a new chat
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
        if (shouldAutoScroll && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages, shouldAutoScroll]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        // Logical Fix: Use fileToSend instead of imageFile
        if (!input.trim() && !fileToSend) return;

        const formData = new FormData();
        if (input.trim()) formData.append("text", input.trim());
        if (fileToSend) formData.append("file", fileToSend);

        // Reset UI immediately
        setInput("");
        setFilePreview(null);
        setFileToSend(null);
        setFileType(null);
        if (fileInputRef.current) fileInputRef.current.value = "";

        try {
            await sendMessage(formData);
        } catch (error) {
            toast.error("Failed to send message");
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm", "application/pdf"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Invalid file type!");
            e.target.value = "";
            return;
        }

        if (file.size > 45 * 1024 * 1024) {
            toast.error("File is too large! Max 45MB.");
            e.target.value = "";
            return;
        }

        setFileToSend(file);
        setFileType(file.type);

        const reader = new FileReader();
        reader.onloadend = () => {
            if (file.type === "application/pdf") {
                setFilePreview(assets.pdfImage);
            } else {
                setFilePreview(reader.result);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        if (filePreview && !filePreview.startsWith("https://")) {
            URL.revokeObjectURL(filePreview);
        }
        setFilePreview(null);
        setFileToSend(null);
        setFileType(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    if (!selectedUser) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-5 bg-slate-950/30 backdrop-blur-sm">
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full"></div>
                    <img
                        src={assets.logo_icon}
                        className="relative max-w-[220px] object-contain drop-shadow-2xl"
                        alt="logo"
                    />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-semibold text-white/90">Your Messages</h2>
                    <p className="text-slate-400 text-base">Select a contact to start chatting</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-slate-950/30 backdrop-blur-xl relative">
            {/* Header */}
            <div className="flex items-center justify-between py-4 px-6 border-b border-white/10 bg-slate-900/50 shrink-0 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <img
                            src={selectedUser.profilePic || assets.defaultProfilePic}
                            alt="user"
                            className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/50 shadow-lg"
                        />
                        {onlineUsers.includes(selectedUser._id) && (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-slate-900 shadow-lg animate-pulse" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-white text-base leading-tight">{selectedUser.fullName}</h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5">
                            {onlineUsers.includes(selectedUser._id) ? (
                                <>
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Online
                                </>
                            ) : (
                                "Offline"
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Info/Toggle Button - Visible on both mobile and desktop */}
                    <button
                        onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                        className={`p-2 rounded-full transition-all hover:scale-110 ${
                            isRightSidebarOpen ? "bg-indigo-500/20 text-indigo-400" : "hover:bg-white/10 text-slate-400"
                        }`}
                        title={isRightSidebarOpen ? "Hide user info" : "Show user info"}
                    >
                        <Info className="w-5 h-5" />
                    </button>

                    {/* Back button - Only on mobile (below 834px) */}
                    <button
                        onClick={() => setSelectedUser(null)}
                        className="mobile-only p-1.5 rounded-full hover:bg-white/10 cursor-pointer transition-all hover:scale-110"
                    >
                        <img src={assets.arrow_icon} alt="Back" className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar bg-transparent"
                style={{ minHeight: 0 }}
            >
                {messages?.map((msg) => {
                    const isMe = msg.senderId?.toString() === authUser?._id?.toString();
                    const isMessageLoading = msg.isSending;

                    return (
                        <div key={msg._id} className={`flex items-end gap-3 ${isMe ? "justify-end" : "justify-start"}`}>
                            {!isMe && (
                                <img
                                    src={selectedUser.profilePic || assets.defaultProfilePic}
                                    className="w-8 h-8 rounded-full object-cover border border-white/10 shadow-sm shrink-0"
                                    alt="avatar"
                                />
                            )}

                            <div className="flex flex-col gap-1.5 max-w-[75%] md:max-w-[65%]">
                                <div
                                    className={`relative rounded-2xl shadow-xl overflow-hidden border ${
                                        isMe
                                            ? "bg-indigo-600 border-indigo-500 text-white rounded-br-sm"
                                            : "bg-slate-800 border-white/5 text-white rounded-bl-sm"
                                    }`}
                                >
                                    {msg.fileUrl && (
                                        <div className="relative p-1 bg-black/20">
                                            {/* 1. IMAGE RENDERING: Added onClick to open image in new tab */}
                                            {(msg.fileType?.startsWith("image") || !msg.fileType) &&
                                                !msg.fileType?.includes("pdf") &&
                                                !msg.fileType?.includes("video") && (
                                                    <img
                                                        onClick={() => window.open(msg.fileUrl, "_blank")}
                                                        src={msg.fileUrl}
                                                        alt="attachment"
                                                        className={`w-full max-h-[400px] object-cover border border-white/10 cursor-pointer hover:opacity-90 transition-opacity ${isMessageLoading ? "opacity-50" : "opacity-100"}`}
                                                    />
                                                )}

                                            {/* 2. VIDEO RENDERING: Video standard controls included */}
                                            {msg.fileType?.startsWith("video") && (
                                                <video
                                                    crossOrigin="anonymous"
                                                    src={msg.fileUrl}
                                                    controls
                                                    className={`w-full max-h-[400px] rounded-xl border border-white/10 ${isMessageLoading ? "opacity-50" : "opacity-100"}`}
                                                />
                                            )}

                                            {/* 3. PDF RENDERING: Using transformation to ensure it opens as an image/preview */}
                                            {msg.fileType === "application/pdf" && (
                                                <a
                                                    href={msg.fileUrl.replace("/upload/", "/upload/f_auto,q_auto,pg_1/")}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all cursor-pointer"
                                                >
                                                    <div className="w-10 h-10 bg-red-500/20 flex items-center justify-center rounded-lg shrink-0">
                                                        <FileText className="w-6 h-6 text-red-500" />
                                                    </div>
                                                    <div className="flex flex-col overflow-hidden text-left text-white">
                                                        <span className="text-xs font-medium truncate">PDF Document</span>
                                                        <span className="text-[10px] opacity-60">Click to preview</span>
                                                    </div>
                                                </a>
                                            )}

                                            {isMessageLoading && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl m-1">
                                                    <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {msg.text && (
                                        <p
                                            className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.fileUrl ? "pt-1" : ""}`}
                                        >
                                            {msg.text}
                                        </p>
                                    )}
                                </div>

                                {/* Status Area */}
                                <div className={`flex items-center gap-1.5 px-1 ${isMe ? "justify-end" : "justify-start"}`}>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] text-slate-500 font-medium">
                                            {formatMessageTime(msg.createdAt)}
                                        </span>
                                        {isMe && (
                                            <span
                                                className={`text-[10px] ${msg.seen ? "text-blue-400" : "text-slate-500"}`}
                                            >
                                                {msg.seen || msg.delivered ? "✓✓" : "✓"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {isMe && (
                                <img
                                    src={authUser.profilePic || assets.defaultProfilePic}
                                    className="w-8 h-8 rounded-full object-cover border border-white/10 shadow-sm shrink-0"
                                    alt="avatar"
                                />
                            )}
                        </div>
                    );
                })}
                <div ref={scrollEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-white/10 bg-slate-900/60 backdrop-blur-xl shrink-0">
                {/* Image/File Preview */}
                {filePreview && (
                    <div className="p-4 border-b border-white/10">
                        <div className="relative inline-block group">
                            {fileType === "application/pdf" ? (
                                <div className="w-[120px] h-[120px] rounded-2xl border-2 border-white/20 bg-slate-800 flex flex-col items-center justify-center gap-2 shadow-xl">
                                    <img src={filePreview} alt="PDF Icon" className="w-12 h-12 object-contain" />
                                    <span className="text-[10px] text-slate-400 font-medium px-2 truncate w-full text-center">
                                        PDF Document
                                    </span>
                                </div>
                            ) : fileType?.startsWith("video") ? (
                                <video
                                    crossOrigin="anonymous"
                                    src={filePreview}
                                    className="max-w-[220px] max-h-[220px] rounded-2xl border-2 border-white/20 object-contain shadow-xl"
                                />
                            ) : (
                                <img
                                    src={filePreview}
                                    alt="Preview"
                                    className="max-w-[220px] max-h-[220px] rounded-2xl border-2 border-white/20 object-contain shadow-xl"
                                />
                            )}

                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg z-10"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}

                {/* Input Box - Wrapped in a form for better Enter key handling */}
                <form onSubmit={handleSendMessage} className="p-4 flex items-center gap-3">
                    <div className="flex items-center gap-3 flex-1 bg-slate-800/80 px-5 py-3 rounded-2xl border border-white/10 focus-within:border-indigo-500/50 transition-all">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            type="text"
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-slate-500"
                        />

                        <input
                            type="file"
                            id="file-input"
                            ref={fileInputRef}
                            hidden
                            // Generic accept: images, videos, and pdf
                            accept="image/*,video/*,application/pdf"
                            onChange={handleFileSelect}
                        />

                        <label
                            htmlFor="file-input"
                            className="cursor-pointer p-1.5 hover:bg-white/10 rounded-lg transition-all"
                        >
                            <ImagePlus className="w-5 h-5 text-slate-400 hover:text-slate-300 transition-colors" />
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={!input.trim() && !filePreview}
                        className={`p-3 rounded-xl transition-all duration-200 ${
                            input.trim() || filePreview
                                ? "bg-indigo-600 hover:bg-indigo-500 cursor-pointer hover:scale-105 shadow-lg shadow-indigo-500/30 text-white"
                                : "bg-slate-800/50 opacity-50 cursor-not-allowed text-slate-500"
                        }`}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>

            {/* Custom breakpoint styles */}
            <style>{`
                .mobile-only {
                    display: block;
                }

                @media (min-width: 834px) {
                    .mobile-only {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default ChatContainer;
