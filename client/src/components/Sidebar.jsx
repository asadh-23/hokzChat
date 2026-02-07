import React, { useEffect, useState, useContext } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";

const Sidebar = () => {
    const navigate = useNavigate();
    const { getUsers, users, selectedUser, setSelectedUser, unseenMessages, setUnseenMessages } = useContext(ChatContext);
    const { logout, onlineUsers } = useContext(AuthContext);
    const [input, setInput] = useState("");

    const filteredUsers = input ? users.filter((user) => user.fullName.toLowerCase().includes(input.toLowerCase())) : users;

    useEffect(() => {
        getUsers();
    }, [onlineUsers]);

    return (
        <div className="bg-slate-950/50 backdrop-blur-xl h-full border-r border-white/10 flex flex-col transition-all duration-300">
            {/* Header Section */}
            <div className="p-6 pb-4 border-b border-white/5">
                <div className="flex justify-between items-center mb-6">
                    <img src={assets.logo} alt="logo" className="w-36 object-contain brightness-110" />

                    {/* Menu Dropdown */}
                    <div className="relative group">
                        <div className="p-2.5 hover:bg-white/10 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105">
                            <img
                                src={assets.menu_icon}
                                alt="Menu"
                                className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity"
                            />
                        </div>

                        <div
                            className="absolute top-full right-0 z-50 w-48 mt-2 py-2 rounded-2xl
                            bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl
                            opacity-0 invisible scale-95 group-hover:opacity-100 group-hover:visible group-hover:scale-100
                            transition-all duration-200 origin-top-right"
                        >
                            <button
                                onClick={() => navigate("/profile")}
                                className="w-full text-left px-5 py-3 text-sm text-slate-200 hover:bg-indigo-500/20 hover:text-white transition-colors flex items-center gap-3"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                                Edit Profile
                            </button>
                            <div className="h-[1px] bg-white/5 my-1" />
                            <button
                                onClick={() => logout()}
                                className="w-full text-left px-5 py-3 text-sm text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-3"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                    />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <img
                            src={assets.search_icon}
                            alt="Search"
                            className="w-4 opacity-40 group-focus-within:opacity-100 transition-opacity"
                        />
                    </div>
                    <input
                        onChange={(e) => setInput(e.target.value)}
                        type="text"
                        className="w-full bg-slate-800/60 border border-white/10 focus:border-indigo-500/50 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition-all focus:bg-slate-800/80"
                        placeholder="Search conversations..."
                    />
                </div>
            </div>

            {/* User List Section */}
            <div className="flex-1 overflow-y-auto px-3 mt-2 space-y-1 custom-scrollbar">
                <p className="px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Recent Chats</p>

                {filteredUsers.map((user, index) => {
                    const isSelected = selectedUser?._id === user._id;
                    const isOnline = onlineUsers.includes(user._id);

                    return (
                        <div
                            key={index}
                            onClick={() => {
                                setSelectedUser(user);
                                setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }));
                            }}
                            className={`group relative flex items-center gap-4 p-3.5 rounded-2xl cursor-pointer transition-all duration-200
                            ${
                                isSelected
                                    ? "bg-indigo-600/20 border-l-4 border-indigo-500 shadow-lg shadow-indigo-500/10"
                                    : "hover:bg-white/5 border-l-4 border-transparent hover:border-white/10"
                            }`}
                        >
                            {/* Avatar with Status Indicator */}
                            <div className="relative shrink-0">
                                <img
                                    src={user?.profilePic || assets.defaultProfilePic}
                                    alt={user.fullName}
                                    className={`w-14 h-14 rounded-full object-cover border-2 transition-all duration-200 group-hover:scale-105 ${
                                        isSelected ? "border-indigo-500/50 shadow-lg" : "border-slate-800"
                                    }`}
                                />
                                {isOnline && (
                                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-slate-900 rounded-full shadow-lg animate-pulse" />
                                )}
                            </div>

                            {/* User Info */}
                            <div className="flex flex-col min-w-0 flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <p
                                        className={`text-sm font-semibold truncate ${isSelected ? "text-white" : "text-slate-200"}`}
                                    >
                                        {user.fullName}
                                    </p>
                                    {unseenMessages[user._id] > 0 && (
                                        <span className="flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white shadow-lg animate-pulse">
                                            {unseenMessages[user._id]}
                                        </span>
                                    )}
                                </div>
                                <p
                                    className={`text-xs truncate ${isOnline ? "text-indigo-400 font-medium" : "text-slate-500"}`}
                                >
                                    {isOnline ? "Active now" : "Offline"}
                                </p>
                            </div>
                        </div>
                    );
                })}

                {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-slate-500 text-sm">No users found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
