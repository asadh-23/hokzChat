import express from "express";
import { checkAuth, login, signup,updateProfileInfo, updateProfileImage } from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post('/signup', signup);
userRouter.post('/login', login);
userRouter.put("/update-profile-info", protectRoute, updateProfileInfo);
userRouter.put("/update-profile-image", protectRoute, updateProfileImage);
userRouter.get('/check', protectRoute, checkAuth);

export default userRouter;