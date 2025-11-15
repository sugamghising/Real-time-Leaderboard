import jwt, { JwtPayload } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_TOKEN_SECRET) {
    throw new Error('JWT_SECRET  and JWT_REFRESH_TOKEN_SECRET environment variable is not defined');
}

export const generateToken = (payload: object, expiresIn = "1h"): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export const verifyToken = (token: string): JwtPayload => {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export const generateRefreshToken = (userId: string, expiresIn = "2d") => {
    return jwt.sign({ userId }, JWT_REFRESH_TOKEN_SECRET, { expiresIn } as jwt.SignOptions);
}

export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, JWT_REFRESH_TOKEN_SECRET) as JwtPayload;
}