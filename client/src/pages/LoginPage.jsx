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
        // fixed inset-0 and h-[100dvh] ensures NO scroll on the main body
        <div className="fixed inset-0 w-full h-[100dvh] bg-cover bg-center flex items-center justify-center p-4 sm:p-6 md:p-10 sm:justify-evenly max-sm:flex-col backdrop-blur-xl overflow-hidden">
            {/* Left Section: Logo - Responsive width */}
            <div className="flex shrink-0 items-center justify-center">
                <img
                    src={assets.logo_big}
                    alt="Logo"
                    className="w-[180px] sm:w-[220px] md:w-[250px] lg:w-[300px] max-w-[70vw] object-contain"
                />
            </div>

            {/* Right Section: Form - Oversize fixed for mobile */}
            <form
                onSubmit={handleSubmit}
                className="border border-white/20 bg-white/15 text-white
            p-5 sm:p-8 flex flex-col gap-3 sm:gap-5 rounded-2xl shadow-2xl 
            w-full max-w-[340px] sm:max-w-[380px] max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl sm:text-3xl font-semibold tracking-wide">{currState}</h2>
                    <img
                        src={assets.arrow_icon}
                        alt="Back"
                        className="w-4 sm:w-5 cursor-pointer opacity-70 hover:opacity-100"
                    />
                </div>

                <p className="text-[12px] sm:text-sm text-gray-300">
                    {currState === "Sign up" ? "Create your account to get started" : "Welcome back, please login"}
                </p>

                {/* Input Fields Container - Added spacing control */}
                <div className="flex flex-col gap-2.5 sm:gap-4">
                    {/* Full Name */}
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

                    {/* Email */}
                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={userData.email}
                        onChange={handleChange}
                        required
                        className="auth-input text-sm sm:text-base"
                    />

                    {/* Password */}
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={userData.password}
                        onChange={handleChange}
                        required
                        className="auth-input text-sm sm:text-base"
                    />

                    {/* Bio - Reduced rows for mobile fitting */}
                    {currState === "Sign up" && (
                        <textarea
                            name="bio"
                            placeholder="Short bio about you"
                            value={userData.bio}
                            onChange={handleChange}
                            rows={2}
                            className="auth-input resize-none text-sm sm:text-base"
                        />
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="mt-1 bg-violet-600 hover:bg-violet-700 active:scale-95
                transition-all py-2.5 rounded-lg font-medium tracking-wide text-sm sm:text-base"
                >
                    {currState}
                </button>

                {/* Terms and Privacy */}
                <div className="flex items-start gap-2 text-[10px] sm:text-sm text-slate-400">
                    <input type="checkbox" className="accent-indigo-500 cursor-pointer mt-1" required />
                    <p>Agree to the terms of use & privacy policy.</p>
                </div>

                {/* Toggle */}
                <p className="text-xs sm:text-sm text-center text-gray-300 mt-1">
                    {currState === "Sign up" ? (
                        <>
                            Already have an account?{" "}
                            <span
                                onClick={() => setCurrState("Login")}
                                className="text-violet-400 cursor-pointer hover:underline font-bold"
                            >
                                Login
                            </span>
                        </>
                    ) : (
                        <>
                            Don’t have an account?{" "}
                            <span
                                onClick={() => setCurrState("Sign up")}
                                className="text-violet-400 cursor-pointer hover:underline font-bold"
                            >
                                Sign up
                            </span>
                        </>
                    )}
                </p>
            </form>

            <style>
                {`
            .auth-input {
                width: 100%;
                padding: 0.5rem 0.75rem;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 0.6rem;
                outline: none;
                color: white;
                transition: all 0.2s ease;
            }
            @media (min-width: 640px) {
                .auth-input { padding: 0.6rem 0.75rem; }
            }
            .auth-input:focus {
                border-color: #8b5cf6;
                background: rgba(255, 255, 255, 0.1);
            }
            .auth-input::placeholder {
                color: #cbd5e1;
            }
            `}
            </style>
        </div>
    );
};

export default LoginPage;
