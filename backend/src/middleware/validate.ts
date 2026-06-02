import type { RequestHandler } from "express";
import type { ZodSchema } from "zod";

type RequestPart = "body" | "query" | "params";

export function validate<T>(schema: ZodSchema<T>, part: RequestPart = "body"): RequestHandler {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req[part]);
    if (!parsed.success) {
      next(parsed.error);
      return;
    }
    req[part] = parsed.data as typeof req[typeof part];
    next();
  };
}
