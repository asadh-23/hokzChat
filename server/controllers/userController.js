import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
    try {
        const { fullName, email, password, bio } = req.body;

        // 1. Validate input
        if (!fullName || !email || !password || !bio) {
            return res.status(400).json({ success: false, message: "Missing details" });
        }

        // 2. Normalize email
        const normalizedEmail = email.toLowerCase().trim();

        // 3. Check existing user
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Account already exists" });
        }

        // 4. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 5. Create user
        const newUser = await User.create({
            fullName: fullName.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            bio,
        });

        // 6. Generate JWT
        const token = generateToken(newUser._id);
        console.log('token : ' + token);
        

        // 7. Remove password before sending response
        const userObj = newUser.toObject();
        delete userObj.password;

        
        
        // 8. Send response
        return res.status(201).json({
            success: true,
            userData: userObj,
            token,
            message: "Account created successfully",
        });
    } catch (error) {
        console.error("User signup error:", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const login = async (req, res) => {
    try {
        
        const { email, password } = req.body;

        // 1. Validate input
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Missing credentials" });
        }

        console.log('1111');
        
        // 2. Normalize email
        const normalizedEmail = email.toLowerCase().trim();

        console.log('2222')

        // 3. Find user
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        console.log("333")

        // 4. Compare password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // 5. Generate JWT
        const token = generateToken(user._id);

        // 6. Remove password before sending response
        const userObj = user.toObject();
        delete userObj.password;

        // 7. Send response
        return res.status(200).json({
            success: true,
            userData: userObj,
            token,
            message: "Login successful",
        });
    } catch (error) {
        console.error("User login error:", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const checkAuth = (req, res) => {
    
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    

    return res.status(200).json({
        success: true,
        user: req.user,
    });
};

export const updateProfileInfo = async (req, res) => {
    try {
        const { fullName, bio } = req.body;

        // Auth safety
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        // Validate input
        if (!fullName && !bio) {
            return res.status(400).json({
                success: false,
                message: "Nothing to update",
            });
        }

        const updateData = {};

        if (fullName && fullName.trim()) {
            updateData.fullName = fullName.trim();
        }

        if (bio) {
            updateData.bio = bio;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, select: "-password" }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            user: updatedUser,
            message: "Profile info updated successfully",
        });

    } catch (error) {
        console.error("Update profile info error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const updateProfileImage = async (req, res) => {
    try {
        const { profilePic } = req.body;

        // Auth safety
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        // Validate input
        if (!profilePic) {
            return res.status(400).json({
                success: false,
                message: "Profile image is required",
            });
        }

        // Upload to Cloudinary
        const upload = await cloudinary.uploader.upload(profilePic);

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { profilePic: upload.secure_url },
            { new: true, select: "-password" }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            user: updatedUser,
            message: "Profile image updated successfully",
        });

    } catch (error) {
        console.error("Update profile image error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
