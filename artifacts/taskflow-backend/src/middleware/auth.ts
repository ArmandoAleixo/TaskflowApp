import { type Request, type Response, type NextFunction } from "express";
import { extractTokenFromHeader, verifyToken } from "../services/authService";
import { logger } from "../lib/logger";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: {
        userId: string;
        email: string;
        name: string;
      };
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = extractTokenFromHeader(req.headers.authorization);

  if (!token) {
    logger.warn("No token provided");
    return res.status(401).json({ error: "Unauthorized" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    logger.warn("Invalid token");
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.user = decoded;
  req.userId = decoded.userId;
  next();
}