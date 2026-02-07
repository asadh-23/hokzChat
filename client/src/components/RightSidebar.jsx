import React, { useContext, useEffect, useState } from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import assets from "../assets/assets";
import { X, Image as ImageIcon, LogOut, FileText, PlayCircle } from "lucide-react";

const RightSidebar = () => {
    const { selectedUser, messages, setIsRightSidebarOpen } = useContext(ChatContext);
    const { logout, onlineUsers } = useContext(AuthContext);
    const [sharedMedia, setSharedMedia] = useState([]);

    useEffect(() => {
        if (messages) {
            // Filter logic for Images, Videos, and PDFs
            const media = messages
                .filter((msg) => msg.fileUrl)
                .map((msg) => ({
                    url: msg.fileUrl,
                    type: msg.fileType,
                }));
            setSharedMedia(media);
        }
    }, [messages]);

    if (!selectedUser) return null;

    return (
        <div className="h-full bg-slate-950/50 backdrop-blur-xl border-l border-white/10 flex flex-col transition-all duration-300">
            {/* Close Button */}
            <div className="flex justify-end p-4 border-b border-white/10">
                <button
                    onClick={() => setIsRightSidebarOpen(false)}
                    className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all hover:scale-110"
                    title="Close sidebar"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {/* Profile Section */}
                <div className="flex flex-col items-center text-center mt-6">
                    <div className="relative group">
                        <div className="absolute -inset-2 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition duration-500"></div>
                        <img
                            src={selectedUser?.profilePic || assets.defaultProfilePic}
                            alt="profile"
                            className="relative w-28 h-28 rounded-full object-cover border-4 border-slate-800 shadow-2xl"
                        />
                        {onlineUsers.includes(selectedUser._id) && (
                            <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-green-500 border-3 border-slate-900 shadow-lg animate-pulse"></span>
                        )}
                    </div>

                    <div className="mt-5">
                        <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                            {selectedUser.fullName}
                        </h2>
                        <p
                            className={`text-sm font-medium mt-2 flex items-center justify-center gap-2 ${
                                onlineUsers.includes(selectedUser._id) ? "text-green-400" : "text-slate-400"
                            }`}
                        >
                            {onlineUsers.includes(selectedUser._id) && (
                                <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                            )}
                            {onlineUsers.includes(selectedUser._id) ? "Active Now" : "Offline"}
                        </p>
                    </div>

                    <div className="mt-6 px-5 py-4 bg-white/5 rounded-2xl border border-white/10 w-full backdrop-blur-sm">
                        <p className="text-slate-300 text-sm leading-relaxed italic">
                            {selectedUser.bio || "No bio available"}
                        </p>
                    </div>
                </div>

                <hr className="border-white/10 my-8" />

                {/* Shared Media Section */}
                <div>
                    <div className="flex items-center justify-between mb-5">
                        <p className="text-sm font-semibold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" />
                            Shared Media
                        </p>
                        {/* FIXED: Using sharedMedia.length */}
                        <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full font-bold">
                            {sharedMedia.length}
                        </span>
                    </div>

                    {/* FIXED: Mapping sharedMedia instead of msgImages */}
                    {sharedMedia.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2.5">
                            {sharedMedia.map((media, index) => (
                                <div
                                    key={index}
                                    onClick={() => {
                
                                        if (media.url) {
                                            if (media.type === "application/pdf") {
                                                const previewUrl = media.url.replace(
                                                    "/upload/",
                                                    "/upload/f_auto,q_auto,pg_1/",
                                                );
                                                window.open(previewUrl, "_blank");
                                            } else {
                                                window.open(media.url, "_blank");
                                            }
                                        }
                                    }}
                                    className="aspect-square cursor-pointer overflow-hidden rounded-xl border border-white/10 hover:border-indigo-500/50 transition-all group shadow-lg bg-slate-900 flex items-center justify-center"
                                >
                                    {/* VIDEO PREVIEW */}
                                    {media.type?.startsWith("video") ? (
                                        <div className="relative w-full h-full flex items-center justify-center">
                                            <video src={media.url} className="w-full h-full object-cover opacity-50" />
                                            <PlayCircle className="absolute w-8 h-8 text-white/80 group-hover:scale-125 transition-transform" />
                                        </div>
                                    ) : media.type === "application/pdf" ? (
                                        /* PDF PREVIEW */
                                        <div className="flex flex-col items-center gap-1">
                                            <FileText className="w-8 h-8 text-red-500" />
                                            <span className="text-[8px] text-slate-400 font-bold uppercase">PDF</span>
                                        </div>
                                    ) : (
                                        /* IMAGE PREVIEW */
                                        <img
                                            src={media.url}
                                            alt="media"
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 bg-white/5 rounded-2xl border border-dashed border-white/10">
                            <img src={assets.gallery_icon} className="w-8 opacity-20 mb-3" alt="" />
                            <p className="text-xs text-slate-500">No media shared yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Action Area */}
            <div className="p-6 mt-auto border-t border-white/10">
                <button
                    onClick={() => logout()}
                    className="w-full flex items-center justify-center gap-2.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 hover:border-red-500 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] shadow-lg hover:shadow-red-500/20"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default RightSidebar;
