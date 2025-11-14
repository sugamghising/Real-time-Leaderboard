import jwt, { JwtPayload } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not defined');
}

export const generateToken = (payload: object, expiresIn = "1h"): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export const verifyToken = (token: string): JwtPayload => {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
}