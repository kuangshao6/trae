// API 基础 URL：生产环境使用后端地址，开发环境走 Vite 代理
const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

// 自动附加 token
function getAuthHeaders(): HeadersInit {
  const token =
    (() => {
      try {
        return localStorage.getItem("novel_token");
      } catch {
        return null;
      }
    })() || "";

  return {
    "Content-Type": "application/json",
    "x-auth-token": token,
    Authorization: token ? `Bearer ${token}` : "",
  };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const text = await response.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    if (!response.ok) {
      throw new Error(`请求失败 (${response.status})`);
    }
    throw new Error("服务器返回了无效的响应格式");
  }

  if (!response.ok) {
    throw new Error(data.message || "请求失败");
  }

  return data as T;
}

// ========== 认证 ==========
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  penName: string;
  createdAt?: string;
}

export const authApi = {
  register: (data: { username: string; email: string; password: string; penName: string }) =>
    request<{ success: boolean; user: AuthUser; token: string; message?: string }>(
      "/auth/register",
      { method: "POST", body: JSON.stringify(data) },
    ),

  login: (data: { email: string; password: string }) =>
    request<{ success: boolean; user: AuthUser; token: string; message?: string }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify(data) },
    ),

  getCurrentUser: () =>
    request<{ success: boolean; user: AuthUser; message?: string }>("/auth/me"),

  logout: () => request<{ success: boolean }>("/auth/logout", { method: "POST" }),
};

// ========== 作品 ==========
export interface Novel {
  id: string;
  userId: string;
  title: string;
  genre: string;
  status: string;
  wordCount: number;
  chapterCount: number;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  targetWordCount: number;
  progress: number;
}

