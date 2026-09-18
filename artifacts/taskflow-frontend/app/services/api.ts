import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

function getExpoHost(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants.manifest as any)?.debuggerHost ||
    (Constants.manifest2 as any)?.extra?.expoClient?.hostUri;

  if (!hostUri) return null;

  return hostUri.split(":")[0] || null;
}

function resolveApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const expoHost = getExpoHost();
  if (expoHost) {
    return `http://${expoHost}:3000/api`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000/api";
  }

  return "http://localhost:3000/api";
}

const API_BASE_URL = resolveApiBaseUrl();

// Tipos
export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  token: string;
}

export interface Task {
  _id: string;
  id?: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  category?: string;
  dueDate?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskInput {
  title: string;
  description: string;
  status?: "pending" | "in_progress" | "done";
  priority?: "low" | "medium" | "high";
  category?: string;
  dueDate?: string;
}

class ApiClient {
  private async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem("authToken");
    } catch {
      return null;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = await this.getToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    };

    if (options.headers) {
      Object.assign(headers, options.headers as Record<string, string>);
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    // 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth APIs
  async register(
    name: string,
    email: string,
    password: string
  ): Promise<AuthResponse> {
    const data = await this.makeRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    // Save token
    if (data.token) {
      await AsyncStorage.setItem("authToken", data.token);
    }

    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await this.makeRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // Save token
    if (data.token) {
      await AsyncStorage.setItem("authToken", data.token);
    }

    return data;
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem("authToken");
  }

  // Task APIs
  async getTasks(filters?: {
    status?: string;
    priority?: string;
  }): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.priority) params.append("priority", filters.priority);

    const query = params.toString();
    const endpoint = query ? `/tasks?${query}` : "/tasks";

    return this.makeRequest<Task[]>(endpoint, {
      method: "GET",
    });
  }

  async getTask(id: string): Promise<Task> {
    return this.makeRequest<Task>(`/tasks/${id}`, {
      method: "GET",
    });
  }

  async createTask(data: TaskInput): Promise<Task> {
    return this.makeRequest<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTask(id: string, data: Partial<TaskInput>): Promise<Task> {
    return this.makeRequest<Task>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: string): Promise<void> {
    return this.makeRequest<void>(`/tasks/${id}`, {
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient();
