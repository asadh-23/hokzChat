import React, { useState, useRef, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import assets from "../assets/assets";

const ProfilePage = () => {
    const { authUser, updateProfileImage, updateProfileInfo } = useContext(AuthContext);

    const [currentUser, setCurrentUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState("");
    const [editedBio, setEditedBio] = useState("");
    const fileInputRef = useRef(null);

    // Sync authUser → local state
    useEffect(() => {
        if (authUser) {
            setCurrentUser(authUser);
            setEditedName(authUser.fullName || "");
            setEditedBio(authUser.bio || "");
        }
    }, [authUser]);

    if (!currentUser) return null;

    const handleProfileImageClick = () => {
        fileInputRef.current?.click();
    };

    // IMAGE UPLOAD (preview + backend)
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file || !file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            // instant preview
            setCurrentUser((prev) => ({
                ...prev,
                profilePic: e.target.result,
            }));

            // upload to backend
            await updateProfileImage(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    // SAVE NAME + BIO
    const handleSave = async () => {
        await updateProfileInfo({
            fullName: editedName,
            bio: editedBio,
        });

        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedName(authUser.fullName || "");
        setEditedBio(authUser.bio || "");
        setIsEditing(false);
    };

    return (
        /* h-full respects App.jsx's h-screen, overflow-y-auto handles form scrolling on small phones */
        <div className="h-full w-full flex items-center justify-center p-4 sm:p-6 overflow-y-auto custom-scrollbar">
            {/* Main Card Wrapper */}
            <div className="relative z-10 w-full max-w-[350px] sm:max-w-[400px] animate-in fade-in zoom-in-95 duration-500 my-auto">
                {/* Glassmorphic Container */}
                <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-6 sm:p-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col gap-6 sm:gap-8">
                    <h2 className="text-white text-xl sm:text-2xl font-bold tracking-tight opacity-95">Profile Details</h2>

                    {/* PROFILE IMAGE - Responsive & Glowing */}
                    <div className="flex flex-col items-center">
                        <div
                            className="relative inline-block cursor-pointer transition-all hover:scale-105 active:scale-95 group"
                            onClick={handleProfileImageClick}
                        >
                            {/* Outer Glow Effect */}
                            <div className="absolute -inset-1 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500"></div>

                            <img
                                src={currentUser.profilePic || assets.defaultProfilePic}
                                alt="Profile"
                                className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white/20 transition-all group-hover:border-purple-400 shadow-2xl"
                            />

                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-purple-600 px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity whitespace-nowrap uppercase tracking-wider">
                                Upload
                            </div>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>

                    {/* NAME + BIO - Clean Inputs */}
                    <div className="flex flex-col gap-3 sm:gap-4">
                        {isEditing ? (
                            <input
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-base sm:text-lg font-semibold text-center w-full outline-none focus:border-purple-500/50 transition-all focus:bg-white/10"
                                placeholder="Full Name"
                            />
                        ) : (
                            <h3
                                className="text-white text-lg sm:text-xl font-bold cursor-pointer hover:text-purple-400 transition-colors truncate px-2"
                                onClick={() => setIsEditing(true)}
                            >
                                {currentUser.fullName}
                            </h3>
                        )}

                        {isEditing ? (
                            <textarea
                                value={editedBio}
                                onChange={(e) => setEditedBio(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white/90 text-sm w-full resize-none outline-none focus:border-purple-500/50 transition-all focus:bg-white/10"
                                rows="3"
                                placeholder="Write a short bio..."
                            />
                        ) : (
                            <p
                                className="text-slate-300 text-sm sm:text-base leading-relaxed cursor-pointer hover:text-white transition-colors m-0 px-2 line-clamp-4"
                                onClick={() => setIsEditing(true)}
                            >
                                {currentUser.bio || "No bio available. Click to add one."}
                            </p>
                        )}
                    </div>

                    {/* ACTION BUTTONS - Mobile friendly stacking */}
                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                        {isEditing ? (
                            <>
                                <button
                                    className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-2.5 sm:py-3 rounded-2xl text-sm sm:text-base font-bold transition-all active:scale-95 shadow-lg shadow-purple-500/20"
                                    onClick={handleSave}
                                >
                                    Save Changes
                                </button>
                                <button
                                    className="w-full sm:w-auto bg-white/5 text-slate-300 border border-white/10 px-8 py-2.5 sm:py-3 rounded-2xl text-sm sm:text-base font-bold transition-all hover:bg-white/10"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-10 py-3 sm:py-3.5 rounded-2xl text-sm sm:text-base font-bold transition-all active:scale-95 shadow-xl shadow-purple-500/25"
                                onClick={() => setIsEditing(true)}
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
