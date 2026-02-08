import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import { Toaster } from "react-hot-toast";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import assets from "./assets/assets";

const App = () => {
    const { authUser, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#0f0c29]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-white text-sm tracking-wide opacity-80">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        /* h-screen and overflow-hidden here is key to lock the main body scroll */
        <div className="relative h-screen w-full overflow-hidden font-inter">
            {/* Background Layer: Always fixed, never moves */}
            <div
                className="fixed inset-0 z-0 bg-cover bg-no-repeat bg-center"
                style={{ backgroundImage: `url(${assets.bgImage})` }}
            />

            {/* Dark Tint Overlay: Ithaanu Glassmorphism-u depth nalkunnath */}
            <div className="fixed inset-0 z-10 bg-black/40 pointer-events-none" />

            {/* Content Layer: All pages load here */}
            <div className="relative z-20 h-full w-full overflow-hidden">
                <Toaster />
                <Routes>
                    <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
                    <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
                    <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
                </Routes>
            </div>
        </div>
    );
};

export default App;
