import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000').transform((val) => parseInt(val, 10)),
  MOOVE_API_KEY: z.string().default('mock'),
  MOOVE_API_BASE_URL: z.string().default('https://api.moove.xyz'),
  PLATFORM_MOOVE_HANDLE: z.string().default('agentgig'),
});

const parsed = envSchema.parse(process.env);

export const sanitizeHandle = (handle: string): string => handle.replace(/^@/, '').trim();

export const config = {
  port: parsed.PORT,
  mooveApiKey: parsed.MOOVE_API_KEY,
  mooveApiBaseUrl: parsed.MOOVE_API_BASE_URL.replace(/\/$/, ''),
  isMockMode: parsed.MOOVE_API_KEY === 'mock' || !parsed.MOOVE_API_KEY,
  platformHandle: sanitizeHandle(parsed.PLATFORM_MOOVE_HANDLE),
  platformHandleDisplay: `@${sanitizeHandle(parsed.PLATFORM_MOOVE_HANDLE)}`,
};