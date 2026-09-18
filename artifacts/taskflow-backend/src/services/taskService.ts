import { Task } from "../models/task";
import type { ITask } from "../models/task";
import { Types } from "mongoose";

type Priority = "low" | "medium" | "high";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseDueDate(value?: string | Date | null): Date | undefined {
  if (!value) return undefined;

  if (typeof value === "string") {
    const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnly) {
      const [, year, month, day] = dateOnly;
      return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    }
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function utcDayStart(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function getAutomaticPriority(
  dueDate?: string | Date | null,
  fallback: Priority = "medium"
): Priority {
  const parsedDueDate = parseDueDate(dueDate);
  if (!parsedDueDate) return fallback;

  const today = new Date();
  const daysUntilDue = Math.ceil(
    (utcDayStart(parsedDueDate) -
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) /
      MS_PER_DAY
  );

  if (daysUntilDue <= 1) return "high";
  if (daysUntilDue <= 3) return "medium";
  return "low";
}

export function withAutomaticPriority(task: ITask) {
  const data = task.toObject();
  return {
    ...data,
    priority: getAutomaticPriority(data.dueDate, data.priority),
  };
}

export async function createTask(
  userId: string,
  data: {
    title: string;
    description: string;
    status?: "pending" | "in_progress" | "done";
    priority?: "low" | "medium" | "high";
    category?: string;
    dueDate?: string;
  }
): Promise<ITask> {
  const task = await Task.create({
    title: data.title,
    description: data.description,
    status: data.status || "pending",
    priority: getAutomaticPriority(data.dueDate, data.priority || "medium"),
    category: data.category,
    dueDate: parseDueDate(data.dueDate),
    userId: new Types.ObjectId(userId),
  });

  return task;
}

export async function getUserTasks(userId: string) {
  return Task.find({ userId: new Types.ObjectId(userId) }).sort({
    createdAt: -1,
  });
}

export async function getTaskById(taskId: string, userId: string) {
  return Task.findOne({
    _id: new Types.ObjectId(taskId),
    userId: new Types.ObjectId(userId),
  });
}

export async function updateTask(
  taskId: string,
  userId: string,
  data: Partial<{
    title: string;
    description: string;
    status: "pending" | "in_progress" | "done";
    priority: "low" | "medium" | "high";
    category: string;
    dueDate: string;
  }>
) {
  const updateData: Record<string, any> = { ...data };

  if (data.dueDate) {
    updateData.dueDate = parseDueDate(data.dueDate);
    updateData.priority = getAutomaticPriority(data.dueDate, data.priority || "medium");
  }

  const task = await Task.findOneAndUpdate(
    {
      _id: new Types.ObjectId(taskId),
      userId: new Types.ObjectId(userId),
    },
    updateData,
    { new: true, runValidators: true }
  );

  return task;
}

export async function deleteTask(taskId: string, userId: string) {
  await Task.deleteOne({
    _id: new Types.ObjectId(taskId),
    userId: new Types.ObjectId(userId),
  });
}
