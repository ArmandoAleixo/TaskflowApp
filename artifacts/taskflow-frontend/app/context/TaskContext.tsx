import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { apiClient } from "../services/api";

type Status = "pending" | "in_progress" | "done";
type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  dueDate?: string;
  createdAt: string;
  category?: string;
}

export interface TaskInput {
  title: string;
  description: string;
  priority: Priority;
  status?: Status;
  dueDate?: string;
  category?: string;
}

interface Stats {
  total: number;
  pending: number;
  in_progress: number;
  done: number;
}

interface TaskContextType {
  tasks: Task[];
  createTask: (data: TaskInput) => Promise<Task>;
  updateTask: (id: string, updates: Partial<TaskInput>) => Promise<Task | null>;
  updateStatus: (id: string, status: Status) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  getById: (id: string) => Task | null;
  getStats: () => Stats;
  filterTasks: (filters: { status?: string; priority?: string }) => Task[];
  loadTasks: () => Promise<void>;
  clearTasks: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const isStatus = (value: unknown): value is Status =>
  value === "pending" || value === "in_progress" || value === "done";

const isPriority = (value: unknown): value is Priority =>
  value === "low" || value === "medium" || value === "high";

const toDateOnly = (value?: string) => {
  if (!value) return undefined;
  return new Date(value).toISOString().split("T")[0];
};

const mapBackendTask = (task: any): Task => ({
  id: task._id || task.id,
  title: task.title,
  description: task.description,
  status: isStatus(task.status) ? task.status : "pending",
  priority: isPriority(task.priority) ? task.priority : "medium",
  category: task.category || undefined,
  dueDate: toDateOnly(task.dueDate),
  createdAt: toDateOnly(task.createdAt) || new Date().toISOString().split("T")[0],
});

interface TaskProviderProps {
  children: React.ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!isLoggedIn) {
      setTasks([]);
    }
  }, [isLoggedIn]);

  const loadTasks = useCallback(async (): Promise<void> => {
    if (!isLoggedIn) {
      setTasks([]);
      return;
    }

    const backendTasks = await apiClient.getTasks();
    setTasks(backendTasks.map(mapBackendTask));
  }, [isLoggedIn]);

  const createTask = useCallback(
    async (data: TaskInput): Promise<Task> => {
      if (!isLoggedIn) {
        throw new Error("Usuario nao autenticado");
      }

      const backendTask = await apiClient.createTask({
        ...data,
        title: data.title.trim(),
        description: data.description.trim(),
      });
      const newTask = mapBackendTask(backendTask);

      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    },
    [isLoggedIn],
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<TaskInput>): Promise<Task | null> => {
      if (!isLoggedIn) {
        throw new Error("Usuario nao autenticado");
      }

      const backendTask = await apiClient.updateTask(id, {
        ...updates,
        title: updates.title?.trim(),
        description: updates.description?.trim(),
      });
      const updatedTask = mapBackendTask(backendTask);

      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task)),
      );
      return updatedTask;
    },
    [isLoggedIn],
  );

  const updateStatus = useCallback(
    async (id: string, status: Status): Promise<Task | null> => {
      return updateTask(id, { status });
    },
    [updateTask],
  );

  const deleteTask = useCallback(
    async (id: string): Promise<boolean> => {
      if (!isLoggedIn) {
        throw new Error("Usuario nao autenticado");
      }

      await apiClient.deleteTask(id);

      let existed = false;
      setTasks((prev) => {
        existed = prev.some((task) => task.id === id);
        return prev.filter((task) => task.id !== id);
      });
      return existed;
    },
    [isLoggedIn],
  );

  const getById = useCallback(
    (id: string) => tasks.find((task) => task.id === id) || null,
    [tasks],
  );

  const getStats = useCallback(
    (): Stats => ({
      total: tasks.length,
      pending: tasks.filter((task) => task.status === "pending").length,
      in_progress: tasks.filter((task) => task.status === "in_progress")
        .length,
      done: tasks.filter((task) => task.status === "done").length,
    }),
    [tasks],
  );

  const filterTasks = useCallback(
    ({ status, priority }: { status?: string; priority?: string }): Task[] => {
      return tasks.filter((task) => {
        if (status && status !== "all" && task.status !== status) return false;
        if (priority && priority !== "all" && task.priority !== priority) {
          return false;
        }
        return true;
      });
    },
    [tasks],
  );

  const clearTasks = useCallback(() => {
    setTasks([]);
  }, []);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        createTask,
        updateTask,
        updateStatus,
        deleteTask,
        getById,
        getStats,
        filterTasks,
        loadTasks,
        clearTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export function useTasks(): TaskContextType {
  const ctx = useContext(TaskContext);
  if (!ctx) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return ctx;
}
