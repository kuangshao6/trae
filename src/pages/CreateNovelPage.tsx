import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ChevronRight, Loader2 } from "lucide-react";
import { novelApi, aiApi, worldApi, characterApi } from "../lib/api";
import Layout from "../components/Layout";

const GENRES = [
  { emoji: "🗡️", name: "玄幻" },
  { emoji: "⛰️", name: "仙侠" },
  { emoji: "🏙️", name: "都市" },
  { emoji: "🚀", name: "科幻" },
  { emoji: "💕", name: "言情" },
  { emoji: "🔍", name: "悬疑" },
  { emoji: "📜", name: "历史" },
  { emoji: "🎮", name: "游戏" },
  { emoji: "⚔️", name: "军事" },
  { emoji: "🥋", name: "武侠" },
  { emoji: "✨", name: "其他" },
];

const WORD_COUNT_OPTIONS = [
  { label: "20万字", value: 200000 },
  { label: "50万字", value: 500000 },
  { label: "100万字", value: 1000000 },
];

export default function CreateNovelPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [targetWordCount, setTargetWordCount] = useState(200000);
  const [customWordCount, setCustomWordCount] = useState("");
  const [isCustomWordCount, setIsCustomWordCount] = useState(false);
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [generating, setGenerating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [progress, setProgress] = useState("");

  const effectiveWordCount = isCustomWordCount
    ? Number(customWordCount) || 0
    : targetWordCount;

  const handleGenerateOutline = async () => {
    setGenerating(true);
    try {
      const result = await aiApi.generateOutline({
        title: title || `${genre || "原创"}小说`,
        genre: genre || "其他",
        theme: `请直接写一个300字左右的故事简介，像给人讲故事一样自然，不要用"故事融合了""力图为读者呈现"这种套话。${genre || "原创"}题材网文`,
        description: description || "",
      });
      if (result.mainOutline) {
        // 截取前300字左右
        const text = result.mainOutline;
        setDescription(text.length > 350 ? text.slice(0, 300) + "..." : text);
      }
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    setProgress("正在创建作品...");
    try {
      const tagsArray = tags
        .split(/[,，]/)
        .map((t) => t.trim())
        .filter(Boolean);

      // 如果没有标题，用AI生成
      let finalTitle = title.trim();
      if (!finalTitle) {
        setProgress("正在生成标题...");
        try {
          const titleResult = await aiApi.generateTitle({
            genre: genre || "其他",
            description: description || "",
          });
          finalTitle = titleResult.title || `${genre || "原创"}小说`;
        } catch {
          finalTitle = `${genre || "原创"}小说`;
        }
      }

      const novel = await novelApi.create({
        title: finalTitle,
        genre: genre || "其他",
        description,
        tags: tagsArray,
        targetWordCount: effectiveWordCount || 200000,
      });
      const novelId = novel.id;

      // 如果简介过短（< 100字且非空），先用 AI 扩写
      let finalDescription = description;
      if (finalDescription && finalDescription.trim().length > 0 && finalDescription.trim().length < 100) {
        setProgress("正在扩写简介...");
        try {
          const expandResult = await aiApi.generateOutline({
            title: finalTitle,
            genre: genre || "其他",
            theme: `请将以下简短描述扩写为200-300字的故事简介，保留原始意图和关键信息，像讲故事一样自然，不要用AI套话。${genre || "原创"}题材`,
            description: finalDescription,
          });
          if (expandResult?.mainOutline) {
            finalDescription = expandResult.mainOutline;
            // 更新作品简介
            await novelApi.update(novelId, { description: finalDescription });
          }
        } catch (err) {
          console.error("扩写简介失败:", err);
        }
      }

      // 并行调用 AI 生成
      const outlinePromise = aiApi.generateOutline({
        title: finalTitle,
        genre: genre || "其他",
        theme: `请生成一个完整的故事大纲。${genre || "原创"}题材网文`,
        description: finalDescription || "",
      }).catch((err) => {
        console.error("生成大纲失败:", err);
        return null;
      });

      // 先等大纲生成完成
      setProgress("正在生成分卷框架...");
      const outlineResult = await outlinePromise;

      // 保存生成的大纲数据
      if (outlineResult) {
        // 保存简介
        if (outlineResult.mainOutline) {
          await novelApi.update(novelId, {
            description: outlineResult.mainOutline,
          });
        } else if (finalDescription) {
          await novelApi.update(novelId, {
            description: finalDescription,
          });
        }
        // 保存分卷框架到世界观设定
        if (outlineResult.volumes && outlineResult.volumes.length > 0) {
          await worldApi.create(novelId, {
            title: "volumes",
            category: "outline",
            content: JSON.stringify(outlineResult.volumes),
          });
        }
      }

      // 生成世界观（大段文本，后续可手动分类）
      let worldviewContent = "";
      setProgress("正在生成世界观...");
      try {
        const worldviewResult = await aiApi.generateOutline({
          title: finalTitle,
          genre: genre || "其他",
          theme: `请只生成世界观设定，包括时代背景、地理环境、社会结构、力量体系等。不要包含任何故事主线、剧情梗概或角色经历。像给人介绍一个世界一样自然，不要用套话。${genre || "原创"}题材`,
          description: outlineResult?.mainOutline || finalDescription || "",
        });
        if (worldviewResult?.mainOutline) {
          worldviewContent = worldviewResult.mainOutline;
          await worldApi.create(novelId, {
            title: "世界观设定",
            category: "outline",
            content: worldviewResult.mainOutline,
          });
        }
      } catch (err) {
        console.error("生成世界观失败:", err);
      }

      // 基于大纲和世界观内容批量生成角色
      setProgress("正在生成角色...");
      const charactersResult = await aiApi.generateCharacters({
        title: finalTitle,
        genre: genre || "其他",
        description: outlineResult?.mainOutline || description || "",
        volumes: outlineResult?.volumes ? JSON.stringify(outlineResult.volumes) : "[]",
        worldview: worldviewContent,
      }).catch((err) => {
        console.error("批量生成角色失败:", err);
        return { characters: [] };
      });

      // 保存角色
      if (charactersResult.characters && charactersResult.characters.length > 0) {
        for (const char of charactersResult.characters) {
          try {
            await characterApi.create(novelId, {
              name: char.name,
              role: char.role,
              age: char.age,
              appearance: char.appearance,
              personality: char.personality,
              background: char.background,
              motivation: char.motivation,
              relationship: char.relationship,
              avatarColor: char.avatarColor,
            });
          } catch (err) {
            console.error("保存角色失败:", err);
          }
        }
      }

      // 跳转到大纲页面
      navigate(`/novels/outline?novelId=${novelId}`);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setCreating(false);
      setProgress("");
    }
  };

  const selectedGenreEmoji = GENRES.find((g) => g.name === genre)?.emoji || "";

  return (
    <Layout>
      {/* 面包屑 + 标题 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-ink-500 mb-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="hover:text-accent-600 transition-colors"
          >
            工作台
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-ink-800 font-medium">创建新作品</span>
        </div>
        <h1 className="text-2xl font-bold text-ink-800 font-sketchy">创建新作品</h1>
      </div>

      {/* 主体：左表单 + 右预览 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-8">
        {/* 左侧表单 */}
        <div className="space-y-6">
          {/* 作品标题 */}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              作品标题
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-sketchy text-lg"
              placeholder="为你的作品起个名字"
            />
          </div>

          {/* 题材选择 */}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              题材选择
            </label>
            <div className="grid grid-cols-3 gap-3">
              {GENRES.map((g) => (
                <button
                  key={g.name}
                  type="button"
                  onClick={() => setGenre(g.name)}
                  className={`flex items-center gap-2 px-4 py-3 border-2 text-sm font-medium transition-all ${
                    genre === g.name
                      ? "border-accent-500 bg-accent-50 text-accent-700"
                      : "border-ink-200 bg-white text-ink-700 hover:border-ink-300"
                  }`}
                  style={{borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px'}}
                >
                  <span className="text-lg">{g.emoji}</span>
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          {/* 目标字数 */}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              目标字数
            </label>
            <div className="flex flex-wrap gap-3">
              {WORD_COUNT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setTargetWordCount(opt.value);
                    setIsCustomWordCount(false);
                  }}
                  className={`px-5 py-2.5 border-2 text-sm font-medium transition-all ${
                    !isCustomWordCount && targetWordCount === opt.value
                      ? "border-accent-500 bg-accent-50 text-accent-700"
                      : "border-ink-200 bg-white text-ink-700 hover:border-ink-300"
                  }`}
                  style={{borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px'}}
                >
                  {opt.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsCustomWordCount(true)}
                className={`px-5 py-2.5 border-2 text-sm font-medium transition-all ${
                  isCustomWordCount
                    ? "border-accent-500 bg-accent-50 text-accent-700"
                    : "border-ink-200 bg-white text-ink-700 hover:border-ink-300"
                }`}
                style={{borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px'}}
              >
                自定义
              </button>
            </div>
            {isCustomWordCount && (
              <input
                type="number"
                value={customWordCount}
                onChange={(e) => setCustomWordCount(e.target.value)}
                className="input-sketchy mt-3"
                placeholder="输入目标字数"
                min={1000}
              />
            )}
          </div>

          {/* 标签 */}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              标签
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="input-sketchy"
              placeholder="输入标签，用逗号分隔"
            />
          </div>

          {/* 作品简介 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-ink-700">
                作品简介
              </label>
              <button
                type="button"
                onClick={handleGenerateOutline}
                disabled={generating}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-accent-600 bg-accent-50 hover:bg-accent-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px'}}
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {generating ? "生成中..." : description ? "换一个" : "AI 生成简介"}
              </button>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="input-sketchy resize-none"
              placeholder="描述你的故事..."
            />
          </div>
        </div>

        {/* 右侧预览 */}
        <div className="lg:sticky lg:top-24 self-start">
          <div className="card-sketchy">
            <h3 className="text-sm font-semibold text-ink-500 uppercase tracking-wider mb-4">
              实时预览
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-xl font-bold text-ink-800 font-sketchy">
                  {title || "未命名作品"}
                </div>
              </div>

              {genre && (
                <div className="flex items-center gap-2">
                  <span className="tag-sketchy">
                    {selectedGenreEmoji} {genre}
                  </span>
                </div>
              )}

              {tags && (
                <div className="flex flex-wrap gap-1.5">
                  {tags
                    .split(/[,，]/)
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((tag, idx) => (
                      <span
                        key={idx}
                        className="tag-sketchy"
                      >
                        #{tag}
                      </span>
                    ))}
                </div>
              )}

              <p className="text-sm text-ink-500 line-clamp-4">
                {description || "暂无简介"}
              </p>

              <div className="pt-3 border-t border-ink-100">
                <div className="text-xs text-ink-400">
                  目标字数：{effectiveWordCount ? effectiveWordCount.toLocaleString() : "—"} 字
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="sticky bottom-0 left-0 right-0 bg-paper border-t-2 border-ink-300 -mx-4 md:-mx-8 px-4 md:px-8 py-4 mt-8 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="btn-sketchy"
        >
          取消
        </button>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="btn-sketchy-primary"
        >
          {creating && <Loader2 className="w-4 h-4 animate-spin" />}
          {creating ? progress || "生成中..." : "生成大纲"}
        </button>
      </div>
    </Layout>
  );
}
