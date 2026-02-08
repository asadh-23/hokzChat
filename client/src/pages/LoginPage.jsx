import React, { useState } from "react";
import assets from "../assets/assets";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const LoginPage = () => {
    const [currState, setCurrState] = useState("Sign up");

    const [userData, setUserData] = useState({
        fullName: "",
        email: "",
        password: "",
        bio: "",
    });

    const { login } = useContext(AuthContext);

    const handleChange = (e) => {
        setUserData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // common validation
        if (!userData.email || !userData.password) {
            toast.error("Email and password are required");
            return;
        }

        // email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            toast.error("Invalid email address");
            return;
        }

        // signup-only validation
        if (currState === "Sign up") {
            if (!userData.fullName) {
                toast.error("Full name is required");
                return;
            }

            if (userData.password.length < 6) {
                toast.error("Password must be at least 6 characters");
                return;
            }
        }

        login(currState === "Sign up" ? "signup" : "login", userData);
    };

    return (
        /* h-[100dvh] dynamic viewport height lock cheyyunnu, overflow-hidden body scroll thadayan */
        <div className="fixed inset-0 w-full h-[100dvh] flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-hidden">
            {/* Background Overlay for better visibility */}
            <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px]" />

            {/* Main Content Wrapper */}
            <div className="relative z-10 w-full max-w-6xl flex flex-col md:flex-row items-center justify-center gap-8 md:gap-20 lg:gap-32">
                {/* Left Section: Logo - Responsive scaling */}
                <div className="flex shrink-0 items-center justify-center animate-in fade-in slide-in-from-left-10 duration-700">
                    <img
                        src={assets.logo_big}
                        alt="Logo"
                        className="w-[160px] sm:w-[200px] md:w-[250px] lg:w-[320px] max-w-[60vw] object-contain drop-shadow-2xl brightness-110"
                    />
                </div>

                {/* Right Section: Form - Mobile Oversize Fix */}
                <form
                    onSubmit={handleSubmit}
                    className="relative border border-white/20 bg-white/10 backdrop-blur-2xl text-white
                p-6 sm:p-8 md:p-10 flex flex-col gap-4 sm:gap-5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] 
                w-full max-w-[340px] sm:max-w-[380px] max-h-[85vh] overflow-y-auto custom-scrollbar transition-all duration-300"
                >
                    {/* Header with improved typography */}
                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                {currState}
                            </h2>
                            <img
                                src={assets.arrow_icon}
                                alt="Back"
                                className="w-4 sm:w-5 cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
                            />
                        </div>
                        <p className="text-[11px] sm:text-sm text-slate-400 font-medium">
                            {currState === "Sign up" ? "Create your account to get started" : "Welcome back, please login"}
                        </p>
                    </div>

                    {/* Input Fields Container */}
                    <div className="flex flex-col gap-3 sm:gap-4">
                        {currState === "Sign up" && (
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Full Name"
                                value={userData.fullName}
                                onChange={handleChange}
                                required
                                className="auth-input text-sm sm:text-base"
                            />
                        )}

                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={userData.email}
                            onChange={handleChange}
                            required
                            className="auth-input text-sm sm:text-base"
                        />

                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={userData.password}
                            onChange={handleChange}
                            required
                            className="auth-input text-sm sm:text-base"
                        />

                        {currState === "Sign up" && (
                            <textarea
                                name="bio"
                                placeholder="Short bio about you"
                                value={userData.bio}
                                onChange={handleChange}
                                rows={2}
                                className="auth-input resize-none text-sm sm:text-base py-3"
                            />
                        )}
                    </div>

                    {/* Submit Button with Hover Effects */}
                    <button
                        type="submit"
                        className="mt-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] 
                    transition-all py-3 sm:py-3.5 rounded-xl font-bold tracking-wide text-sm sm:text-base shadow-lg shadow-indigo-600/20"
                    >
                        {currState === "Sign up" ? "Create Account" : "Sign In"}
                    </button>

                    {/* Terms and Privacy - Smaller on mobile */}
                    <div className="flex items-start gap-2 text-[10px] sm:text-xs text-slate-500 px-1">
                        <input type="checkbox" className="accent-indigo-500 cursor-pointer mt-0.5" required />
                        <p className="leading-tight">Agree to the terms of use & privacy policy.</p>
                    </div>

                    {/* Toggle - Improved Contrast */}
                    <p className="text-xs sm:text-sm text-center text-slate-400 pt-2 border-t border-white/5">
                        {currState === "Sign up" ? (
                            <>
                                Already have an account?{" "}
                                <span
                                    onClick={() => setCurrState("Login")}
                                    className="text-indigo-400 font-bold cursor-pointer hover:text-indigo-300 transition-colors"
                                >
                                    Login
                                </span>
                            </>
                        ) : (
                            <>
                                Don’t have an account?{" "}
                                <span
                                    onClick={() => setCurrState("Sign up")}
                                    className="text-indigo-400 font-bold cursor-pointer hover:text-indigo-300 transition-colors"
                                >
                                    Sign up
                                </span>
                            </>
                        )}
                    </p>
                </form>
            </div>

            <style>
                {`
            .auth-input {
                width: 100%;
                padding: 0.75rem 1rem;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                outline: none;
                color: white;
                transition: all 0.2s ease;
            }
            .auth-input:focus {
                background: rgba(255, 255, 255, 0.08);
                border-color: rgba(99, 102, 241, 0.5);
                box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
            }
            .auth-input::placeholder {
                color: rgba(255, 255, 255, 0.3);
            }
            `}
            </style>
        </div>
    );
};

export default LoginPage;
