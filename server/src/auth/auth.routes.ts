import bcrypt from "bcrypt";
import { Router } from "express";
import { ZodError } from "zod";

import { requireAuth, type AuthenticatedRequest } from "./auth.middleware";
import { clearAuthCookie, setAuthCookie, signAuthToken } from "./auth.tokens";
import { loginSchema, registerSchema } from "./auth.schemas";
import { UserModel } from "./user.model";

export const authRouter = Router();

function validationError(error: ZodError) {
  const issue = error.issues[0];

  return {
    error: issue?.message ?? "Invalid request",
    field: issue?.path[0]?.toString()
  };
}

function publicUser(user: {
  _id: { toString(): string };
  email: string;
  storeName: string;
  createdAt: Date;
}) {
  return {
    id: user._id.toString(),
    email: user.email,
    storeName: user.storeName,
    createdAt: user.createdAt
  };
}

authRouter.post("/register", async (request, response) => {
  const parsed = registerSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).json(validationError(parsed.error));
    return;
  }

  const existingUser = await UserModel.findOne({ email: parsed.data.email }).lean();

  if (existingUser) {
    response.status(409).json({ error: "Email is already registered", field: "email" });
    return;
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await UserModel.create({
    email: parsed.data.email,
    passwordHash,
    storeName: parsed.data.storeName
  });
  const token = signAuthToken(user._id.toString());

  setAuthCookie(response, token);
  response.status(201).json({ user: publicUser(user), token });
});

authRouter.post("/login", async (request, response) => {
  const parsed = loginSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).json(validationError(parsed.error));
    return;
  }

  const user = await UserModel.findOne({ email: parsed.data.email });

  if (!user) {
    response.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const passwordMatches = await bcrypt.compare(parsed.data.password, user.passwordHash);

  if (!passwordMatches) {
    response.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signAuthToken(user._id.toString());

  setAuthCookie(response, token);
  response.status(200).json({ user: publicUser(user), token });
});

authRouter.post("/logout", (_request, response) => {
  clearAuthCookie(response);
  response.status(200).json({ success: true });
});

authRouter.get("/me", requireAuth, (request, response) => {
  const authRequest = request as AuthenticatedRequest;
  response.status(200).json({ user: authRequest.user });
});
