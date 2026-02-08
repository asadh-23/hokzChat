import cloudinary from "../lib/cloudinary.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { io, userSocketMap } from "../server.js";
import mongoose from "mongoose";
import streamifier from "streamifier";

export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user._id;

        const undeliveredMessages = await Message.find({ receiverId: userId, delivered: false });

        if (undeliveredMessages.length > 0) {
            await Message.updateMany({ receiverId: userId, delivered: false }, { $set: { delivered: true } });

            const uniqueSenderIds = [...new Set(undeliveredMessages.map((msg) => msg.senderId.toString()))];

            uniqueSenderIds.forEach((senderId) => {
                const senderSockets = userSocketMap[senderId];

                if (senderSockets) {
                    senderSockets.forEach((socketId) => {
                        io.to(socketId).emit("batchMessagesDelivered", {
                            deliveredBy: userId,
                        });
                    });
                }
            });
        }

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
        const { text } = req.body;
        const file = req.file;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        if (!text && !file) {
            return res.status(400).json({ success: false, message: "Empty message" });
        }

        let fileUrl;
        let fileType = "text";

        if (file) {
            const uploadToCloudinary = () => {
                return new Promise((resolve, reject) => {
                    const isPDF = file.mimetype === "application/pdf";
                    const uploadOptions = {
                        resource_type: isPDF ? "image" : "auto",
                        public_id: `file_${Date.now()}`,
                    };

                    if (isPDF) {
                        uploadOptions.format = "pdf";
                    }

                    const cld_upload_stream = cloudinary.uploader.upload_stream(
                        uploadOptions,
                        (error, result) => {
                            if (result) resolve(result);
                            else reject(error);
                        },
                    );
                    streamifier.createReadStream(file.buffer).pipe(cld_upload_stream);
                });
            };

            const result = await uploadToCloudinary();
            fileUrl = result.secure_url;

      
            if (file.mimetype === "application/pdf") {
                fileType = "application/pdf";
            } else {
                fileType = result.resource_type;
            }
        }

        // 3. Database entry
        const newMessage = await Message.create({
            senderId,
            receiverId,
            text: text?.trim(),
            fileUrl,
            fileType,
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
