import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { IUser } from "../models/user";
import { config } from "../config/env";

const JWT_EXPIRES_IN = "7d";

export interface AuthPayload {
  userId: string;
  email: string;
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePasswords(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: IUser): string {
  const payload: AuthPayload = {
    userId: user._id.toString(),
    email: user.email,
    name: user.name,
  };
  return jwt.sign(payload, config.jwtSecret, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;
  return parts[1];
}