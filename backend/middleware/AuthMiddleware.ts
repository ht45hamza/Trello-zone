import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/UserModel";
import { ApiError } from "../utils/ApiError";
import { AuthRequest } from "../controllers/AuthController";

const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return next(new ApiError(401, "Not authorized, no token"));
    }

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "secret");
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return next(new ApiError(401, "Not authorized, user not found"));
        }

        req.user = user;
        next();
    } catch (error) {
        return next(new ApiError(401, "Not authorized, token failed"));
    }
};

export { protect };
