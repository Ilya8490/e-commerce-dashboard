import jwt from "jsonwebtoken";
import type { Response } from "express";

const authCookieName = "auth_token";

interface AuthTokenPayload {
  userId: string;
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }

  return secret;
}

export function signAuthToken(userId: string) {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyAuthToken(token: string) {
  return jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
}

export function setAuthCookie(response: Response, token: string) {
  const isProduction = process.env.NODE_ENV === "production";

  response.cookie(authCookieName, token, {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

export function clearAuthCookie(response: Response) {
  const isProduction = process.env.NODE_ENV === "production";

  response.clearCookie(authCookieName, {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction
  });
}

export function readAuthCookie(cookies: Record<string, string | undefined>) {
  return cookies[authCookieName];
}

export function readBearerToken(authorization: string | undefined) {
  if (!authorization?.startsWith("Bearer ")) {
    return undefined;
  }

  const token = authorization.slice("Bearer ".length).trim();

  return token.length > 0 ? token : undefined;
}
