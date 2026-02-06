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
        <div className="min-h-screen bg-cover bg-center flex items-center justify-center gap-10 sm:justify-evenly max-sm:flex-col backdrop-blur-xl">
            {/* Left (UNCHANGED) */}
            <img src={assets.logo_big} alt="Logo" className="w-[250px] max-w-[70vw]" />

            {/* Right (IMPROVED DESIGN ONLY) */}
            <form
                onSubmit={handleSubmit}
                className="border border-white/20 bg-white/15 text-white
        p-8 flex flex-col gap-5 rounded-2xl shadow-2xl w-[380px] max-w-[90vw]"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-1">
                    <h2 className="text-3xl font-semibold tracking-wide">{currState}</h2>
                    <img src={assets.arrow_icon} alt="Back" className="w-5 cursor-pointer opacity-70 hover:opacity-100" />
                </div>
                <p className="text-sm text-gray-300 mb-3">
                    {currState === "Sign up" ? "Create your account to get started" : "Welcome back, please login"}
                </p>
                {/* Full Name */}
                {currState === "Sign up" && (
                    <input
                        type="text"
                        name="fullName"
                        placeholder="Full Name"
                        value={userData.fullName}
                        onChange={handleChange}
                        required
                        className="auth-input"
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
                    className="auth-input"
                />
                {/* Password */}
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={userData.password}
                    onChange={handleChange}
                    required
                    className="auth-input"
                />
                {/* Bio */}
                {currState === "Sign up" && (
                    <textarea
                        name="bio"
                        placeholder="Short bio about you"
                        value={userData.bio}
                        onChange={handleChange}
                        rows={3}
                        className="auth-input resize-none"
                    />
                )}
                {/* Submit */}
                <button
                    type="submit"
                    className="mt-2 bg-violet-600 hover:bg-violet-700
          transition-all py-2.5 rounded-lg font-medium tracking-wide"
                >
                    {currState}
                </button>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <input type="checkbox" />
                    <p>Agree to the terms of use & privacy policy.</p>
                </div>
                {/* Toggle */}
                <p className="text-sm text-center text-gray-300 mt-2">
                    {currState === "Sign up" ? (
                        <>
                            Already have an account?{" "}
                            <span
                                onClick={() => setCurrState("Login")}
                                className="text-violet-400 cursor-pointer hover:underline"
                            >
                                Login
                            </span>
                        </>
                    ) : (
                        <>
                            Don’t have an account?{" "}
                            <span
                                onClick={() => setCurrState("Sign up")}
                                className="text-violet-400 cursor-pointer hover:underline"
                            >
                                Sign up
                            </span>
                        </>
                    )}
                </p>
            </form>

            {/* Utility class (RIGHT SIDE ONLY) */}
            <style>
                {`
          .auth-input {
            width: 100%;
            padding: 0.6rem 0.75rem;
            background: transparent;
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 0.6rem;
            outline: none;
            color: white;
            transition: all 0.2s ease;
          }
          .auth-input:focus {
            border-color: #8b5cf6;
            box-shadow: 0 0 0 1px #8b5cf6;
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
