export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  penName: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface Novel {
  id: string;
  userId: string;
  title: string;
  genre: string;
  status: "draft" | "ongoing" | "archived";
  wordCount: number;
  chapterCount: number;
  coverImage?: string;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  targetWordCount: number;
  progress: number;
}

export interface Character {
  id: string;
  novelId: string;
  name: string;
  role: "主角" | "配角" | "反派" | "龙套";
  age: number;
  appearance: string;
  personality: string;
  background: string;
  motivation: string;
  relationship: string;
  avatarColor: string;
  createdAt: string;
}

export interface WorldSetting {
  id: string;
  novelId: string;
  title: string;
  category: string;
  content: string;
  createdAt: string;
}

export interface Foreshadow {
  id: string;
  novelId: string;
  title: string;
  content: string;
  payoffChapter?: number;
  status: "埋入" | "回收" | "待定";
  createdAt: string;
}

export interface Constraint {
  id: string;
  novelId: string;
  type: "风格约束" | "人设约束" | "剧情约束" | "细节约束";
  content: string;
  createdAt: string;
}

export interface Chapter {
  id: string;
  novelId: string;
  volume: string;
  chapterNumber: number;
  title: string;
  content: string;
  summary: string;
  wordCount: number;
  status: "未写" | "草稿" | "已完成";
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Outline {
  id: string;
  novelId: string;
  title: string;
  theme: string;
  mainOutline: string;
  volumes: Volume[];
  highlights: string[];
  createdAt: string;
}

export interface Volume {
  id: string;
  title: string;
  description: string;
  chapterCount: number;
  coreConflict: string;
}

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GenerateOptions {
  prompt: string;
  context?: string;
  style?: string;
  tone?: string;
  length?: "short" | "medium" | "long";
}

export interface ChapterDraft {
  chapterNumber: number;
  title: string;
  content: string;
  summary: string;
}
