import cloudinary from "../lib/cloudinary.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { io, userSocketMap } from "../server.js";
import mongoose from "mongoose";

export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user._id;

        const users = await User.find({ _id: { $ne: userId } })
            .select("-password")
            .lean();

        const unseenCounts = await Message.aggregate([
            {
                $match: {
                    receiverId: userId,
                    seen: false,
                },
            },
            {
                $group: {
                    _id: "$senderId",
                    count: { $sum: 1 },
                },
            },
        ]);

        const unseenMessages = {};
        unseenCounts.forEach((item) => {
            unseenMessages[item._id.toString()] = item.count;
        });

        res.status(200).json({
            success: true,
            users,
            unseenMessages,
        });
    } catch (error) {
        console.log("get users for sidebar error :", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// get all messages for selected user

export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(selectedUserId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id",
            });
        }

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId },
            ],
        }).sort({ createdAt: 1 });

        const unseenMessages = messages.filter(
            (msg) =>
                msg.senderId.toString() === selectedUserId &&
                msg.receiverId.toString() === myId.toString() &&
                msg.seen === false,
        );

        // 3️⃣ If unseen messages exist → update DB
        if (unseenMessages.length > 0) {
            await Message.updateMany(
                {
                    _id: { $in: unseenMessages.map((msg) => msg._id) },
                },
                {
                    seen: true,
                    delivered: true,
                },
            );

            // 4️⃣ Emit messageSeen to sender sockets
            const senderSockets = userSocketMap[selectedUserId];
            if (senderSockets) {
                unseenMessages.forEach((msg) => {
                    senderSockets.forEach((socketId) => {
                        io.to(socketId).emit("messageSeen", {
                            messageId: msg._id,
                        });
                    });
                });
            }
        }

        res.status(200).json({
            success: true,
            messages,
        });
    } catch (error) {
        console.log("Get messages error :", error.message);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// api to mark message as seen using message id

export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid message id",
            });
        }

        const message = await Message.findById(id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found",
            });
        }

        // Only receiver can mark as seen
        if (message.receiverId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized",
            });
        }

        if (!message.seen) {
            message.seen = true;
            await message.save();

            // notify sender via socket
            const senderSockets = userSocketMap[message.senderId];

            if (senderSockets) {
                senderSockets.forEach((socketId) => {
                    io.to(socketId).emit("messageSeen", {
                        messageId: message._id,
                    });
                });
            }
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.log("markMessageAsSeen :", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// send message to selected user

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        if (!text && !image) {
            return res.status(400).json({
                success: false,
                message: "Message must contain text or image",
            });
        }

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text: text ? text.trim() : undefined,
            image: imageUrl,
        });

        const receiverSockets = userSocketMap[receiverId];

        if (receiverSockets) {
            newMessage.delivered = true;
            await newMessage.save();

            receiverSockets.forEach((socketId) => {
                io.to(socketId).emit("newMessage", newMessage);
            });

            //notify sender
            const senderSockets = userSocketMap[senderId];
            if (senderSockets) {
                senderSockets.forEach((socketId) => {
                    io.to(socketId).emit("messageDelivered", {
                        messageId: newMessage._id,
                    });
                });
            }
        }

        res.status(200).json({ success: true, newMessage });
    } catch (error) {
        console.log("send message error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
