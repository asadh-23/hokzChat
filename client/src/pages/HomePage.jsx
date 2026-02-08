import { useContext, useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import { ChatContext } from "../../context/ChatContext";

const HomePage = () => {
    const { selectedUser, isRightSidebarOpen, setIsRightSidebarOpen, setSelectedUser } = useContext(ChatContext);
    const [isClosing, setIsClosing] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    // Handle opening and closing animations
    useEffect(() => {
        if (isRightSidebarOpen) {
            setShouldRender(true);
            setIsClosing(false);
        } else if (shouldRender) {
            setIsClosing(true);
            const timer = setTimeout(() => {
                setShouldRender(false);
                setIsClosing(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isRightSidebarOpen, shouldRender]);

    useEffect(() => {
        if (selectedUser) {
            window.history.pushState({ chatOpen: true }, "");
        }

        const handleBackButton = (event) => {
            if (selectedUser) {
                setSelectedUser(null);
            }
        };

        window.addEventListener("popstate", handleBackButton);

        return () => {
            window.removeEventListener("popstate", handleBackButton);
        };
    }, [selectedUser, setSelectedUser]);

    return (
        <div className="fixed inset-0 w-full h-[100dvh] flex items-center justify-center p-0 sm:p-4 lg:p-6 overflow-hidden touch-none">
            {/* Main Container */}
            <div className="w-full max-w-[1800px] h-full sm:h-[95vh] relative overflow-hidden">
                {/* Decorative Background Elements - Enhanced visibility */}
                <div className="absolute -top-24 -left-24 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl animate-pulse"></div>
                <div
                    className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/25 rounded-full blur-3xl animate-pulse"
                    style={{ animationDelay: "1s" }}
                ></div>

                {/* Glass Container */}
                <div className="relative z-10 backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl h-full shadow-2xl glass-container">
                    {/* Desktop Layout (>= 834px): Sidebar + ChatContainer side by side */}
                    <div className="desktop-layout h-full">
                        {/* Sidebar - Fixed width */}
                        <div className="h-full overflow-hidden">
                            <Sidebar />
                        </div>

                        {/* ChatContainer - Takes remaining space */}
                        <div className="h-full overflow-hidden relative">
                            <ChatContainer />

                            {/* RightSidebar as Overlay - 50% width on desktop */}
                            {selectedUser && shouldRender && (
                                <div
                                    className={`absolute inset-y-0 right-0 w-1/2 z-50 shadow-2xl ${
                                        isClosing ? "animate-slideOut" : "animate-slideIn"
                                    }`}
                                >
                                    <RightSidebar />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Layout (< 834px): ChatContainer with RightSidebar overlay */}
                    <div className="mobile-layout h-full relative">
                        {/* Show Sidebar when no user selected */}
                        {!selectedUser && (
                            <div className="h-full overflow-hidden">
                                <Sidebar />
                            </div>
                        )}

                        {/* Show ChatContainer when user is selected - Always visible */}
                        {selectedUser && (
                            <div className="h-full overflow-hidden">
                                <ChatContainer />
                            </div>
                        )}

                        {/* RightSidebar as Overlay - 50% width on mobile */}
                        {selectedUser && shouldRender && (
                            <div
                                className={`absolute inset-y-0 right-0 w-1/2 z-50 shadow-2xl ${
                                    isClosing ? "animate-slideOut" : "animate-slideIn"
                                }`}
                            >
                                <RightSidebar />
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Glow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
            </div>

            {/* Slide-in animation for RightSidebar + Custom Breakpoint */}
            <style>{`
                /* Mobile layout: visible below 834px */
                .mobile-layout {
                    display: block;
                }
                .desktop-layout {
                    display: none;
                }

                /* Glass container overflow handling */
                .glass-container {
                    overflow: hidden;
                }

                /* Desktop layout: visible at 834px and above */
                @media (min-width: 834px) {
                    .mobile-layout {
                        display: none;
                    }
                    .desktop-layout {
                        display: grid;
                        grid-template-columns: 380px 1fr;
                    }
                }

                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }
                
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                    }
                    to {
                        transform: translateX(100%);
                    }
                }
                
                .animate-slideIn {
                    animation: slideIn 0.3s ease-out forwards;
                }
                
                .animate-slideOut {
                    animation: slideOut 0.3s ease-in forwards;
                }
            `}</style>
        </div>
    );
};

export default HomePage;
