import { type Router, type Request, type Response } from "express";
import { Router as ExpressRouter } from "express";
import {
  createTask,
  getUserTasks,
  getTaskById,
  updateTask,
  deleteTask,
  withAutomaticPriority,
} from "../services/taskService";
import { authMiddleware } from "../middleware/auth";
import { logger } from "../lib/logger";

const router: Router = ExpressRouter();

// Apply auth middleware to all routes
router.use(authMiddleware);

// POST /tasks - Create task
router.post("/", async (req: Request, res: Response) => {
  try {
    const { title, description, status, priority, category, dueDate } =
      req.body;

    // Validação manual
    if (!title || typeof title !== "string" || title.length < 1) {
      return res.status(400).json({ error: "Título é obrigatório" });
    }

    if (
      !description ||
      typeof description !== "string" ||
      description.length < 1
    ) {
      return res.status(400).json({ error: "Descrição é obrigatória" });
    }

    const task = await createTask(req.userId!, {
      title,
      description,
      status: status || "pending",
      priority: priority || "medium",
      category: category || undefined,
      dueDate: dueDate || undefined,
    });

    return res.status(201).json(withAutomaticPriority(task));
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /tasks - List tasks
router.get("/", async (req: Request, res: Response) => {
  try {
    const tasks = (await getUserTasks(req.userId!)).map(withAutomaticPriority);

    // Apply filters if provided
    let filtered = tasks;
    if (req.query.status) {
      filtered = filtered.filter((t) => t.status === req.query.status);
    }
    if (req.query.priority) {
      filtered = filtered.filter((t) => t.priority === req.query.priority);
    }

    return res.json(filtered);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /tasks/:id - Get task details
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const task = await getTaskById(req.params.id, req.userId!);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    return res.json(withAutomaticPriority(task));
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /tasks/:id - Update task
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { title, description, status, priority, category, dueDate } =
      req.body;

    // Build update object with only provided fields
    const updateData: Record<string, any> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (category !== undefined) updateData.category = category;
    if (dueDate !== undefined) updateData.dueDate = dueDate;

    const task = await updateTask(req.params.id, req.userId!, updateData);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    return res.json(withAutomaticPriority(task));
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /tasks/:id - Delete task
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const task = await getTaskById(req.params.id, req.userId!);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    await deleteTask(req.params.id, req.userId!);
    return res.status(204).send();
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
