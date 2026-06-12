import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Sparkles, Expand, Zap, ChevronRight, BookOpen } from "lucide-react";
import { novelApi, chapterApi, aiApi, worldApi, characterApi, foreshadowApi, Chapter } from "../lib/api";
import Layout, { NovelSidebarNav } from "../components/Layout";

export default function ChapterEditor() {
  const { id, chapterId } = useParams();
  const navigate = useNavigate();

  const [novel, setNovel] = useState<any>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState("草稿");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [volumesData, setVolumesData] = useState<string>("");
  const [characters, setCharacters] = useState<any[]>([]);
  const [worldSettings, setWorldSettings] = useState<any[]>([]);

  // 侧边栏工具状态
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [aiInput, setAiInput] = useState("");
  const [aiOutput, setAiOutput] = useState("");

  // 自动保存
  const doSave = useCallback(async () => {
    if (!id || !chapterId || !chapter) return;
    setSaving(true);
    try {
      const updated = await chapterApi.update(id, chapterId, {
        title,
        content,
        summary,
        status,
        wordCount: content.length,
      });
      setChapter(updated);
      setLastSaved(new Date().toLocaleTimeString("zh-CN"));
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }, [id, chapterId, chapter, title, content, summary, status]);

  useEffect(() => {
    if (!id || !chapterId) return;
    loadData();
  }, [id, chapterId]);

  const loadData = async () => {
    if (!id || !chapterId) return;
    setLoading(true);
    try {
      const [n, c, chars, worlds] = await Promise.all([
        novelApi.get(id),
        chapterApi.list(id),
        characterApi.list(id),
        worldApi.list(id),
      ]);
      setNovel(n);
      setCharacters(chars);
      setWorldSettings(worlds);
      const found = c.find((x) => x.id === chapterId);
      if (found) {
        setChapter(found);
        setTitle(found.title);
        setContent(found.content);
        setSummary(found.summary);
        setStatus(found.status);
      }

      // 加载分卷框架数据
      const volumesSetting = worlds.find((w: any) => w.title === "volumes");
      if (volumesSetting) {
        setVolumesData(volumesSetting.content);
      }
    } catch (err) {
      console.error("加载数据失败:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNow = () => doSave();

  // AI 续写
  const handleContinue = async () => {
    setAiLoading("continue");
    setActiveTool("continue");
    try {
      const novelTitle = novel?.title || "";
      const genre = novel?.genre || "";
      const charactersInfo = characters.map(c => `${c.name}（${c.role}）：${c.personality || ""}，${c.background || ""}`).join("\n");
      const worldviewInfo = worldSettings.filter(w => w.title !== "volumes" && w.title !== "worldview").map(w => `【${w.title}】${w.content}`).join("\n");

      // 解析分卷框架
      let volumesInfo = "";
      try {
        const volumes = JSON.parse(volumesData || "[]");
        if (volumes.length > 0) {
          volumesInfo = volumes.map((v: any, i: number) => `第${i + 1}卷：${v.title || ""} - ${v.description || ""}（预计${v.chapterCount || "?"}章，核心冲突：${v.coreConflict || "无"}）`).join("\n");
        }
      } catch {}

      // 当前章节信息
      const chapterInfoStr = chapter ? `第${chapter.chapterNumber}章 ${chapter.title || ""}` : "";

      const result = await aiApi.continueChapter({
        currentContent: content,
        novelTitle,
        genre,
        characters: charactersInfo,
        worldview: worldviewInfo,
        volumes: volumesInfo,
        chapterInfo: chapterInfoStr,
      });
      setAiOutput(result.content);
      setAiInput("");
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setAiLoading(null);
    }
  };

  // AI 扩写
  const handleExpand = async () => {
    if (!aiInput.trim()) {
      setActiveTool("expand");
      return;
    }
    setAiLoading("expand");
    setActiveTool("expand");
    try {
      const novelTitle = novel?.title || "";
      const genre = novel?.genre || "";
      const charactersInfo = characters.map(c => `${c.name}（${c.role}）：${c.personality || ""}，${c.background || ""}`).join("\n");
      const worldviewInfo = worldSettings.filter(w => w.title !== "volumes" && w.title !== "worldview").map(w => `【${w.title}】${w.content}`).join("\n");
      const result = await aiApi.expandContent({
        content: aiInput,
        novelTitle,
        genre,
        characters: charactersInfo,
        worldview: worldviewInfo,
      });
      setAiOutput(result.content);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setAiLoading(null);
    }
  };

  // AI 补充冲突
  const handleConflict = async () => {
    setAiLoading("conflict");
    setActiveTool("conflict");
    try {
      const novelTitle = novel?.title || "";
      const genre = novel?.genre || "";
      const charactersInfo = characters.map(c => `${c.name}（${c.role}）：${c.personality || ""}，${c.background || ""}`).join("\n");
      const worldviewInfo = worldSettings.filter(w => w.title !== "volumes" && w.title !== "worldview").map(w => `【${w.title}】${w.content}`).join("\n");
      const result = await aiApi.addConflict({
        content: content,
        novelTitle,
        genre,
        characters: charactersInfo,
        worldview: worldviewInfo,
      });
      setAiOutput(result.content);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setAiLoading(null);
    }
  };

  // 生成大纲
  const handleGenerateOutline = async () => {
    if (!id || !novel) return;
    setAiLoading("outline");
    try {
      // 获取前一章内容（如果不是第一章）
      let previousContent = "";
      if (chapter && chapter.chapterNumber > 1) {
        try {
          const chapters = await chapterApi.list(id);
          const prevChapter = chapters.find((c: Chapter) => c.chapterNumber === chapter.chapterNumber - 1);
          if (prevChapter) {
            previousContent = prevChapter.content || "";
          }
        } catch (e) {
          console.warn("加载章节列表失败:", e);
        }
      }

      // 加载世界观设定
      let worldviewInfo = "";
      try {
        const worldItems = await worldApi.list(id);
        const worldContent = worldItems
          .filter((w: any) => w.title !== "volumes")
          .map((w: any) => `【${w.title}】${w.content}`)
          .join("\n");
        worldviewInfo = worldContent;
      } catch (e) {
        console.warn("加载世界观失败:", e);
      }

      // 加载角色信息
      let charactersInfo = "";
      try {
        const chars = await characterApi.list(id);
        charactersInfo = chars.map((c: any) => `【${c.name}】${c.role}，${c.personality || ""}，${c.background || ""}`).join("\n");
      } catch (e) {
        console.warn("加载角色失败:", e);
      }

      // 加载伏笔信息
      let foreshadowingInfo = "";
      try {
        const foreshadows = await foreshadowApi.list(id);
        foreshadowingInfo = foreshadows.map((f: any) => `【${f.title}】${f.content}`).join("\n");
      } catch (e) {
        console.warn("加载伏笔失败:", e);
      }

      const result = await aiApi.generateChapterOutline({
        novelTitle: novel.title || "",
        genre: novel.genre || "其他",
        volumes: volumesData || "[]",
        chapterNumber: chapter?.chapterNumber || 1,
        previousChapterContent: previousContent,
        worldview: worldviewInfo || undefined,
        characters: charactersInfo || undefined,
        foreshadowing: foreshadowingInfo || undefined,
      });

      if (result.subtitle) {
        setTitle(`第${chapter?.chapterNumber || 1}章 ${result.subtitle}`);
      }
      if (result.outline) {
        setContent(result.outline);
      }
    } catch (err) {
      alert((err as Error).message || "生成大纲失败");
    } finally {
      setAiLoading(null);
    }
  };

  // AI生成正文
  const handleGenerateContent = async () => {
    if (!id || !novel) return;
    if (!content.trim()) {
      alert("请先生成大纲");
      return;
    }
    setAiLoading("content");
    try {
      // 先将大纲保存到summary
      setSummary(content);

      // 获取前一章内容
      let previousContent = "";
      if (chapter && chapter.chapterNumber > 1) {
        try {
          const chapters = await chapterApi.list(id);
          const prevChapter = chapters.find((c: Chapter) => c.chapterNumber === chapter.chapterNumber - 1);
          if (prevChapter) {
            previousContent = prevChapter.content || "";
          }
        } catch (e) {
          console.warn("加载章节列表失败:", e);
        }
      }

      const result = await aiApi.generateChapterContent({
        novelTitle: novel.title || "",
        genre: novel.genre || "其他",
        chapterNumber: chapter?.chapterNumber || 1,
        outline: content,
        previousChapterContent: previousContent,
      });
      setContent(result.content);
      if (result.title) {
        setTitle(result.title);
      }
    } catch (err) {
      alert((err as Error).message || "生成内容失败");
    } finally {
      setAiLoading(null);
    }
  };

  const insertAiOutput = () => {
    if (!aiOutput) return;
    setContent((prev) => (prev ? prev + "\n\n" + aiOutput : aiOutput));
    setAiOutput("");
  };

  const replaceContent = () => {
    if (!aiOutput) return;
    setContent(aiOutput);
    setAiOutput("");
  };

  if (loading || !novel) {
    return (
      <Layout>
        <div className="text-center py-20">
          <div className="loading-dots text-ink-400"><span /><span /><span /></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <button onClick={() => navigate(`/novels/${id}/chapters`)} className="flex items-center gap-1.5 text-ink-500 hover:text-ink-700 text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> 返回章节列表
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[200px,1fr,280px] gap-6">
        {/* 左侧导航 */}
        <div className="card-sketchy p-3 h-fit hidden lg:block">
          <NovelSidebarNav novelId={novel.id} activeTab="chapters" />
        </div>

        {/* 中间编辑器 */}
        <div className="card-sketchy p-0 flex flex-col min-h-[70vh]">
          <div className="px-6 py-4 border-b border-ink-100 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-bold font-sketchy text-ink-800 bg-transparent border-none focus:outline-none focus:ring-0 w-full"
                placeholder="章节标题..."
              />
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-xs text-ink-500">
                {content.length} 字
                {saving && <span className="ml-2 text-accent-600">保存中...</span>}
                {!saving && lastSaved && <span className="ml-2 text-green-600">已保存 {lastSaved}</span>}
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="text-sm px-3 py-1.5 input-sketchy bg-white"
              >
                <option>草稿</option>
                <option>已完成</option>
              </select>
              <button onClick={handleSaveNow} className="flex items-center gap-1.5 px-4 py-2 btn-sketchy-primary text-white text-sm font-medium">
                <Save className="w-4 h-4" /> 保存
              </button>
            </div>
          </div>

          <div className="flex-1 p-6">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-[60vh] text-ink-800 leading-loose font-serif text-base bg-transparent border-none focus:outline-none resize-none"
              placeholder="开始创作... 您可以在此处编写章节正文，或使用右侧的 AI 工具辅助创作。

写作小贴士：
• 可使用 AI 续写、扩写、润色
• 也可让 AI 帮您补充冲突桥段"
            />
          </div>
        </div>

        {/* 右侧 AI 工具 */}
        <div className="space-y-3">
          <div className="card-sketchy p-4">
            <h3 className="font-semibold font-sketchy text-ink-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-500" /> AI 创作助手
            </h3>

            <div className="space-y-2">
              <ToolButton
                label="AI 续写"
                description="接上文继续写下去"
                icon={<Zap className="w-4 h-4" />}
                loading={aiLoading === "continue"}
                onClick={handleContinue}
              />
              <ToolButton
                label="AI 扩写"
                description="让细节更丰满"
                icon={<Expand className="w-4 h-4" />}
                loading={aiLoading === "expand"}
                onClick={handleExpand}
                active={activeTool === "expand"}
              />
              <ToolButton
                label="AI 补充冲突"
                description="让剧情更有张力"
                icon={<Sparkles className="w-4 h-4" />}
                loading={aiLoading === "conflict"}
                onClick={handleConflict}
              />
            </div>

            {activeTool === "expand" && (
              <div className="mt-4 pt-4 border-t border-ink-100">
                <label className="block text-xs font-medium text-ink-600 mb-2">
                  输入要扩写的内容或提示
                </label>
                <textarea
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  rows={3}
                  className="input-field text-sm resize-none"
                  placeholder="例如：主角进入神秘洞穴后的场景..."
                />
                <button
                  onClick={handleExpand}
                  disabled={aiLoading === "expand" || !aiInput.trim()}
                  className="mt-2 w-full py-2 btn-sketchy-primary text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {aiLoading === "expand" ? (
                    <><span className="loading-dots text-white"><span /><span /><span /></span> 扩写中</>
                  ) : (
                    <><Expand className="w-4 h-4" /> 开始扩写</>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="card-sketchy p-4">
            <h3 className="font-semibold font-sketchy text-ink-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-500" /> 章节AI工具
            </h3>
            <div className="space-y-2">
              <button
                onClick={handleGenerateOutline}
                disabled={aiLoading === "outline"}
                className="w-full py-2.5 btn-sketchy-primary text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {aiLoading === "outline" ? (
                  <><span className="loading-dots text-white"><span /><span /><span /></span> 生成中</>
                ) : (
                  <><BookOpen className="w-4 h-4" /> 生成大纲</>
                )}
              </button>
              <button
                onClick={handleGenerateContent}
                disabled={aiLoading === "content"}
                className="w-full py-2.5 btn-sketchy-primary text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {aiLoading === "content" ? (
                  <><span className="loading-dots text-white"><span /><span /><span /></span> 生成中</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> AI生成</>
                )}
              </button>
            </div>
          </div>

          {aiOutput && (
            <div className="card-sketchy p-4 border-l-4 border-accent-500 animate-slide-up">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-ink-800 text-sm">AI 建议内容</h4>
                <div className="flex gap-2">
                  <button onClick={insertAiOutput} className="text-xs px-3 py-1.5 bg-accent-500 text-white hover:bg-accent-600 flex items-center gap-1" style={{borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px'}}>
                    追加到正文 <ChevronRight className="w-3 h-3" />
                  </button>
                  <button onClick={replaceContent} className="text-xs px-3 py-1.5 bg-ink-100 text-ink-700 hover:bg-ink-200" style={{borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px'}}>
                    替换正文
                  </button>
                </div>
              </div>
              <div className="text-sm text-ink-700 whitespace-pre-line bg-accent-50/50 p-3 rounded-xl max-h-80 overflow-y-auto">{aiOutput}</div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function ToolButton({
  label,
  description,
  icon,
  onClick,
  loading,
  active,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  loading?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all disabled:opacity-60 ${
        active ? "sketchy-accent bg-accent-50" : "hover:bg-ink-50 border border-transparent"
      }`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? "sketchy-accent bg-accent-500 text-white" : "bg-ink-100 text-ink-600"}`}>
        {loading ? <span className="loading-dots text-current text-[0.5rem]"><span /><span /><span /></span> : icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-ink-800">{label}</div>
        <div className="text-xs text-ink-500">{description}</div>
      </div>
    </button>
  );
}
