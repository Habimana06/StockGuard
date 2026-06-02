import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    include: ["src/**/*.test.ts"],
    setupFiles: ["src/tests/setup.ts"],
    testTimeout: 30000,
    env: {
      NODE_ENV: "test",
      DATABASE_URL:
        process.env.DATABASE_URL ??
        "postgresql://stockguard:stockguard@localhost:5432/stockguard",
      JWT_SECRET: "test-jwt-secret-min-16-chars",
      CORS_ORIGIN: "http://localhost:5173",
      RESERVATION_TTL_MINUTES: "5",
    },
  },
});