export const novelApi = {
  list: () => request<Novel[]>("/novels"),
  get: (id: string) => request<Novel>(`/novels/${id}`),
  create: (data: Partial<Novel>) =>
    request<Novel>("/novels", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Novel>) =>
    request<Novel>(`/novels/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => request<{ success: boolean }>(`/novels/${id}`, { method: "DELETE" }),
};

// ========== 章节 ==========
export interface Chapter {
  id: string;
  novelId: string;
  volume: string;
  chapterNumber: number;
  title: string;
  content: string;
  summary: string;
  wordCount: number;
  status: string;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export const chapterApi = {
  list: (novelId: string) => request<Chapter[]>(`/novels/${novelId}/chapters`),
  create: (novelId: string, data: Partial<Chapter>) =>
    request<Chapter>(`/novels/${novelId}/chapters`, { method: "POST", body: JSON.stringify(data) }),
  update: (novelId: string, id: string, data: Partial<Chapter>) =>
    request<Chapter>(`/novels/${novelId}/chapters/${id}`, {
      method: "PUT", body: JSON.stringify(data) }),
  delete: (novelId: string, id: string) =>
    request<{ success: boolean }>(`/novels/${novelId}/chapters/${id}`, { method: "DELETE" }),
};

// ========== 角色 ==========
export interface Character {
  id: string;
  novelId: string;
  name: string;
  role: string;
  age: number;
  appearance: string;
  personality: string;
  background: string;
  motivation: string;
  relationship: string;
  avatarColor: string;
  createdAt: string;
}

export const characterApi = {
  list: (novelId: string) => request<Character[]>(`/novels/${novelId}/characters`),
  create: (novelId: string, data: Partial<Character> & { aiGenerate?: boolean; description?: string }) =>
    request<Character>(`/novels/${novelId}/characters`, { method: "POST", body: JSON.stringify(data) }),
  update: (novelId: string, id: string, data: Partial<Character>) =>
    request<Character>(`/novels/${novelId}/characters/${id}`, {
      method: "PUT", body: JSON.stringify(data) }),
  delete: (novelId: string, id: string) =>
    request<{ success: boolean }>(`/novels/${novelId}/characters/${id}`, { method: "DELETE" }),
};

// ========== 世界观 ==========
export interface WorldSetting {
  id: string;
  novelId: string;
  title: string;
  category: string;
  content: string;
  createdAt: string;
}

export const worldApi = {
  list: (novelId: string) => request<WorldSetting[]>(`/novels/${novelId}/world`),
  create: (novelId: string, data: Partial<WorldSetting>) =>
    request<WorldSetting>(`/novels/${novelId}/world`, { method: "POST", body: JSON.stringify(data) }),
  update: (novelId: string, id: string, data: Partial<WorldSetting>) =>
    request<WorldSetting>(`/novels/${novelId}/world/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (novelId: string, id: string) =>
    request<{ success: boolean }>(`/novels/${novelId}/world/${id}`, { method: "DELETE" }),
};

// ========== 伏笔 ==========
export interface Foreshadow {
  id: string;
  novelId: string;
  title: string;
  content: string;
  payoffChapter?: number;
  status: string;
  createdAt: string;
}

export const foreshadowApi = {
  list: (novelId: string) => request<Foreshadow[]>(`/novels/${novelId}/foreshadow`),
  create: (novelId: string, data: Partial<Foreshadow>) =>
    request<Foreshadow>(`/novels/${novelId}/foreshadow`, { method: "POST", body: JSON.stringify(data) }),
  update: (novelId: string, id: string, data: Partial<Foreshadow>) =>
    request<Foreshadow>(`/novels/${novelId}/foreshadow/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (novelId: string, id: string) =>
    request<{ success: boolean }>(`/novels/${novelId}/foreshadow/${id}`, { method: "DELETE" }),
};

// ========== 约束 ==========
export interface Constraint {
  id: string;
  novelId: string;
  type: string;
  content: string;
  createdAt: string;
}

export const constraintApi = {
  list: (novelId: string) => request<Constraint[]>(`/novels/${novelId}/constraints`),
  create: (novelId: string, data: Partial<Constraint>) =>
    request<Constraint>(`/novels/${novelId}/constraints`, { method: "POST", body: JSON.stringify(data) }),
  update: (novelId: string, id: string, data: Partial<Constraint>) =>
    request<Constraint>(`/novels/${novelId}/constraints/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (novelId: string, id: string) =>
    request<{ success: boolean }>(`/novels/${novelId}/constraints/${id}`, { method: "DELETE" }),
};

// ========== AI 相关 ==========
export interface Outline {
  title: string;
  theme: string;
  mainOutline: string;
  volumes: { title: string; description: string; chapterCount: number; coreConflict: string }[];
  highlights: string[];
}

export const aiApi = {
  generateOutline: (data: { title: string; genre: string; theme: string; description: string }) =>
    request<Outline>("/ai/outline", { method: "POST", body: JSON.stringify(data) }),

  generateCharacter: (data: {
    novelId: string;
    role: string;
    description: string;
    existingNames?: string[];
  }) => request<Character>(`/novels/${data.novelId}/characters`, {
    method: "POST",
    body: JSON.stringify({ ...data, aiGenerate: true }),
  }),

  generateCharacters: (data: {
    title: string;
    genre: string;
    description: string;
    volumes: string;
    existingNames?: string[];
    worldview?: string;
    existingRoles?: { name: string; role: string }[];
    chapters?: string;
  }) => request<{ characters: { name: string; role: string; age: number; appearance: string; personality: string; background: string; motivation: string; relationship: string }[] }>("/ai/generate-characters", {
    method: "POST",
    body: JSON.stringify(data),
  }),

  generateChapter: (data: {
    novelId: string; chapterNumber: number; outline: string }) =>
    request<{ chapterNumber: number; title: string; content: string; summary: string }>(
      `/novels/${data.novelId}/generate-chapter`,
      { method: "POST", body: JSON.stringify(data) },
    ),

  continueChapter: (data: { currentContent: string; novelTitle?: string; genre?: string; characters?: string; worldview?: string; volumes?: string; chapterInfo?: string }) =>
    request<{ content: string }>("/ai/continue", { method: "POST", body: JSON.stringify(data) }),

  expandContent: (data: { content: string; novelTitle?: string; genre?: string; characters?: string; worldview?: string }) =>
    request<{ content: string }>("/ai/expand", { method: "POST", body: JSON.stringify(data) }),

  addConflict: (data: { content: string; novelTitle?: string; genre?: string; characters?: string; worldview?: string }) =>
    request<{ content: string }>("/ai/conflict", { method: "POST", body: JSON.stringify(data) }),

  generateShortStory: (data: { theme: string; style: string; keywords: string }) =>
    request<{ title: string; content: string }>("/ai/short-story", { method: "POST", body: JSON.stringify(data) }),

  convertToScript: (data: { content: string; style: string }) =>
    request<{ content: string }>("/ai/to-script", { method: "POST", body: JSON.stringify(data) }),

  generateHighlights: (data: { title: string; genre: string; theme: string }) =>
    request<{ highlights: string[] }>("/ai/highlights", { method: "POST", body: JSON.stringify(data) }),

  generateWorldviewByCategories: (data: { title: string; genre: string; description: string }) =>
    request<{ items: { category: string; title: string; content: string }[] }>("/ai/worldview-categories", { method: "POST", body: JSON.stringify(data) }),

  generateTitle: (data: { genre: string; description: string }) =>
    request<{ title: string }>("/ai/generate-title", { method: "POST", body: JSON.stringify(data) }),

  generateChapterOutline: (data: {
    novelTitle: string;
    genre: string;
    volumes: string;
    chapterNumber: number;
    previousChapterContent?: string;
    worldview?: string;
    characters?: string;
    foreshadowing?: string;
  }) => request<{ subtitle: string; outline: string }>("/ai/chapter-outline", {
    method: "POST",
    body: JSON.stringify(data),
  }),

  generateChapterContent: (data: {
    novelTitle: string;
    genre: string;
    chapterNumber: number;
    outline: string;
    previousChapterContent?: string;
  }) => request<{ chapterNumber: number; title: string; content: string; summary: string }>(
    "/ai/generate-chapter-content",
    { method: "POST", body: JSON.stringify(data) },
  ),

  parseNovel: (text: string) =>
    request<{
      title: string;
      genre: string;
      description: string;
      volumes: { title: string; description: string; chapterCount: number; coreConflict: string }[];
      characters: { name: string; role: string; personality: string; background: string }[];
      chapters: { title: string; content: string }[];
      worldview: { category: string; title: string; content: string }[];
      foreshadowing: { title: string; content: string }[];
    }>("/ai/parse-novel", { method: "POST", body: JSON.stringify({ text }) }),

  novelOutline: (novelId: string, data: { title: string; genre: string; theme: string; description: string }) =>
    request<Outline>(`/novels/${novelId}/outline`, { method: "POST", body: JSON.stringify(data) }),
};
