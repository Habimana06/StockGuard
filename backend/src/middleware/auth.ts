import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { UnauthorizedError } from "../types/errors.js";
import { prisma } from "../lib/prisma.js";

export interface AuthPayload {
  userId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export const optionalAuth: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next();
    return;
  }
  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.auth = payload;
  } catch {
    // Invalid token on optional routes — treat as guest
  }
  next();
};

export const requireAuth: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(new UnauthorizedError("Missing or invalid authorization header"));
    return;
  }
  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      next(new UnauthorizedError("User no longer exists"));
      return;
    }
    req.auth = { userId: user.id, email: user.email };
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired token"));
  }
};

/**
 * Drop page works without login: browser sends X-Guest-Id (stored in localStorage).
 * We map that to a real User row so reservations stay tied to one shopper.
 */
export const resolveUserId: RequestHandler = async (req, _res, next) => {
  if (req.auth?.userId) {
    next();
    return;
  }
  const guestId = req.headers["x-guest-id"];
  if (typeof guestId === "string" && guestId.length >= 8 && guestId.length <= 64) {
    const email = `guest-${guestId}@stockguard.local`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: "guest-not-a-password",
        displayName: "Guest shopper",
      },
    });
    req.auth = { userId: user.id, email: user.email };
  }
  next();
};

export const requireUser: RequestHandler = (req, _res, next) => {
  if (!req.auth?.userId) {
    next(new UnauthorizedError("Provide Authorization Bearer token or X-Guest-Id header"));
    return;
  }
  next();
};
