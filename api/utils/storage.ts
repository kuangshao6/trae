import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { supabase, isSupabaseAvailable } from "./supabase";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "..", "data");

// ========== 数据模型接口 ==========

interface DataStore {
  users: UserRecord[];
  novels: NovelRecord[];
  characters: CharacterRecord[];
  worldSettings: WorldSettingRecord[];
  foreshadows: ForeshadowRecord[];
  constraints: ConstraintRecord[];
  chapters: ChapterRecord[];
  volumes: VolumeRecord[];
}

interface UserRecord {
  id: string;
  username: string;
  email: string;
  password: string;
  penName: string;
  createdAt: string;
}

interface NovelRecord {
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

interface CharacterRecord {
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

interface WorldSettingRecord {
  id: string;
  novelId: string;
  title: string;
  category: string;
  content: string;
  createdAt: string;
}

interface ForeshadowRecord {
  id: string;
  novelId: string;
  title: string;
  content: string;
  payoffChapter?: number;
  status: "埋入" | "回收" | "待定";
  createdAt: string;
}

interface ConstraintRecord {
  id: string;
  novelId: string;
  type: "风格约束" | "人设约束" | "剧情约束" | "细节约束";
  content: string;
  createdAt: string;
}

interface ChapterRecord {
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

interface VolumeRecord {
  id: string;
  novelId: string;
  title: string;
  description: string;
  chapterCount: number;
  coreConflict: string;
  createdAt: string;
}

// ========== 工具函数 ==========

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

export function now(): string {
  return new Date().toISOString();
}

// Supabase 字段名转换：camelCase → snake_case
function toSnakeCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = value;
  }
  return result;
}

// Supabase 字段名转换：snake_case → camelCase
function toCamelCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = value;
  }
  return result;
}

// ========== 本地 JSON 存储（开发模式降级） ==========

function initializeStore(): DataStore {
  return {
    users: [],
    novels: [],
    characters: [],
    worldSettings: [],
    foreshadows: [],
    constraints: [],
    chapters: [],
    volumes: [],
  };
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

const DATA_FILE = path.join(DATA_DIR, "store.json");

function loadStore(): DataStore {
  ensureDataDir();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
      // 数据迁移：将 worldSettings 中 title="volumes" 的数据迁移到 volumes 存储
      if (raw.volumes === undefined) {
        raw.volumes = [];
      }
      const volumesEntries = raw.worldSettings?.filter((w: any) => w.title === "volumes") || [];
      if (volumesEntries.length > 0) {
        for (const entry of volumesEntries) {
          try {
            const volumesData = JSON.parse(entry.content);
            if (Array.isArray(volumesData)) {
              for (const vol of volumesData) {
                raw.volumes.push({
                  id: generateId(),
                  novelId: entry.novelId,
                  title: vol.title || "",
                  description: vol.description || "",
                  chapterCount: vol.chapterCount || 10,
                  coreConflict: vol.coreConflict || "",
                  createdAt: entry.createdAt || now(),
                });
              }
            }
          } catch {
            // 解析失败则跳过
          }
        }
        // 删除已迁移的 worldSettings 条目
        raw.worldSettings = raw.worldSettings.filter((w: any) => w.title !== "volumes");
      }
      return raw;
    }
  } catch {
    // ignore parse errors
  }
  const store = initializeStore();
  saveStore(store);
  return store;
}

function saveStore(store: DataStore): void {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
}

let inMemoryStore: DataStore = loadStore();
let saveTimeout: NodeJS.Timeout | null = null;

function scheduleSave(): void {
  if (saveTimeout) return;
  saveTimeout = setTimeout(() => {
    saveStore(inMemoryStore);
    saveTimeout = null;
  }, 100);
}

// ========== 用户存储 ==========

