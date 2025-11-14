import { Request, Response } from "express";
import { loginSchema, registerSchema } from "../schemas/auth.schema";
import { loginUser, registerUser } from "../services/auth.service";


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
        const user = await loginUser(email, password);
        res.status(200).json({ message: 'Login Successful', user })
    } catch (error) {
        res.status(400).json({
            message: "Could not login",
            error: error instanceof Error ? error.message : "Internal server error"
        })
    }

}