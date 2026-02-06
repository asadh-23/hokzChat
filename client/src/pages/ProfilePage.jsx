import React, { useState, useRef, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import assets from "../assets/assets";

const ProfilePage = () => {
  const { authUser, updateProfileImage, updateProfileInfo } =
    useContext(AuthContext);

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
    <div className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden">
      <div className="relative z-10">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 w-96 text-center shadow-2xl">
          <h2 className="text-white text-2xl font-semibold mb-8 opacity-90">
            Profile details
          </h2>

          {/* PROFILE IMAGE */}
          <div className="mb-8">
            <div
              className="relative inline-block cursor-pointer transition-transform hover:scale-105 group"
              onClick={handleProfileImageClick}
            >
              <img
                src={currentUser.profilePic || assets.defaultProfilePic }
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-3 border-white/30 transition-all group-hover:border-purple-500/80"
              />
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-purple-600/90 text-white px-2 py-1 rounded-xl text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                upload profile image
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

          {/* NAME + BIO */}
          <div className="mb-8">
            {isEditing ? (
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="bg-white/10 border border-white/30 rounded-xl px-3 py-3 text-white text-lg font-semibold text-center w-full mb-4 outline-none focus:border-purple-500/80 transition-colors"
              />
            ) : (
              <h3
                className="text-white text-xl font-semibold mb-4 cursor-pointer hover:text-purple-400 transition-colors"
                onClick={() => setIsEditing(true)}
              >
                {currentUser.fullName}
              </h3>
            )}

            {isEditing ? (
              <textarea
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                className="bg-white/10 border border-white/30 rounded-xl px-3 py-3 text-white/90 text-sm w-full resize-none outline-none focus:border-purple-500/80 transition-colors"
                rows="3"
              />
            ) : (
              <p
                className="text-white/80 text-base leading-relaxed cursor-pointer hover:text-white transition-colors m-0"
                onClick={() => setIsEditing(true)}
              >
                {currentUser.bio}
              </p>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-center gap-4">
            {isEditing ? (
              <div className="flex gap-4">
                <button
                  className="bg-gradient-to-r from-purple-600 to-purple-700 text-white border-none px-8 py-3 rounded-full text-base font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/40"
                  onClick={handleSave}
                >
                  Save
                </button>
                <button
                  className="bg-transparent text-white/80 border border-white/30 px-8 py-3 rounded-full text-base font-semibold cursor-pointer transition-all hover:bg-white/10 hover:text-white hover:border-white/50"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white border-none px-8 py-3 rounded-full text-base font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/40"
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
