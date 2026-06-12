-- AI小说家创作平台 - Supabase 数据库建表脚本
-- 在 Supabase SQL Editor 中执行此脚本

-- ========== 用户表 ==========
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  pen_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========== 作品表 ==========
CREATE TABLE IF NOT EXISTS novels (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  genre TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ongoing', 'archived')),
  word_count INTEGER NOT NULL DEFAULT 0,
  chapter_count INTEGER NOT NULL DEFAULT 0,
  cover_image TEXT,
  description TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  target_word_count INTEGER NOT NULL DEFAULT 0,
  progress INTEGER NOT NULL DEFAULT 0
);

-- ========== 角色表 ==========
CREATE TABLE IF NOT EXISTS characters (
  id TEXT PRIMARY KEY,
  novel_id TEXT NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '龙套' CHECK (role IN ('主角', '配角', '反派', '龙套')),
  age INTEGER NOT NULL DEFAULT 0,
  appearance TEXT NOT NULL DEFAULT '',
  personality TEXT NOT NULL DEFAULT '',
  background TEXT NOT NULL DEFAULT '',
  motivation TEXT NOT NULL DEFAULT '',
  relationship TEXT NOT NULL DEFAULT '',
  avatar_color TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========== 世界观表 ==========
CREATE TABLE IF NOT EXISTS world_settings (
  id TEXT PRIMARY KEY,
  novel_id TEXT NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========== 伏笔表 ==========
CREATE TABLE IF NOT EXISTS foreshadows (
  id TEXT PRIMARY KEY,
  novel_id TEXT NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  payoff_chapter INTEGER,
  status TEXT NOT NULL DEFAULT '待定' CHECK (status IN ('埋入', '回收', '待定')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========== 约束表 ==========
CREATE TABLE IF NOT EXISTS constraints (
  id TEXT PRIMARY KEY,
  novel_id TEXT NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT '风格约束' CHECK (type IN ('风格约束', '人设约束', '剧情约束', '细节约束')),
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========== 章节表 ==========
CREATE TABLE IF NOT EXISTS chapters (
  id TEXT PRIMARY KEY,
  novel_id TEXT NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  volume TEXT NOT NULL DEFAULT '',
  chapter_number INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  word_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT '未写' CHECK (status IN ('未写', '草稿', '已完成')),
  ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========== 索引 ==========
CREATE INDEX IF NOT EXISTS idx_novels_user_id ON novels(user_id);
CREATE INDEX IF NOT EXISTS idx_characters_novel_id ON characters(novel_id);
CREATE INDEX IF NOT EXISTS idx_world_settings_novel_id ON world_settings(novel_id);
CREATE INDEX IF NOT EXISTS idx_foreshadows_novel_id ON foreshadows(novel_id);
CREATE INDEX IF NOT EXISTS idx_constraints_novel_id ON constraints(novel_id);
CREATE INDEX IF NOT EXISTS idx_chapters_novel_id ON chapters(novel_id);

-- ========== RLS 策略（使用 service_role key 绕过） ==========
-- 由于后端使用 service_role key，不需要启用 RLS
-- 如果需要行级安全，可取消以下注释

-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE novels ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE world_settings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE foreshadows ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE constraints ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
