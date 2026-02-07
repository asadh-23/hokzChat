import { useContext } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import { ChatContext } from "../../context/ChatContext";

const HomePage = () => {
    const { selectedUser, isRightSidebarOpen } = useContext(ChatContext);

    return (
        <div className="w-full h-screen flex items-center justify-center p-3 sm:p-4 lg:p-6 overflow-hidden">
            {/* Main Container */}
            <div className="w-full max-w-[1800px] h-full max-h-[95vh] relative">
                
                {/* Decorative Background Elements - Enhanced visibility */}
                <div className="absolute -top-24 -left-24 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                
                {/* Glass Container */}
                <div
                    className={`relative z-10 backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden h-full shadow-2xl grid transition-all duration-300 ${
                        selectedUser && isRightSidebarOpen
                            ? "grid-cols-1 md:grid-cols-[360px_1fr] lg:grid-cols-[380px_1fr_420px]" 
                            : selectedUser
                            ? "grid-cols-1 md:grid-cols-[360px_1fr]"
                            : "grid-cols-1 md:grid-cols-[420px_1fr]"
                    }`}
                    style={{ gridTemplateRows: "100%" }} // Grid row height force cheyyunnu
                >
                    {/* Sidebar Container */}
                    <div className={`${selectedUser ? "hidden md:block" : "block"} h-full min-h-0 overflow-hidden`}>
                        <Sidebar />
                    </div>
                    
                    {/* Chat Container */}
                    <div className={`${selectedUser ? "block" : "hidden md:block"} h-full min-h-0 overflow-hidden`}>
                        <ChatContainer />
                    </div>
                    
                    {/* Right Sidebar */}
                    {selectedUser && isRightSidebarOpen && (
                        <div className="hidden lg:block h-full min-h-0 border-l border-white/10 overflow-hidden">
                            <RightSidebar />
                        </div>
                    )}
                </div>

                {/* Bottom Glow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
            </div>
        </div>
    );
};

export default HomePage;
