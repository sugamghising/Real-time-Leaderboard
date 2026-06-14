import { Redis } from "@upstash/redis";
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!redisUrl || !redisToken) {
    console.warn("UPSTASH_REDIS_REST_URL and/or UPSTASH_REDIS_REST_TOKEN not set. Redis features will fail.");
}

export const redis = new Redis({
    url: redisUrl || "",
    token: redisToken || "",
});
