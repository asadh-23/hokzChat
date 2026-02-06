import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.headers.token;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(400).json({ seccess: false, message: "User Not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("auth middleware error : " + error.message);
        return res.status(400).json({ seccess: false, message: error.message });
    }
};