export const userStore = {
  findAll(): UserRecord[] {
    if (isSupabaseAvailable()) {
      // 同步方法不支持 Supabase，返回空数组
      // 此方法仅用于内部，实际查询走 findByEmail/findById
      console.warn("userStore.findAll() 不支持 Supabase 模式，请使用异步方法");
      return [];
    }
    return inMemoryStore.users;
  },

  async findAllAsync(): Promise<UserRecord[]> {
    if (!isSupabaseAvailable()) {
      return inMemoryStore.users;
    }
    const { data, error } = await supabase!.from("users").select("*");
    if (error) throw error;
    return data.map(toCamelCase) as UserRecord[];
  },

  findByEmail(email: string): UserRecord | undefined {
    if (isSupabaseAvailable()) {
      console.warn("userStore.findByEmail() 同步方法在 Supabase 模式下不可用，请使用 findByEmailAsync");
      return undefined;
    }
    return inMemoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  async findByEmailAsync(email: string): Promise<UserRecord | undefined> {
    if (!isSupabaseAvailable()) {
      return inMemoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    }
    const { data, error } = await supabase!
      .from("users")
      .select("*")
      .ilike("email", email)
      .maybeSingle();
    if (error) throw error;
    return data ? (toCamelCase(data) as UserRecord) : undefined;
  },

  findById(id: string): UserRecord | undefined {
    if (isSupabaseAvailable()) {
      console.warn("userStore.findById() 同步方法在 Supabase 模式下不可用，请使用 findByIdAsync");
      return undefined;
    }
    return inMemoryStore.users.find((u) => u.id === id);
  },

  async findByIdAsync(id: string): Promise<UserRecord | undefined> {
    if (!isSupabaseAvailable()) {
      return inMemoryStore.users.find((u) => u.id === id);
    }
    const { data, error } = await supabase!.from("users").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? (toCamelCase(data) as UserRecord) : undefined;
  },

  create(data: Omit<UserRecord, "id" | "createdAt">): UserRecord {
    if (isSupabaseAvailable()) {
      throw new Error("Supabase 模式下请使用 createAsync");
    }
    const user: UserRecord = { ...data, id: generateId(), createdAt: now() };
    inMemoryStore.users.push(user);
    scheduleSave();
    return user;
  },

  async createAsync(data: Omit<UserRecord, "id" | "createdAt">): Promise<UserRecord> {
    if (!isSupabaseAvailable()) {
      const user: UserRecord = { ...data, id: generateId(), createdAt: now() };
      inMemoryStore.users.push(user);
      scheduleSave();
      return user;
    }
    const id = generateId();
    const createdAt = now();
    const row = toSnakeCase({ ...data, id, createdAt });
    const { data: inserted, error } = await supabase!.from("users").insert(row).select().single();
    if (error) throw error;
    return toCamelCase(inserted) as UserRecord;
  },
};

// ========== 作品存储 ==========

export const novelStore = {
  findByUserId(userId: string): NovelRecord[] {
    if (isSupabaseAvailable()) {
      console.warn("novelStore.findByUserId() 同步方法在 Supabase 模式下不可用，请使用 findByUserIdAsync");
      return [];
    }
    return inMemoryStore.novels
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  async findByUserIdAsync(userId: string): Promise<NovelRecord[]> {
    if (!isSupabaseAvailable()) {
      return inMemoryStore.novels
        .filter((n) => n.userId === userId)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
    const { data, error } = await supabase!
      .from("novels")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data.map(toCamelCase) as NovelRecord[];
  },

  findById(id: string): NovelRecord | undefined {
    if (isSupabaseAvailable()) {
      console.warn("novelStore.findById() 同步方法在 Supabase 模式下不可用，请使用 findByIdAsync");
      return undefined;
    }
    return inMemoryStore.novels.find((n) => n.id === id);
  },

  async findByIdAsync(id: string): Promise<NovelRecord | undefined> {
    if (!isSupabaseAvailable()) {
      return inMemoryStore.novels.find((n) => n.id === id);
    }
    const { data, error } = await supabase!.from("novels").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? (toCamelCase(data) as NovelRecord) : undefined;
  },

  create(data: Omit<NovelRecord, "id" | "createdAt" | "updatedAt">): NovelRecord {
    if (isSupabaseAvailable()) {
      throw new Error("Supabase 模式下请使用 createAsync");
    }
    const novel: NovelRecord = { ...data, id: generateId(), createdAt: now(), updatedAt: now() };
    inMemoryStore.novels.push(novel);
    scheduleSave();
    return novel;
  },

  async createAsync(data: Omit<NovelRecord, "id" | "createdAt" | "updatedAt">): Promise<NovelRecord> {
    if (!isSupabaseAvailable()) {
      const novel: NovelRecord = { ...data, id: generateId(), createdAt: now(), updatedAt: now() };
      inMemoryStore.novels.push(novel);
      scheduleSave();
      return novel;
    }
    const id = generateId();
    const createdAt = now();
    const updatedAt = now();
    const row = toSnakeCase({ ...data, id, createdAt, updatedAt });
    const { data: inserted, error } = await supabase!.from("novels").insert(row).select().single();
    if (error) throw error;
    return toCamelCase(inserted) as NovelRecord;
  },

  update(id: string, data: Partial<NovelRecord>): NovelRecord | undefined {
    if (isSupabaseAvailable()) {
      throw new Error("Supabase 模式下请使用 updateAsync");
    }
    const idx = inMemoryStore.novels.findIndex((n) => n.id === id);
    if (idx === -1) return undefined;
    inMemoryStore.novels[idx] = { ...inMemoryStore.novels[idx], ...data, updatedAt: now() };
    scheduleSave();
    return inMemoryStore.novels[idx];
  },

  async updateAsync(id: string, data: Partial<NovelRecord>): Promise<NovelRecord | undefined> {
    if (!isSupabaseAvailable()) {
      const idx = inMemoryStore.novels.findIndex((n) => n.id === id);
      if (idx === -1) return undefined;
      inMemoryStore.novels[idx] = { ...inMemoryStore.novels[idx], ...data, updatedAt: now() };
      scheduleSave();
      return inMemoryStore.novels[idx];
    }
    const row = toSnakeCase({ ...data, updatedAt: now() });
    const { data: updated, error } = await supabase!
      .from("novels")
      .update(row)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return updated ? (toCamelCase(updated) as NovelRecord) : undefined;
  },

  remove(id: string): boolean {
    if (isSupabaseAvailable()) {
      throw new Error("Supabase 模式下请使用 removeAsync");
    }
    const before = inMemoryStore.novels.length;
    inMemoryStore.novels = inMemoryStore.novels.filter((n) => n.id !== id);
    inMemoryStore.characters = inMemoryStore.characters.filter((c) => c.novelId !== id);
    inMemoryStore.worldSettings = inMemoryStore.worldSettings.filter((w) => w.novelId !== id);
    inMemoryStore.foreshadows = inMemoryStore.foreshadows.filter((f) => f.novelId !== id);
    inMemoryStore.constraints = inMemoryStore.constraints.filter((c) => c.novelId !== id);
    inMemoryStore.chapters = inMemoryStore.chapters.filter((c) => c.novelId !== id);
    inMemoryStore.volumes = inMemoryStore.volumes.filter((v) => v.novelId !== id);
    scheduleSave();
    return inMemoryStore.novels.length < before;
  },

  async removeAsync(id: string): Promise<boolean> {
    if (!isSupabaseAvailable()) {
      const before = inMemoryStore.novels.length;
      inMemoryStore.novels = inMemoryStore.novels.filter((n) => n.id !== id);
      inMemoryStore.characters = inMemoryStore.characters.filter((c) => c.novelId !== id);
      inMemoryStore.worldSettings = inMemoryStore.worldSettings.filter((w) => w.novelId !== id);
      inMemoryStore.foreshadows = inMemoryStore.foreshadows.filter((f) => f.novelId !== id);
      inMemoryStore.constraints = inMemoryStore.constraints.filter((c) => c.novelId !== id);
      inMemoryStore.chapters = inMemoryStore.chapters.filter((c) => c.novelId !== id);
      inMemoryStore.volumes = inMemoryStore.volumes.filter((v) => v.novelId !== id);
      scheduleSave();
      return inMemoryStore.novels.length < before;
    }
    // 级联删除由数据库外键 ON DELETE CASCADE 处理
    const { error } = await supabase!.from("novels").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};

// ========== 角色存储 ==========

export const characterStore = {
  findByNovelId(novelId: string): CharacterRecord[] {
    if (isSupabaseAvailable()) {
      console.warn("characterStore.findByNovelId() 同步方法在 Supabase 模式下不可用，请使用 findByNovelIdAsync");
      return [];
    }
    return inMemoryStore.characters.filter((c) => c.novelId === novelId);
  },

  async findByNovelIdAsync(novelId: string): Promise<CharacterRecord[]> {
    if (!isSupabaseAvailable()) {
      return inMemoryStore.characters.filter((c) => c.novelId === novelId);
    }
    const { data, error } = await supabase!.from("characters").select("*").eq("novel_id", novelId);
    if (error) throw error;
    return data.map(toCamelCase) as CharacterRecord[];
  },

  create(data: Omit<CharacterRecord, "id" | "createdAt">): CharacterRecord {
    if (isSupabaseAvailable()) {
      throw new Error("Supabase 模式下请使用 createAsync");
    }
    const character: CharacterRecord = { ...data, id: generateId(), createdAt: now() };
    inMemoryStore.characters.push(character);
    scheduleSave();
    return character;
  },

  async createAsync(data: Omit<CharacterRecord, "id" | "createdAt">): Promise<CharacterRecord> {
    if (!isSupabaseAvailable()) {
      const character: CharacterRecord = { ...data, id: generateId(), createdAt: now() };
      inMemoryStore.characters.push(character);
      scheduleSave();
      return character;
    }
    const id = generateId();
    const createdAt = now();
    const row = toSnakeCase({ ...data, id, createdAt });
    const { data: inserted, error } = await supabase!.from("characters").insert(row).select().single();
    if (error) throw error;
    return toCamelCase(inserted) as CharacterRecord;
  },

  update(id: string, data: Partial<CharacterRecord>): CharacterRecord | undefined {
    if (isSupabaseAvailable()) {
      throw new Error("Supabase 模式下请使用 updateAsync");
    }
    const idx = inMemoryStore.characters.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    inMemoryStore.characters[idx] = { ...inMemoryStore.characters[idx], ...data };
    scheduleSave();
    return inMemoryStore.characters[idx];
  },

  async updateAsync(id: string, data: Partial<CharacterRecord>): Promise<CharacterRecord | undefined> {
    if (!isSupabaseAvailable()) {
      const idx = inMemoryStore.characters.findIndex((c) => c.id === id);
      if (idx === -1) return undefined;
      inMemoryStore.characters[idx] = { ...inMemoryStore.characters[idx], ...data };
      scheduleSave();
      return inMemoryStore.characters[idx];
    }
    const row = toSnakeCase(data);
    const { data: updated, error } = await supabase!
      .from("characters")
      .update(row)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return updated ? (toCamelCase(updated) as CharacterRecord) : undefined;
  },

  remove(id: string): boolean {
    if (isSupabaseAvailable()) {
      throw new Error("Supabase 模式下请使用 removeAsync");
    }
    const before = inMemoryStore.characters.length;
    inMemoryStore.characters = inMemoryStore.characters.filter((c) => c.id !== id);
    scheduleSave();
    return inMemoryStore.characters.length < before;
  },

  async removeAsync(id: string): Promise<boolean> {
    if (!isSupabaseAvailable()) {
      const before = inMemoryStore.characters.length;
      inMemoryStore.characters = inMemoryStore.characters.filter((c) => c.id !== id);
      scheduleSave();
      return inMemoryStore.characters.length < before;
    }
    const { error } = await supabase!.from("characters").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};

// ========== 世界观存储 ==========

export const worldSettingStore = {
  findByNovelId(novelId: string): WorldSettingRecord[] {
    if (isSupabaseAvailable()) {
      console.warn("worldSettingStore.findByNovelId() 同步方法在 Supabase 模式下不可用，请使用 findByNovelIdAsync");
      return [];
    }
    return inMemoryStore.worldSettings.filter((w) => w.novelId === novelId);
  },

  async findByNovelIdAsync(novelId: string): Promise<WorldSettingRecord[]> {
    if (!isSupabaseAvailable()) {
      return inMemoryStore.worldSettings.filter((w) => w.novelId === novelId);
    }
    const { data, error } = await supabase!.from("world_settings").select("*").eq("novel_id", novelId);
    if (error) throw error;
    return data.map(toCamelCase) as WorldSettingRecord[];
  },

  create(data: Omit<WorldSettingRecord, "id" | "createdAt">): WorldSettingRecord {
    if (isSupabaseAvailable()) {
      throw new Error("Supabase 模式下请使用 createAsync");
    }
    const ws: WorldSettingRecord = { ...data, id: generateId(), createdAt: now() };
    inMemoryStore.worldSettings.push(ws);
    scheduleSave();
    return ws;
  },

  async createAsync(data: Omit<WorldSettingRecord, "id" | "createdAt">): Promise<WorldSettingRecord> {
    if (!isSupabaseAvailable()) {
      const ws: WorldSettingRecord = { ...data, id: generateId(), createdAt: now() };
      inMemoryStore.worldSettings.push(ws);
      scheduleSave();
      return ws;
    }
    const id = generateId();
    const createdAt = now();
    const row = toSnakeCase({ ...data, id, createdAt });
    const { data: inserted, error } = await supabase!.from("world_settings").insert(row).select().single();
    if (error) throw error;
    return toCamelCase(inserted) as WorldSettingRecord;
  },

  update(id: string, data: Partial<WorldSettingRecord>): WorldSettingRecord | undefined {
    if (isSupabaseAvailable()) {
      throw new Error("Supabase 模式下请使用 updateAsync");
    }
    const idx = inMemoryStore.worldSettings.findIndex((w) => w.id === id);
    if (idx === -1) return undefined;
    inMemoryStore.worldSettings[idx] = { ...inMemoryStore.worldSettings[idx], ...data };
    scheduleSave();
    return inMemoryStore.worldSettings[idx];
  },

  async updateAsync(id: string, data: Partial<WorldSettingRecord>): Promise<WorldSettingRecord | undefined> {
    if (!isSupabaseAvailable()) {
      const idx = inMemoryStore.worldSettings.findIndex((w) => w.id === id);
      if (idx === -1) return undefined;
      inMemoryStore.worldSettings[idx] = { ...inMemoryStore.worldSettings[idx], ...data };
      scheduleSave();
      return inMemoryStore.worldSettings[idx];
    }
    const row = toSnakeCase(data);
    const { data: updated, error } = await supabase!
      .from("world_settings")
      .update(row)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return updated ? (toCamelCase(updated) as WorldSettingRecord) : undefined;
  },

  remove(id: string): boolean {
    if (isSupabaseAvailable()) {
      throw new Error("Supabase 模式下请使用 removeAsync");
    }
    const before = inMemoryStore.worldSettings.length;
    inMemoryStore.worldSettings = inMemoryStore.worldSettings.filter((w) => w.id !== id);
    scheduleSave();
    return inMemoryStore.worldSettings.length < before;
  },

  async removeAsync(id: string): Promise<boolean> {
    if (!isSupabaseAvailable()) {
      const before = inMemoryStore.worldSettings.length;
      inMemoryStore.worldSettings = inMemoryStore.worldSettings.filter((w) => w.id !== id);
      scheduleSave();
      return inMemoryStore.worldSettings.length < before;
    }
    const { error } = await supabase!.from("world_settings").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};

// ========== 伏笔存储 ==========

export const foreshadowStore = {
  findByNovelId(novelId: string): ForeshadowRecord[] {
    if (isSupabaseAvailable()) {
      console.warn("foreshadowStore.findByNovelId() 同步方法在 Supabase 模式下不可用，请使用 findByNovelIdAsync");
      return [];
    }
    return inMemoryStore.foreshadows.filter((f) => f.novelId === novelId);
  },

  async findByNovelIdAsync(novelId: string): Promise<ForeshadowRecord[]> {
    if (!isSupabaseAvailable()) {
      return inMemoryStore.foreshadows.filter((f) => f.novelId === novelId);
    }
    const { data, error } = await supabase!.from("foreshadows").select("*").eq("novel_id", novelId);
    if (error) throw error;
    return data.map(toCamelCase) as ForeshadowRecord[];
  },

  create(data: Omit<ForeshadowRecord, "id" | "createdAt">): ForeshadowRecord {
    if (isSupabaseAvailable()) {
      throw new Error("Supabase 模式下请使用 createAsync");
    }
    const fs: ForeshadowRecord = { ...data, id: generateId(), createdAt: now() };
    inMemoryStore.foreshadows.push(fs);
    scheduleSave();
    return fs;
  },

  async createAsync(data: Omit<ForeshadowRecord, "id" | "createdAt">): Promise<ForeshadowRecord> {
    if (!isSupabaseAvailable()) {
      const fs: ForeshadowRecord = { ...data, id: generateId(), createdAt: now() };
      inMemoryStore.foreshadows.push(fs);
      scheduleSave();
      return fs;
    }
    const id = generateId();
    const createdAt = now();
    const row = toSnakeCase({ ...data, id, createdAt });
    const { data: inserted, error } = await supabase!.from("foreshadows").insert(row).select().single();
    if (error) throw error;
    return toCamelCase(inserted) as ForeshadowRecord;
  },

  update(id: string, data: Partial<ForeshadowRecord>): ForeshadowRecord | undefined {
    if (isSupabaseAvailable()) {
      throw new Error("Supabase 模式下请使用 updateAsync");
    }
    const idx = inMemoryStore.foreshadows.findIndex((f) => f.id === id);
    if (idx === -1) return undefined;
    inMemoryStore.foreshadows[idx] = { ...inMemoryStore.foreshadows[idx], ...data };
    scheduleSave();
    return inMemoryStore.foreshadows[idx];
  },

  async updateAsync(id: string, data: Partial<ForeshadowRecord>): Promise<ForeshadowRecord | undefined> {
    if (!isSupabaseAvailable()) {
      const idx = inMemoryStore.foreshadows.findIndex((f) => f.id === id);
      if (idx === -1) return undefined;
      inMemoryStore.foreshadows[idx] = { ...inMemoryStore.foreshadows[idx], ...data };
      scheduleSave();
      return inMemoryStore.foreshadows[idx];
    }
    const row = toSnakeCase(data);
    const { data: updated, error } = await supabase!
      .from("foreshadows")
      .update(row)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return updated ? (toCamelCase(updated) as ForeshadowRecord) : undefined;
  },

  remove(id: string): boolean {
    if (isSupabaseAvailable()) {
      throw new Error("Supabase 模式下请使用 removeAsync");
    }
    const before = inMemoryStore.foreshadows.length;
    inMemoryStore.foreshadows = inMemoryStore.foreshadows.filter((f) => f.id !== id);
    scheduleSave();
    return inMemoryStore.foreshadows.length < before;
  },

  async removeAsync(id: string): Promise<boolean> {
    if (!isSupabaseAvailable()) {
      const before = inMemoryStore.foreshadows.length;
      inMemoryStore.foreshadows = inMemoryStore.foreshadows.filter((f) => f.id !== id);
      scheduleSave();
      return inMemoryStore.foreshadows.length < before;
    }
    const { error } = await supabase!.from("foreshadows").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};

// ========== 约束存储 ==========

export const constraintStore = {
  findByNovelId(novelId: string): ConstraintRecord[] {
    if (isSupabaseAvailable()) {
      console.warn("constraintStore.findByNovelId() 同步方法在 Supabase 模式下不可用，请使用 findByNovelIdAsync");
      return [];
    }
    return inMemoryStore.constraints.filter((c) => c.novelId === novelId);
  },

  async findByNovelIdAsync(novelId: string): Promise<ConstraintRecord[]> {
    if (!isSupabaseAvailable()) {
      return inMemoryStore.constraints.filter((c) => c.novelId === novelId);
    }
    const { data, error } = await supabase!.from("constraints").select("*").eq("novel_id", novelId);
    if (error) throw error;
    return data.map(toCamelCase) as ConstraintRecord[];
  },

  create(data: Omit<ConstraintRecord, "id" | "createdAt">): ConstraintRecord {
    if (isSupabaseAvailable()) {
      throw new Error("Supabase 模式下请使用 createAsync");
    }
    const cs: ConstraintRecord = { ...data, id: generateId(), createdAt: now() };
    inMemoryStore.constraints.push(cs);
    scheduleSave();
    return cs;
  },

  async createAsync(data: Omit<ConstraintRecord, "id" | "createdAt">): Promise<ConstraintRecord> {
    if (!isSupabaseAvailable()) {
      const cs: ConstraintRecord = { ...data, id: generateId(), createdAt: now() };
      inMemoryStore.constraints.push(cs);
      scheduleSave();
      return cs;
    }
    const id = generateId();
    const createdAt = now();
    const row = toSnakeCase({ ...data, id, createdAt });
    const { data: inserted, error } = await supabase!.from("constraints").insert(row).select().single();
    if (error) throw error;
    return toCamelCase(inserted) as ConstraintRecord;
  },

  update(id: string, data: Partial<ConstraintRecord>): ConstraintRecord | undefined {
    if (isSupabaseAvailable()) {
      throw new Error("Supabase 模式下请使用 updateAsync");
    }
    const idx = inMemoryStore.constraints.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    inMemoryStore.constraints[idx] = { ...inMemoryStore.constraints[idx], ...data };
    scheduleSave();
    return inMemoryStore.constraints[idx];
  },

  async updateAsync(id: string, data: Partial<ConstraintRecord>): Promise<ConstraintRecord | undefined> {
    if (!isSupabaseAvailable()) {
      const idx = inMemoryStore.constraints.findIndex((c) => c.id === id);
      if (idx === -1) return undefined;
      inMemoryStore.constraints[idx] = { ...inMemoryStore.constraints[idx], ...data };
      scheduleSave();
      return inMemoryStore.constraints[idx];
    }
    const row = toSnakeCase(data);
    const { data: updated, error } = await supabase!
      .from("constraints")
      .update(row)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return updated ? (toCamelCase(updated) as ConstraintRecord) : undefined;
  },

  remove(id: string): boolean {
    if (isSupabaseAvailable()) {
      throw new Error("Supabase 模式下请使用 removeAsync");
    }
    const before = inMemoryStore.constraints.length;
    inMemoryStore.constraints = inMemoryStore.constraints.filter((c) => c.id !== id);
    scheduleSave();
    return inMemoryStore.constraints.length < before;
  },

  async removeAsync(id: string): Promise<boolean> {
    if (!isSupabaseAvailable()) {
      const before = inMemoryStore.constraints.length;
      inMemoryStore.constraints = inMemoryStore.constraints.filter((c) => c.id !== id);
      scheduleSave();
      return inMemoryStore.constraints.length < before;
    }
    const { error } = await supabase!.from("constraints").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};

// ========== 章节存储 ==========

export const chapterStore = {
  findByNovelId(novelId: string): ChapterRecord[] {
    if (isSupabaseAvailable()) {
      console.warn("chapterStore.findByNovelId() 同步方法在 Supabase 模式下不可用，请使用 findByNovelIdAsync");
      return [];
    }
    return inMemoryStore.chapters
      .filter((c) => c.novelId === novelId)
      .sort((a, b) => a.chapterNumber - b.chapterNumber);
  },

  async findByNovelIdAsync(novelId: string): Promise<ChapterRecord[]> {
    if (!isSupabaseAvailable()) {
      return inMemoryStore.chapters
        .filter((c) => c.novelId === novelId)
        .sort((a, b) => a.chapterNumber - b.chapterNumber);
    }
    const { data, error } = await supabase!
      .from("chapters")
      .select("*")
      .eq("novel_id", novelId)
      .order("chapter_number", { ascending: true });
    if (error) throw error;
    return data.map(toCamelCase) as ChapterRecord[];
  },

  findById(id: string): ChapterRecord | undefined {
    if (isSupabaseAvailable()) {
      console.warn("chapterStore.findById() 同步方法在 Supabase 模式下不可用，请使用 findByIdAsync");
      return undefined;
    }
    return inMemoryStore.chapters.find((c) => c.id === id);
  },

  async findByIdAsync(id: string): Promise<ChapterRecord | undefined> {
    if (!isSupabaseAvailable()) {
      return inMemoryStore.chapters.find((c) => c.id === id);
    }
    const { data, error } = await supabase!.from("chapters").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? (toCamelCase(data) as ChapterRecord) : undefined;
  },

  create(data: Omit<ChapterRecord, "id" | "createdAt" | "updatedAt">): ChapterRecord {
    if (isSupabaseAvailable()) {
      throw new Error("Supabase 模式下请使用 createAsync");
    }
    const ch: ChapterRecord = { ...data, id: generateId(), createdAt: now(), updatedAt: now() };
    inMemoryStore.chapters.push(ch);
    scheduleSave();
    return ch;
  },

  async createAsync(data: Omit<ChapterRecord, "id" | "createdAt" | "updatedAt">): Promise<ChapterRecord> {
    if (!isSupabaseAvailable()) {
      const ch: ChapterRecord = { ...data, id: generateId(), createdAt: now(), updatedAt: now() };
      inMemoryStore.chapters.push(ch);
      scheduleSave();
      return ch;
    }
    const id = generateId();
    const createdAt = now();
    const updatedAt = now();
    const row = toSnakeCase({ ...data, id, createdAt, updatedAt });
    const { data: inserted, error } = await supabase!.from("chapters").insert(row).select().single();
    if (error) throw error;
    return toCamelCase(inserted) as ChapterRecord;
  },

  update(id: string, data: Partial<ChapterRecord>): ChapterRecord | undefined {
    if (isSupabaseAvailable()) {
      throw new Error("Supabase 模式下请使用 updateAsync");
    }
    const idx = inMemoryStore.chapters.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    inMemoryStore.chapters[idx] = { ...inMemoryStore.chapters[idx], ...data, updatedAt: now() };
    scheduleSave();
    return inMemoryStore.chapters[idx];
  },

  async updateAsync(id: string, data: Partial<ChapterRecord>): Promise<ChapterRecord | undefined> {
    if (!isSupabaseAvailable()) {
      const idx = inMemoryStore.chapters.findIndex((c) => c.id === id);
      if (idx === -1) return undefined;
      inMemoryStore.chapters[idx] = { ...inMemoryStore.chapters[idx], ...data, updatedAt: now() };
      scheduleSave();
      return inMemoryStore.chapters[idx];
    }
    const row = toSnakeCase({ ...data, updatedAt: now() });
    const { data: updated, error } = await supabase!
      .from("chapters")
      .update(row)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return updated ? (toCamelCase(updated) as ChapterRecord) : undefined;
  },

  remove(id: string): boolean {
    if (isSupabaseAvailable()) {
      throw new Error("Supabase 模式下请使用 removeAsync");
    }
    const before = inMemoryStore.chapters.length;
    inMemoryStore.chapters = inMemoryStore.chapters.filter((c) => c.id !== id);
    scheduleSave();
    return inMemoryStore.chapters.length < before;
  },

  async removeAsync(id: string): Promise<boolean> {
    if (!isSupabaseAvailable()) {
      const before = inMemoryStore.chapters.length;
      inMemoryStore.chapters = inMemoryStore.chapters.filter((c) => c.id !== id);
      scheduleSave();
      return inMemoryStore.chapters.length < before;
    }
    const { error } = await supabase!.from("chapters").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};

// ========== 卷存储 ==========

export const volumeStore = {
  findAll() {
    console.warn("volumeStore.findAll() 不支持 Supabase 模式，请使用异步方法");
    return inMemoryStore.volumes;
  },
  async findAllAsync() {
    if (await isSupabaseAvailable()) {
      const { data, error } = await supabase.from("volumes").select("*");
      if (error) throw error;
      return data.map(toCamelCase);
    }
    return inMemoryStore.volumes;
  },
  findByNovelId(novelId: string) {
    console.warn("volumeStore.findByNovelId() 同步方法在 Supabase 模式下不可用，请使用异步方法");
    return inMemoryStore.volumes.filter((v) => v.novelId === novelId);
  },
  async findByNovelIdAsync(novelId: string) {
    if (await isSupabaseAvailable()) {
      const { data, error } = await supabase.from("volumes").select("*").eq("novel_id", novelId);
      if (error) throw error;
      return data.map(toCamelCase);
    }
    return inMemoryStore.volumes.filter((v) => v.novelId === novelId);
  },
  create(data: Omit<VolumeRecord, "id" | "createdAt">) {
    const volume: VolumeRecord = {
      ...data,
      id: generateId(),
      createdAt: now(),
    };
    inMemoryStore.volumes.push(volume);
    saveStore(inMemoryStore);
    return volume;
  },
  async createAsync(data: Omit<VolumeRecord, "id" | "createdAt">) {
    if (await isSupabaseAvailable()) {
      const row = toSnakeCase({ ...data, id: generateId(), createdAt: now() });
      const { data: created, error } = await supabase.from("volumes").insert(row).select().single();
      if (error) throw error;
      return toCamelCase(created) as VolumeRecord;
    }
    const volume = this.create(data);
    return volume;
  },
  update(id: string, data: Partial<VolumeRecord>) {
    const idx = inMemoryStore.volumes.findIndex((v) => v.id === id);
    if (idx === -1) return null;
    inMemoryStore.volumes[idx] = { ...inMemoryStore.volumes[idx], ...data };
    saveStore(inMemoryStore);
    return inMemoryStore.volumes[idx];
  },
  async updateAsync(id: string, data: Partial<VolumeRecord>) {
    if (await isSupabaseAvailable()) {
      const { data: updated, error } = await supabase.from("volumes").update(toSnakeCase(data)).eq("id", id).select().single();
      if (error) throw error;
      return toCamelCase(updated) as VolumeRecord;
    }
    return this.update(id, data);
  },
  remove(id: string) {
    const before = inMemoryStore.volumes.length;
    inMemoryStore.volumes = inMemoryStore.volumes.filter((v) => v.id !== id);
    saveStore(inMemoryStore);
    return inMemoryStore.volumes.length < before;
  },
  async removeAsync(id: string) {
    if (await isSupabaseAvailable()) {
      const { error } = await supabase.from("volumes").delete().eq("id", id);
      if (error) throw error;
      return true;
    }
    return this.remove(id);
  },
};
