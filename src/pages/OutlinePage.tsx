import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen, Users, Globe, Plus, Save, ArrowLeft, Loader2, ChevronRight, Trash2 } from "lucide-react";
import { novelApi, characterApi, worldApi, volumeApi } from "../lib/api";
import type { Character } from "../lib/api";
import Layout from "../components/Layout";

interface VolumeItem {
  title: string;
  coreConflict: string;
  chapterCount: number;
  description: string;
}

interface CharacterItem {
  id?: string;
  name: string;
  role: string;
  description: string;
}

type TabKey = "volumes" | "characters" | "worldview";

export default function OutlinePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const novelId = searchParams.get("novelId") || "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("volumes");
  const [volumes, setVolumes] = useState<VolumeItem[]>([]);
  const [characters, setCharacters] = useState<CharacterItem[]>([]);
  const [worldview, setWorldview] = useState("");

  const loadData = useCallback(async () => {
    if (!novelId) return;
    setLoading(true);
    try {
      const novel = await novelApi.get(novelId);
      setTitle(novel.title || "");
      setDescription(novel.description || "");

      // 加载角色
      const charList = await characterApi.list(novelId);
      setCharacters(
        charList.map((c: Character) => ({
          id: c.id,
          name: c.name || "",
          role: c.role || "配角",
          description: c.background || c.personality || "",
        }))
      );

      // 加载分卷框架
      const volumesList = await volumeApi.list(novelId);
      setVolumes(volumesList.map((v: any) => ({
        title: v.title || "",
        coreConflict: v.coreConflict || "",
        chapterCount: v.chapterCount || 10,
        description: v.description || "",
      })));
      // 加载世界观
      const worldSettings = await worldApi.list(novelId);
      if (worldSettings.length > 0) {
        const combined = worldSettings
          .map((w) => (worldSettings.length > 1 ? `【${w.title}】\n${w.content}` : w.content))
          .join("\n\n");
        setWorldview(combined);
      }
    } catch (err) {
      console.error("加载数据失败:", err);
    } finally {
      setLoading(false);
    }
  }, [novelId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addVolume = () => {
    setVolumes([...volumes, { title: "", coreConflict: "", chapterCount: 10, description: "" }]);
  };

  const removeVolume = (index: number) => {
    setVolumes(volumes.filter((_, i) => i !== index));
  };

  const updateVolume = (index: number, field: keyof VolumeItem, value: string | number) => {
    const updated = [...volumes];
    updated[index] = { ...updated[index], [field]: value };
    setVolumes(updated);
  };

  const addCharacter = () => {
    setCharacters([...characters, { name: "", role: "配角", description: "" }]);
  };

  const removeCharacter = (index: number) => {
    setCharacters(characters.filter((_, i) => i !== index));
  };

  const updateCharacter = (index: number, field: keyof CharacterItem, value: string) => {
    const updated = [...characters];
    updated[index] = { ...updated[index], [field]: value };
    setCharacters(updated);
  };

  const handleSave = async () => {
    if (!novelId) return;
    setSaving(true);
    try {
      // 1. 更新作品信息
      await novelApi.update(novelId, { title, description });

      // 2. 保存分卷框架
      await volumeApi.batchSave(novelId, volumes.map((v) => ({
        title: v.title || "",
        description: v.description || "",
        chapterCount: v.chapterCount || 10,
        coreConflict: v.coreConflict || "",
      })));

      // 3. 保存世界观设定
      const worldSettings = await worldApi.list(novelId);
      const existingWorldview = worldSettings.find((w) => w.title === "世界观设定");
      if (existingWorldview) {
        await worldApi.update(novelId, existingWorldview.id, {
          title: "世界观设定",
          category: "outline",
          content: worldview,
        });
      } else {
        await worldApi.create(novelId, {
          title: "世界观设定",
          category: "outline",
          content: worldview,
        });
      }

      // 4. 管理角色数据
      const existingChars = await characterApi.list(novelId);
      const existingIds = new Set(existingChars.map((c: Character) => c.id));

      // 更新或创建角色
      for (const char of characters) {
        if (char.id && existingIds.has(char.id)) {
          await characterApi.update(novelId, char.id, {
            name: char.name,
            role: char.role,
            background: char.description,
          });
          existingIds.delete(char.id);
        } else if (!char.id) {
          await characterApi.create(novelId, {
            name: char.name,
            role: char.role,
            background: char.description,
          });
        }
      }

      // 删除已移除的角色
      for (const removedId of existingIds) {
        await characterApi.delete(novelId, removedId);
      }

      // 5. 跳转到作品详情
      navigate(`/novels/${novelId}`);
    } catch (err) {
      alert((err as Error).message || "保存失败，请重试");
    } finally {
      setSaving(false);
    }
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "volumes", label: "分卷框架", icon: <BookOpen className="w-4 h-4" /> },
    { key: "characters", label: "角色设定", icon: <Users className="w-4 h-4" /> },
    { key: "worldview", label: "世界观", icon: <Globe className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
          <span className="ml-3 text-ink-500">加载中...</span>
        </div>
      </Layout>
    );
  }

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
          <button
            onClick={() => navigate("/novels/create")}
            className="hover:text-accent-600 transition-colors"
          >
            创建新作品
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-ink-800 font-medium">大纲生成</span>
        </div>
        <h1 className="text-2xl font-bold text-ink-800 font-sketchy">大纲生成</h1>
      </div>

      {/* 作品信息区 */}
      <div className="card-sketchy p-6 mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">作品标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-sketchy text-lg"
            placeholder="输入作品标题"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">作品简介</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="input-sketchy resize-none"
            placeholder="输入作品简介..."
          />
        </div>
      </div>

      {/* Tab 切换区 */}
      <div className="mb-4">
        <div className="flex gap-1 sketchy-light bg-ink-100 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
                activeTab === tab.key
                  ? "sketchy bg-white text-accent-700 shadow-sm"
                  : "text-ink-500 hover:text-ink-700"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 内容区 */}
      <div className="card-sketchy p-6 mb-24 min-h-[300px]">
        {/* 分卷框架 */}
        {activeTab === "volumes" && (
          <div className="space-y-4">
            {volumes.length === 0 && (
              <div className="text-center py-12 text-ink-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无分卷，点击下方按钮添加</p>
              </div>
            )}
            {volumes.map((vol, index) => (
              <div
                key={index}
                className="sketchy-light p-4 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink-600">第 {index + 1} 卷</span>
                  <button
                    onClick={() => removeVolume(index)}
                    className="p-1 text-ink-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-500 mb-1">卷名</label>
                  <input
                    type="text"
                    value={vol.title}
                    onChange={(e) => updateVolume(index, "title", e.target.value)}
                    className="input-sketchy"
                    placeholder="输入卷名"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-500 mb-1">核心冲突</label>
                  <textarea
                    value={vol.coreConflict}
                    onChange={(e) => updateVolume(index, "coreConflict", e.target.value)}
                    rows={2}
                    className="input-sketchy resize-none"
                    placeholder="描述本卷核心冲突..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-500 mb-1">预计章节数</label>
                  <input
                    type="number"
                    value={vol.chapterCount}
                    onChange={(e) => updateVolume(index, "chapterCount", Number(e.target.value) || 0)}
                    className="input-sketchy w-32"
                    min={1}
                  />
                </div>
              </div>
            ))}
            <button
              onClick={addVolume}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-ink-300 text-ink-500 hover:border-accent-400 hover:text-accent-600 transition-colors"
              style={{borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px'}}
            >
              <Plus className="w-4 h-4" />
              添加分卷
            </button>
          </div>
        )}

        {/* 角色设定 */}
        {activeTab === "characters" && (
          <div className="space-y-4">
            {characters.length === 0 && (
              <div className="text-center py-12 text-ink-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无角色，点击下方按钮添加</p>
              </div>
            )}
            {characters.map((char, index) => (
              <div
                key={index}
                className="sketchy-light p-4 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink-600">角色 {index + 1}</span>
                  <button
                    onClick={() => removeCharacter(index)}
                    className="p-1 text-ink-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-ink-500 mb-1">姓名</label>
                    <input
                      type="text"
                      value={char.name}
                      onChange={(e) => updateCharacter(index, "name", e.target.value)}
                      className="input-sketchy"
                      placeholder="角色姓名"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink-500 mb-1">类型</label>
                    <select
                      value={char.role}
                      onChange={(e) => updateCharacter(index, "role", e.target.value)}
                      className="input-sketchy"
                    >
                      <option value="主角">主角</option>
                      <option value="配角">配角</option>
                      <option value="反派">反派</option>
                      <option value="龙套">龙套</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-500 mb-1">简介</label>
                  <textarea
                    value={char.description}
                    onChange={(e) => updateCharacter(index, "description", e.target.value)}
                    rows={2}
                    className="input-sketchy resize-none"
                    placeholder="角色简介..."
                  />
                </div>
              </div>
            ))}
            <button
              onClick={addCharacter}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-ink-300 text-ink-500 hover:border-accent-400 hover:text-accent-600 transition-colors"
              style={{borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px'}}
            >
              <Plus className="w-4 h-4" />
              添加角色
            </button>
          </div>
        )}

        {/* 世界观 */}
        {activeTab === "worldview" && (
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">世界观设定</label>
            <textarea
              value={worldview}
              onChange={(e) => setWorldview(e.target.value)}
              rows={16}
              className="input-sketchy resize-none"
              placeholder="描述你的世界观设定，包括时代背景、地理环境、社会结构、力量体系等..."
            />
          </div>
        )}
      </div>

      {/* 底部固定操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-paper border-t-2 border-ink-300 z-30 px-4 md:px-8 py-4">
        <div className="container max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-2.5 btn-sketchy text-ink-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            返回修改
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-2.5 btn-sketchy-primary text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            确认并开始创作
          </button>
        </div>
      </div>
    </Layout>
  );
}
