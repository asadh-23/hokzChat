import React, { useEffect, useState } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";

const Sidebar = () => {
    const navigate = useNavigate();

    const { getUsers, users, selectedUser, setSelectedUser, unseenMessages, setUnseenMessages } = useContext(ChatContext);
    const { logout, onlineUsers } = useContext(AuthContext);

    const [input, setInput] = useState(false);

    const filteredUsers = input ? users.filter((user) => user.fullName.toLowerCase().includes(input.toLowerCase())) : users;

    useEffect(() => {
        getUsers();
    }, [onlineUsers]);
    return (
        <div
            className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-auto text-white ${
                selectedUser ? "max-md:hidden" : ""
            }`}
        >
            {/* Top Bar */}
            <div className="flex justify-between items-center">
                <img src={assets.logo} alt="logo" className="max-w-40" />

                {/* Menu */}
                <div className="relative group">
                    <img src={assets.menu_icon} alt="Menu" className="max-h-5 cursor-pointer" />

                    <div
                        className="absolute top-full right-0 z-20 w-36 mt-2 rounded-md
                       bg-[#282142] border border-gray-600 text-gray-100
                       opacity-0 invisible
                       group-hover:opacity-100 group-hover:visible
                       transition-all duration-200"
                    >
                        <p
                            onClick={() => navigate("/profile")}
                            className="cursor-pointer text-sm px-4 py-2 hover:bg-[#3a315c]"
                        >
                            Edit Profile
                        </p>

                        <hr className="border-gray-600" />

                        <p
                            onClick={() => logout()}
                            className="cursor-pointer text-sm px-4 py-2 hover:bg-[#3a315c] text-red-400"
                        >
                            Logout
                        </p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-6">
                <img src={assets.search_icon} alt="Search" className="w-3" />
                <input
                    onChange={(e) => setInput(e.target.value)}
                    type="text"
                    className="bg-transparent outline-none text-white text-xs placeholder-[#c8c8c8] flex-1"
                    placeholder="Search user..."
                />
            </div>

            {/* User List */}
            <div className="flex flex-col gap-1 mt-4">
                {filteredUsers.map((user, index) => (
                    <div
                        key={index}
                        onClick={() => {
                            (setSelectedUser(user), setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 })));
                        }}
                        className={`relative flex items-center gap-3 p-2 pl-4 rounded cursor-pointer
                        hover:bg-[#282142]/40
                        ${selectedUser?._id === user._id ? "bg-[#282142]/60" : ""}`}
                    >
                        <img
                            src={user?.profilePic || assets.defaultProfilePic}
                            alt={user.fullName}
                            className="w-[35px] h-[35px] rounded-full object-cover"
                        />

                        <div className="flex flex-col leading-5 flex-1">
                            <p className="text-sm font-medium truncate">{user.fullName}</p>

                            {onlineUsers.includes(user._id) ? (
                                <span className="text-green-400 text-xs">Online</span>
                            ) : (
                                <span className="text-neutral-400 text-xs">Offline</span>
                            )}
                        </div>

                        {unseenMessages[user._id] > 0 && (
                            <span className="absolute top-3 right-3 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/60">
                                {unseenMessages[user._id]}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;
