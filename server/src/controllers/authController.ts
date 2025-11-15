import { Request, Response } from "express";
import { loginSchema, refreshSchema, registerSchema } from "../schemas/auth.schema";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../services/auth.service";


export const register = async (req: Request, res: Response) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error })
    }

    const { username, email, password } = parsed.data;

    try {
        const user = await registerUser(username, email, password);
        res.status(201).json({
            message: "Registration successful",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(400).json({
            message: "Could not register",
            error: error instanceof Error ? error.message : "Internal server error"
        })
    }
}

export const login = async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error })
    }
    const { email, password } = req.body;
    try {
        const result = await loginUser(email, password);
        res.status(200).json({ message: 'Login Successful', ...result })
    } catch (error) {
        res.status(400).json({
            message: "Could not login",
            error: error instanceof Error ? error.message : "Internal server error"
        })
    }
}

export const refreshToken = async (req: Request, res: Response) => {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error });
    }

    const { refreshToken } = parsed.data;

    try {
        const tokens = await refreshAccessToken(refreshToken);
        res.status(200).json({
            message: 'Token refreshed successfully',
            ...tokens
        });
    } catch (error) {
        res.status(401).json({
            message: "Could not refresh token",
            error: error instanceof Error ? error.message : "Internal server error"
        });
    }
}

export const logout = async (req: Request, res: Response) => {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error });
    }

    const { refreshToken } = parsed.data;

    try {
        await logoutUser(refreshToken);
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({
            message: "Could not logout",
            error: error instanceof Error ? error.message : "Internal server error"
        });
    }
}