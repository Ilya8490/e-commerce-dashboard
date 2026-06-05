import type { NextFunction, Request, Response } from "express";

import { readAuthCookie, verifyAuthToken } from "./auth.tokens";
import { UserModel } from "./user.model";

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    storeName: string;
    createdAt: Date;
  };
}

export async function requireAuth(request: Request, response: Response, next: NextFunction) {
  const token = readAuthCookie(request.cookies);

  if (!token) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const payload = verifyAuthToken(token);
    const user = await UserModel.findById(payload.userId).lean();

    if (!user) {
      response.status(401).json({ error: "Authentication required" });
      return;
    }

    (request as AuthenticatedRequest).user = {
      id: user._id.toString(),
      email: user.email,
      storeName: user.storeName,
      createdAt: user.createdAt
    };
    next();
  } catch {
    response.status(401).json({ error: "Authentication required" });
  }
}
