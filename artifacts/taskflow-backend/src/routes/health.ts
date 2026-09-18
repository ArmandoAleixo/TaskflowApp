import { Router } from "express";
import { db } from "../lib/db"; // se quiser validar conexão com MongoDB

const router = Router();

router.get("/health", async (req, res) => {
  const mongoStatus = db.connection.readyState === 1 ? "connected" : "disconnected";

  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    mongo: mongoStatus,
  });
});

export default router;
