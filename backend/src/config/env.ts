import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  RESERVATION_TTL_MINUTES: z.coerce.number().int().positive().default(5),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.flatten().fieldErrors;
    console.error("Invalid environment configuration:", details);
    console.error(
      "Required on Pxxl: DATABASE_URL, JWT_SECRET (16+ chars), PORT=4000, CORS_ORIGIN"
    );
    throw new Error("Fix environment variables before starting the server.");
  }
  return parsed.data;
}

export const env = loadEnv();

export function reservationExpiresAt(from: Date = new Date()): Date {
  return new Date(from.getTime() + env.RESERVATION_TTL_MINUTES * 60 * 1000);
}
