import { createClient } from "redis";
import dotenv from 'dotenv';

dotenv.config();

// Configure Redis client with a socket connect timeout and simple reconnect strategy
const redisPassword = process.env.REDIS_PASSWORD;
const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT || '6379';

if (!redisHost || !redisPort) {
    console.warn("Redis host/port not set; using defaults (127.0.0.1:6379).");
}

const host = redisHost || '127.0.0.1';
const port = Number(redisPort) || 6379;

export const redis = createClient({
    username: 'default',
    ...(redisPassword ? { password: redisPassword } : {}),
    socket: {
        host,
        port
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
