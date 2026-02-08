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
        // fixed inset-0 and h-[100dvh] ensures NO scroll on the main body
        <div className="fixed inset-0 w-full h-[100dvh] bg-cover bg-center flex items-center justify-center p-4 sm:p-6 md:p-10 relative overflow-hidden backdrop-blur-sm">
            {/* Decorative Background Blur Elements (Optional) */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>

            <div className="relative z-10 w-full max-w-[360px] sm:max-w-[400px]">
                <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-6 sm:p-10 text-center shadow-2xl flex flex-col gap-6 sm:gap-8 overflow-y-auto max-h-[95vh] custom-scrollbar">
                    <h2 className="text-white text-xl sm:text-2xl font-semibold opacity-90 tracking-tight">
                        Profile details
                    </h2>

                    {/* PROFILE IMAGE - Responsive Sizes */}
                    <div className="flex flex-col items-center">
                        <div
                            className="relative inline-block cursor-pointer transition-transform hover:scale-105 active:scale-95 group"
                            onClick={handleProfileImageClick}
                        >
                            <img
                                src={currentUser.profilePic || assets.defaultProfilePic}
                                alt="Profile"
                                className="w-20 h-20 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white/20 transition-all group-hover:border-purple-500/80 shadow-xl"
                            />
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-purple-600/90 text-white px-3 py-1 rounded-full text-[10px] sm:text-xs opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                                Upload Image
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

                    {/* NAME + BIO - Adaptive Input Sizes */}
                    <div className="flex flex-col gap-4">
                        {isEditing ? (
                            <input
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                className="bg-white/5 border border-white/20 rounded-2xl px-4 py-2.5 text-white text-base sm:text-lg font-semibold text-center w-full outline-none focus:border-purple-500/80 transition-all placeholder:text-gray-400"
                                placeholder="Full Name"
                            />
                        ) : (
                            <h3
                                className="text-white text-lg sm:text-xl font-semibold cursor-pointer hover:text-purple-400 transition-colors truncate px-2"
                                onClick={() => setIsEditing(true)}
                            >
                                {currentUser.fullName}
                            </h3>
                        )}

                        {isEditing ? (
                            <textarea
                                value={editedBio}
                                onChange={(e) => setEditedBio(e.target.value)}
                                className="bg-white/5 border border-white/20 rounded-2xl px-4 py-3 text-white/90 text-sm w-full resize-none outline-none focus:border-purple-500/80 transition-all placeholder:text-gray-400"
                                rows="3"
                                placeholder="Write something about yourself..."
                            />
                        ) : (
                            <p
                                className="text-white/70 text-sm sm:text-base leading-relaxed cursor-pointer hover:text-white transition-colors m-0 px-2 line-clamp-4"
                                onClick={() => setIsEditing(true)}
                            >
                                {currentUser.bio || "No bio available"}
                            </p>
                        )}
                    </div>

                    {/* ACTION BUTTONS - Mobile friendly stacking */}
                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                        {isEditing ? (
                            <>
                                <button
                                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-bold cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/20"
                                    onClick={handleSave}
                                >
                                    Save
                                </button>
                                <button
                                    className="bg-transparent text-white/80 border border-white/20 px-8 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-bold cursor-pointer transition-all hover:bg-white/10"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-10 py-3 sm:py-3.5 rounded-full text-sm sm:text-base font-bold cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/30"
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
