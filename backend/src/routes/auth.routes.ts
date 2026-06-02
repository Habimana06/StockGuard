import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { validate } from "../middleware/validate.js";
import { loginUser, registerUser } from "../services/auth.service.js";
import { authLoginSchema, authRegisterSchema } from "../validators/schemas.js";

export const authRouter = Router();

authRouter.post(
  "/auth/register",
  validate(authRegisterSchema),
  asyncHandler(async (req, res) => {
    const { email, password, displayName } = req.body as {
      email: string;
      password: string;
      displayName?: string;
    };
    const result = await registerUser(email, password, displayName);
    res.status(201).json(result);
  })
);

authRouter.post(
  "/auth/login",
  validate(authLoginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as { email: string; password: string };
    const result = await loginUser(email, password);
    res.json(result);
  })
);
