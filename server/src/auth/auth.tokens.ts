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
  response.cookie(authCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

export function clearAuthCookie(response: Response) {
  response.clearCookie(authCookieName, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

export function readAuthCookie(cookies: Record<string, string | undefined>) {
  return cookies[authCookieName];
}
