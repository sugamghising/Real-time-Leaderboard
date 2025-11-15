import prisma from "../config/db";
import { redis } from "../config/redis";
import { comparePassword, hashPassword } from "../utils/hash";
import { generateRefreshToken, generateToken, verifyRefreshToken } from "../utils/jwt";

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
        throw new Error('Invalid credentials.');
    }

    const isPasswordCorrect = await comparePassword(password, user.passwordHash);

    if (!isPasswordCorrect) {
        throw new Error('Invalid credentials.');
    }

    const accessToken = await generateToken({ userId: user.id, role: user.role })
    const refreshToken = await generateRefreshToken(user.id)

    // Store refresh token in database with expiration
    const expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days
    const tokenRecord = await prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash: refreshToken,
            expiresAt
        }
    });

    // Also cache in Redis for faster lookup with token ID as key
    await redis.set(`refresh_token:${tokenRecord.id}`, JSON.stringify({
        userId: user.id,
        tokenHash: refreshToken
    }), {
        EX: 2 * 24 * 60 * 60 // 2 days in seconds
    });

    return {
        accessToken,
        refreshToken,
        user: {
            userId: user.id,
            name: user.username,
            email: user.email,
            role: user.role
        }
    }
}

export const refreshAccessToken = async (oldRefreshToken: string) => {
    // Verify the refresh token JWT signature
    const decoded = verifyRefreshToken(oldRefreshToken);
    const userId = decoded.userId;

    // Find the token in database
    const tokenRecord = await prisma.refreshToken.findFirst({
        where: {
            tokenHash: oldRefreshToken,
            userId: userId,
            revoked: false,
            expiresAt: {
                gt: new Date() // Token not expired
            }
        },
        include: { user: true }
    });

    if (!tokenRecord) {
        throw new Error('Invalid or expired refresh token');
    }

    // Generate new tokens (rotation)
    const newAccessToken = await generateToken({ userId: tokenRecord.user.id, role: tokenRecord.user.role });
    const newRefreshToken = await generateRefreshToken(tokenRecord.user.id);

    // Atomically revoke old token and create new one
    const expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const [_, newTokenRecord] = await prisma.$transaction([
        prisma.refreshToken.update({
            where: { id: tokenRecord.id },
            data: { revoked: true }
        }),
        prisma.refreshToken.create({
            data: {
                userId: tokenRecord.user.id,
                tokenHash: newRefreshToken,
                expiresAt
            }
        })
    ]);

    // Update Redis cache
    await redis.del(`refresh_token:${tokenRecord.id}`);
    await redis.set(`refresh_token:${newTokenRecord.id}`, JSON.stringify({
        userId: tokenRecord.user.id,
        tokenHash: newRefreshToken
    }), {
        EX: 2 * 24 * 60 * 60
    });

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
    };
}

export const logoutUser = async (refreshToken: string) => {
    try {
        // Verify and decode the token
        const decoded = verifyRefreshToken(refreshToken);

        // Revoke the refresh token in database
        const tokenRecord = await prisma.refreshToken.findFirst({
            where: {
                tokenHash: refreshToken,
                userId: decoded.userId,
                revoked: false
            }
        });

        if (tokenRecord) {
            await prisma.refreshToken.update({
                where: { id: tokenRecord.id },
                data: { revoked: true }
            });

            // Remove from Redis cache
            await redis.del(`refresh_token:${tokenRecord.id}`);
        }

        return { success: true };
    } catch (error) {
        // Even if token is invalid, consider it logged out
        return { success: true };
    }
}