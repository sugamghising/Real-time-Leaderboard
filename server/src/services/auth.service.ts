import { error } from "console";
import prisma from "../config/db";
import { comparePassword, hashPassword } from "../utils/hash";
import { generateToken } from "../utils/jwt";

export const registerUser = async (username: string, email: string, password: string) => {
    const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
    });
    if (existingUser) {
        throw new Error('User already Exists.');
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
        data: { username, email, passwordHash }
    });
    return user;
}


export const loginUser = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({ where: { email: email } });
    if (!user) {
        throw new Error('Invlaid Credentials.');
    }

    const isPasswordCorrect = await comparePassword(password, user.passwordHash);

    if (!isPasswordCorrect) {
        throw new Error('Invalid Credentials.');
    }

    const token = await generateToken({ user: user.id, role: user.role })
    return {
        token,
        user: {
            userId: user.id,
            name: user.username,
            email: user.email,
            role: user.role
        }
    }
}