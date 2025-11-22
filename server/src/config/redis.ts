import { createClient } from "redis";
import dotenv from 'dotenv';

dotenv.config();

// Configure Redis client with a socket connect timeout and simple reconnect strategy
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = createClient({
    url: redisUrl,
    socket: {
        // 10s connect timeout
        connectTimeout: 10_000,
        // Reconnect strategy: return delay in ms (or false/throw to stop)
        reconnectStrategy: (retries: number) => {
            // after many retries cap at 5s
            return Math.min(retries * 100, 5000);
        }
    }
});

redis.on("connect", () => console.log("Redis connected"));
redis.on("ready", () => console.log("Redis ready"));
redis.on("error", err => console.error("Redis error", err));
redis.on("reconnecting", () => console.warn("Redis reconnecting..."));
redis.on("end", () => console.warn("Redis connection closed"));

(async () => {
    try {
        await redis.connect();
    } catch (err) {
        // Do not crash the server on transient Redis errors; log for investigation
        console.error('Failed to connect to Redis:', err);
    }
})();
