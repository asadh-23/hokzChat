import React, { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import { Toaster } from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import assets from "./assets/assets";

const App = () => {
    const { authUser, loading } = useContext(AuthContext);

    if (loading) {
        return (
            /* h-[100dvh] ensures centering even with mobile address bars */
            <div className="h-[100dvh] w-full flex items-center justify-center bg-[#0f0c29]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-white text-sm tracking-wide opacity-80">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        /* ഡിസൈൻ മാറ്റാതെ കണ്ടന്റ് ലോക്ക് ചെയ്യാൻ h-screen നൊപ്പം overflow-hidden മാത്രം മതി */
        <div className="h-screen w-full overflow-hidden relative">
            {/* Background Layer */}
            <div
                className="fixed inset-0 z-0 bg-cover bg-no-repeat bg-center"
                style={{ backgroundImage: `url(${assets.bgImage})` }}
            />

            {/* Tint */}
            <div className="fixed inset-0 z-10 bg-black/40" />

            {/* Routes Wrapper */}
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
