import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";


export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer')) {
        return res.status(401).json({ error: "Missing Token" })
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: "Missing Token" })
    }
    try {
        const payload = verifyToken(token);
        req.user = {
            userId: payload.userId as string,
            role: payload.role as string
        };
        next();

    } catch (error) {
        console.log("Error in require Auth.", (error as Error).message)
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}