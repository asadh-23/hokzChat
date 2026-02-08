import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
    "http://localhost:5173",
    "https://hokz-chat.vercel.app"
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));

// Initialize socket.io server
export const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true
    },
});
// Store online users
export const userSocketMap = {}; // { userId: Set(socketId) }

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User connected:", userId);

    if (!userId) return;

    if (!userSocketMap[userId]) {
        userSocketMap[userId] = new Set();
    }

    userSocketMap[userId].add(socket.id);

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("User disconnected:", userId);

        userSocketMap[userId]?.delete(socket.id);

        if (userSocketMap[userId]?.size === 0) {
            delete userSocketMap[userId];
        }

        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

app.use(express.json({ limit: "4mb" }));

app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

await connectDB();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
