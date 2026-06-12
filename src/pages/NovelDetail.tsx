import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit3, Trash2, Plus, FileText, Sparkles, Save } from "lucide-react";
import { novelApi, chapterApi, worldApi, Novel } from "../lib/api";
import Layout, { NovelSidebarNav } from "../components/Layout";

export default function NovelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [volumes, setVolumes] = useState<any[]>([]);
  const [editingVolumeIndex, setEditingVolumeIndex] = useState(-1);
  const [volumeForm, setVolumeForm] = useState<any>({});

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [n, c, w] = await Promise.all([novelApi.get(id), chapterApi.list(id), worldApi.list(id)]);
      setNovel(n);
      setChapters(c);
      setEditForm({ title: n.title, genre: n.genre, description: n.description, tags: (n.tags || []).join(", "), targetWordCount: n.targetWordCount });
      // 加载分卷框架
      const volumesSetting = w.find((item: any) => item.title === "volumes");
      if (volumesSetting) {
        try {
          setVolumes(JSON.parse(volumesSetting.content));
        } catch {
          setVolumes([]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      const updated = await novelApi.update(id, {
        title: editForm.title,
        genre: editForm.genre,
        description: editForm.description,
        tags: (editForm.tags || "").split(/[,，]/).map((t: string) => t.trim()).filter(Boolean),
        targetWordCount: Number(editForm.targetWordCount) || 200000,
      });
      setNovel(updated);
      setEditing(false);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleCreateChapter = async () => {
    if (!id || !novel) return;
    const chapterNum = (chapters.length || 0) + 1;
    try {
      const ch = await chapterApi.create(id, {
        chapterNumber: chapterNum,
        title: `第${chapterNum}章 新章节`,
        content: "",
        summary: "",
        volume: "第一卷",
        status: "草稿",
      });
      navigate(`/novels/${id}/editor/${ch.id}`);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const saveVolumesToServer = async (updatedVolumes: any[]) => {
    if (!id) return;
    try {
      const worldSettings = await worldApi.list(id);
      const existing = worldSettings.find((w: any) => w.title === "volumes");
      if (existing) {
        await worldApi.update(id, existing.id, {
          title: "volumes",
          category: "outline",
          content: JSON.stringify(updatedVolumes),
        });
      } else {
        await worldApi.create(id, {
          title: "volumes",
          category: "outline",
          content: JSON.stringify(updatedVolumes),
        });
      }
    } catch (err) {
      console.error("保存分卷失败:", err);
      alert("保存分卷失败：" + (err as Error).message);
    }
  };

  const handleAddVolume = () => {
    const newVol = { title: "", description: "", chapterCount: 10, coreConflict: "" };
    const newVolumes = [...volumes, newVol];
    setVolumes(newVolumes);
    setEditingVolumeIndex(newVolumes.length - 1);
    setVolumeForm({ ...newVol });
  };

  const handleEditVolume = (idx: number) => {
    setEditingVolumeIndex(idx);
    setVolumeForm({ ...volumes[idx] });
  };

  const handleSaveVolume = async () => {
    if (editingVolumeIndex < 0) return;
    const newVolumes = [...volumes];
    newVolumes[editingVolumeIndex] = { ...volumeForm };
    setVolumes(newVolumes);
    setEditingVolumeIndex(-1);
    setVolumeForm({});
    await saveVolumesToServer(newVolumes);
  };

  const handleDeleteVolume = async (idx: number) => {
    if (!confirm("确定删除该分卷？")) return;
    const newVolumes = volumes.filter((_, i) => i !== idx);
    setVolumes(newVolumes);
    if (editingVolumeIndex === idx) {
      setEditingVolumeIndex(-1);
      setVolumeForm({});
    }
    await saveVolumesToServer(newVolumes);
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-20">
          <div className="loading-dots text-ink-400"><span /><span /><span /></div>
        </div>
      </Layout>
    );
  }

  if (!novel) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-ink-500 mb-4">作品不存在</p>
          <button onClick={() => navigate("/dashboard")} className="btn-primary">返回</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1.5 text-ink-500 hover:text-ink-700 text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> 返回工作台
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[200px,1fr] gap-6">
        <div className="card-sketchy p-3 h-fit">
          <NovelSidebarNav novelId={novel.id} activeTab="overview" />
        </div>

        <div className="space-y-6">
          {/* 作品信息卡片 */}
          <div className="card-sketchy p-6">
            {editing ? (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1.5">标题</label>
                    <input className="input-sketchy" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1.5">题材</label>
                    <select className="input-sketchy" value={editForm.genre} onChange={(e) => setEditForm({ ...editForm, genre: e.target.value })}>
                      {["玄幻", "仙侠", "都市", "科幻", "言情", "悬疑", "历史", "游戏", "军事", "武侠", "其他"].map((g) => (
                        <option key={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1.5">标签</label>
                    <input className="input-sketchy" value={editForm.tags} onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })} placeholder="逗号分隔" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1.5">目标字数</label>
                    <input type="number" className="input-sketchy" value={editForm.targetWordCount} onChange={(e) => setEditForm({ ...editForm, targetWordCount: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">简介</label>
                  <textarea className="input-sketchy resize-none" rows={3} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setEditing(false)} className="btn-sketchy">取消</button>
                  <button onClick={handleSave} className="btn-sketchy-primary flex items-center gap-1.5"><Save className="w-4 h-4" /> 保存</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className="tag-sketchy">{novel.genre}</span>
                      {novel.tags?.slice(0, 4).map((tag, idx) => (
                        <span key={idx} className="tag-sketchy">{tag}</span>
                      ))}
                    </div>
                    <h1 className="text-3xl font-bold font-sketchy text-ink-800 mb-2">{novel.title}</h1>
                    <p className="text-ink-500 whitespace-pre-line">{novel.description || "暂无简介"}</p>
                  </div>
                  <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-ink-500 hover:text-ink-800 px-3 py-2 text-sm">
                    <Edit3 className="w-4 h-4" /> 编辑
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-ink-100">
                  <StatMini label="总章节" value={chapters.length} />
                  <StatMini label="总字数" value={(novel.wordCount || 0).toLocaleString()} />
                  <StatMini label="目标" value={`${((novel.targetWordCount || 1) / 10000).toFixed(0)}万`} />
                  <StatMini label="进度" value={`${novel.progress || 0}%`} />
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-ink-500 mb-1.5">
                    <span>创作进度</span>
                    <span>{(novel.wordCount || 0).toLocaleString()} / {(novel.targetWordCount || 200000).toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-ink-100 rounded-full overflow-hidden" style={{borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px'}}>
                    <div
                      className="h-full bg-gradient-to-r from-accent-400 to-accent-600 rounded-full transition-all"
                      style={{ width: `${Math.min(100, novel.progress || 0)}%`, borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 快捷操作 */}
          <div className="grid grid-cols-3 gap-4">
            <QuickAction title="新建章节" icon={<Plus className="w-5 h-5" />} onClick={handleCreateChapter} primary />
            <QuickAction title="角色设定" icon={<FileText className="w-5 h-5" />} onClick={() => navigate(`/novels/${novel.id}/characters`)} />
            <QuickAction title="章节列表" icon={<FileText className="w-5 h-5" />} onClick={() => navigate(`/novels/${novel.id}/chapters`)} />
          </div>

          {/* 分卷框架 */}
          <div className="card-sketchy p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold font-sketchy text-ink-800">分卷框架</h2>
              <div className="flex items-center gap-3">
                <button onClick={handleAddVolume} className="flex items-center gap-1.5 text-sm text-accent-600 hover:text-accent-700">
                  <Plus className="w-4 h-4" /> 添加分卷
                </button>
                <button onClick={() => navigate(`/novels/${novel.id}/chapters`)} className="text-sm text-accent-600 hover:text-accent-700">
                  查看章节 →
                </button>
              </div>
            </div>

            {volumes.length === 0 ? (
              <div className="text-center py-10 text-ink-400">
                <p>暂无分卷框架</p>
                <p className="text-xs mt-1">点击上方"添加分卷"手动创建，或创建作品时AI会自动生成</p>
              </div>
            ) : (
              <div className="space-y-3">
                {volumes.map((vol, idx) => (
                  editingVolumeIndex === idx ? (
                    <div key={idx} className="p-4 sketchy-light bg-ink-50/50 space-y-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-ink-600">第 {idx + 1} 卷</span>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-ink-500 mb-1">卷名</label>
                        <input
                          type="text"
                          value={volumeForm.title || ""}
                          onChange={(e) => setVolumeForm({ ...volumeForm, title: e.target.value })}
                          className="input-sketchy"
                          placeholder="输入卷名"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-ink-500 mb-1">描述</label>
                        <textarea
                          value={volumeForm.description || ""}
                          onChange={(e) => setVolumeForm({ ...volumeForm, description: e.target.value })}
                          rows={2}
                          className="input-sketchy resize-none"
                          placeholder="描述本卷内容..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-ink-500 mb-1">预计章节数</label>
                          <input
                            type="number"
                            value={volumeForm.chapterCount || 0}
                            onChange={(e) => setVolumeForm({ ...volumeForm, chapterCount: Number(e.target.value) || 0 })}
                            className="input-sketchy w-full"
                            min={1}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-ink-500 mb-1">核心冲突</label>
                          <input
                            type="text"
                            value={volumeForm.coreConflict || ""}
                            onChange={(e) => setVolumeForm({ ...volumeForm, coreConflict: e.target.value })}
                            className="input-sketchy w-full"
                            placeholder="核心冲突"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button onClick={() => { setEditingVolumeIndex(-1); setVolumeForm({}); }} className="btn-sketchy">取消</button>
                        <button onClick={handleSaveVolume} className="btn-sketchy-primary flex items-center gap-1.5"><Save className="w-4 h-4" /> 保存</button>
                      </div>
                    </div>
                  ) : (
                    <div key={idx} className="p-4 sketchy-light bg-ink-50/50 hover:bg-ink-50 transition-colors group relative">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-ink-800">{vol.title || `第${idx + 1}卷`}</h3>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-ink-500 mr-2">{vol.chapterCount || 0} 章</span>
                          <button
                            onClick={() => handleEditVolume(idx)}
                            className="p-1 text-ink-400 hover:text-accent-600 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteVolume(idx)}
                            className="p-1 text-ink-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-ink-600 mb-2">{vol.description}</p>
                      {vol.coreConflict && (
                        <div className="text-xs text-ink-500">
                          <span className="font-medium text-accent-600">核心冲突：</span>{vol.coreConflict}
                        </div>
                      )}
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatMini({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <div className="text-xl font-bold font-sketchy text-ink-800">{value}</div>
      <div className="text-xs text-ink-500 mt-1">{label}</div>
    </div>
  );
}

function QuickAction({ title, icon, onClick, primary }: { title: string; icon: React.ReactNode; onClick: () => void; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`card-sketchy p-4 flex flex-col items-center gap-2 ${primary ? "border-2 border-dashed" : ""}`}
    >
      <div className={`w-10 h-10 flex items-center justify-center ${primary ? "sketchy-accent bg-accent-500 text-white" : "bg-ink-100 text-ink-600"}`} style={{borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px'}}>{icon}</div>
      <div className="text-sm font-medium text-ink-700">{title}</div>
    </button>
  );
}
