import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../types/errors.js";
import { logger } from "../lib/logger.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      code: "VALIDATION_ERROR",
      details: err.flatten(),
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
    return;
  }

  logger.error({ err }, "Unhandled error");
  res.status(500).json({
    error: "Internal server error",
    code: "INTERNAL_ERROR",
  });
}

export function asyncHandler<
  Req extends Request = Request,
  Res extends Response = Response,
>(
  fn: (req: Req, res: Res, next: NextFunction) => Promise<void>
) {
  return (req: Req, res: Res, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
