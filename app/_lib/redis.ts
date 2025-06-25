import { Redis } from "@upstash/redis";
/**
 * Upstash Redis client for stateless, serverless environments.
 * Uses the UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});
