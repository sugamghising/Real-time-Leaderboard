import { JwtPayload } from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            /**
             * JWT payload or app-specific user object attached by auth middleware
             */
            user?: {
                userId: string;
                role: string;
            };
        }
    }
}

export { };