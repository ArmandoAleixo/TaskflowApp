import { type Router, type Request, type Response } from "express";
import { Router as ExpressRouter } from "express";
import { createUser, getUserByEmail } from "../services/userService";
import { comparePasswords, generateToken } from "../services/authService";
import { logger } from "../lib/logger";

const router: Router = ExpressRouter();

// POST /auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Validação manual
    if (!name || typeof name !== "string" || name.length < 2) {
      return res
        .status(400)
        .json({ error: "Nome deve ter pelo menos 2 caracteres" });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Email inválido" });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return res
        .status(400)
        .json({ error: "Senha deve ter pelo menos 6 caracteres" });
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "Email já registrado" });
    }

    const result = await createUser({ name, email, password });
    return res.status(201).json(result);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email e senha são obrigatórios" });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const passwordMatch = await comparePasswords(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = generateToken(user);
    return res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;