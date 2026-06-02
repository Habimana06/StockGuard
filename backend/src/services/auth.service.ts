import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { ConflictError, UnauthorizedError } from "../types/errors.js";
import type { AuthPayload } from "../middleware/auth.js";

const SALT_ROUNDS = 10;

export async function registerUser(email: string, password: string, displayName?: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ConflictError("Email already registered");
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { email, passwordHash, displayName },
  });
  return issueToken(user.id, user.email);
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError("Invalid email or password");
  }
  return issueToken(user.id, user.email);
}

function issueToken(userId: string, email: string) {
  const payload: AuthPayload = { userId, email };
  const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
  return { token, userId, email };
}
