import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Edit3, Trash2, MapPin, AlertTriangle, Shield, Sparkles, Loader2 } from "lucide-react";
import { novelApi, worldApi, foreshadowApi, constraintApi, aiApi } from "../lib/api";
import Layout, { NovelSidebarNav } from "../components/Layout";

type ModuleType = "world" | "foreshadow" | "constraints";

const config = {
  world: {
    title: "世界观设定",
    desc: "记录故事发生的世界背景、地理、历史、规则等",
    icon: <MapPin className="w-4 h-4" />,
    activeTab: "world",
    api: worldApi,
    itemTitle: "设定名称",
    itemCategory: "分类",
    itemContent: "设定内容",
    defaultCategory: "通用",
    categories: ["通用", "地点", "历史", "势力", "功法", "物品", "种族", "规则", "概念设定", "其他"],
  },
  foreshadow: {
    title: "伏笔记录",
    desc: "记录故事中埋下的伏笔以及回收情况",
    icon: <AlertTriangle className="w-4 h-4" />,
    activeTab: "foreshadow",
    api: foreshadowApi,
    itemTitle: "伏笔标题",
    itemCategory: "状态",
    itemContent: "伏笔内容",
    defaultCategory: "埋入",
    categories: ["埋入", "回收", "待定"],
    hasChapter: true,
  },
  constraints: {
    title: "创作约束",
    desc: "记录写作时需要遵守的规则，避免人设崩坏或风格走偏",
    icon: <Shield className="w-4 h-4" />,
    activeTab: "constraints",
    api: constraintApi,
    itemTitle: "约束类型",
    itemCategory: "类型",
    itemContent: "约束内容",
    defaultCategory: "风格约束",
    categories: ["风格约束", "人设约束", "剧情约束", "细节约束"],
  },
};

export default function NovelModule({ type }: { type: ModuleType }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const cfg = config[type];
  const api = cfg.api;

  const [novel, setNovel] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({ title: "", category: cfg.defaultCategory, content: "" });
  const [categorizing, setCategorizing] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id, type]);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [n, list] = await Promise.all([novelApi.get(id), api.list(id)]);
      setNovel(n);
      // 世界观页面：过滤掉volumes条目和已分类后的旧outline条目
      const filtered = type === "world"
        ? list.filter((item: any) => {
            if (item.title === "volumes") return false;
            // 如果已有分类条目（非outline），则隐藏旧的outline条目
            if (item.category === "outline") {
              const hasCategorized = list.some((i: any) => i.category !== "outline" && i.title !== "volumes");
              return !hasCategorized;
            }
            return true;
          })
        : list;
      setItems(filtered);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (item?: any) => {
    if (item) {
      setEditing(item);
      setForm({ title: item.title, category: item.category || item.type || cfg.defaultCategory, content: item.content, payoffChapter: item.payoffChapter });
    } else {
      setEditing(null);
      setForm({ title: "", category: cfg.defaultCategory, content: "" });
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!id) return;
    if (!form.title.trim()) {
      alert("请输入标题");
      return;
    }

    const data: any = { title: form.title, content: form.content };
    if (type === "world") data.category = form.category;
    if (type === "foreshadow") {
      data.status = form.category;
      if (form.payoffChapter) data.payoffChapter = Number(form.payoffChapter);
    }
    if (type === "constraints") data.type = form.category;

    try {
      if (editing) {
        await api.update(id, editing.id, data);
      } else {
        await api.create(id, data);
      }
      setShowDialog(false);
      loadData();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!id) return;
    if (!confirm("确定删除吗？")) return;
    try {
      await api.delete(id, itemId);
      loadData();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleCategorize = async () => {
    if (!id || !novel) return;
    setCategorizing(true);
    try {
      // 收集所有现有世界观内容（包括被过滤的outline条目）
      const allItems = await worldApi.list(id);
      const existingContent = allItems
        .map((item: any) => `【${item.title}】${item.content}`)
        .filter(Boolean)
        .join("\n\n");

      if (!existingContent.trim()) {
        alert("没有可分类的世界观内容");
        return;
      }

      // 调用AI按分类生成
      const result = await aiApi.generateWorldviewByCategories({
        title: novel.title || "原创小说",
        genre: novel.genre || "其他",
        description: existingContent,
      });

      if (result?.items && result.items.length > 0) {
        // 删除旧条目
        for (const item of allItems) {
          await worldApi.delete(id, item.id);
        }
        // 创建新的分类条目
        for (const item of result.items) {
          await worldApi.create(id, {
            title: item.title || item.category,
            category: item.category,
            content: item.content,
          });
        }
        loadData();
      }
    } catch (err) {
      alert((err as Error).message || "分类完善失败");
    } finally {
      setCategorizing(false);
    }
  };

  if (loading || !novel) {
    return <Layout><div className="text-center py-20"><div className="loading-dots text-ink-400"><span /><span /><span /></div></div></Layout>;
  }

  return (
    <Layout>
      <button onClick={() => navigate(`/novels/${id}`)} className="flex items-center gap-1.5 text-ink-500 hover:text-ink-700 text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> 返回作品
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[200px,1fr] gap-6">
        <div className="card-sketchy p-3 h-fit"><NovelSidebarNav novelId={novel.id} activeTab={cfg.activeTab} /></div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-sketchy text-ink-800">{cfg.title}</h1>
              <p className="text-sm text-ink-500">{cfg.desc}</p>
            </div>
            <div className="flex gap-2">
              {type === "world" && (
                <button onClick={handleCategorize} disabled={categorizing} className="btn-sketchy flex items-center gap-1.5 disabled:opacity-50">
                  {categorizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {categorizing ? "分类完善中..." : "AI分类完善"}
                </button>
              )}
              <button onClick={() => handleOpen()} className="btn-sketchy-primary flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> 新增
              </button>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="card-sketchy p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 sketchy-light bg-ink-50 flex items-center justify-center text-ink-300">
                {cfg.icon}
              </div>
              <h3 className="text-lg font-semibold font-sketchy text-ink-700 mb-2">还没有记录</h3>
              <p className="text-ink-500 mb-6">开始添加您的{cfg.title}</p>
              <button onClick={() => handleOpen()} className="btn-primary">新建</button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="card-sketchy p-5 group">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="tag-sketchy text-xs">{item.category || item.type || cfg.defaultCategory}</span>
                      <h3 className="font-bold text-ink-800 truncate">{item.title}</h3>
                      {type === "foreshadow" && item.payoffChapter && (
                        <span className="text-xs text-ink-500">第 {item.payoffChapter} 章回收</span>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button onClick={() => handleOpen(item)} className="p-2 text-ink-500 hover:bg-ink-50 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="text-sm text-ink-600 whitespace-pre-line leading-relaxed">{item.content}</div>
                  <div className="text-xs text-ink-400 mt-2">{new Date(item.createdAt || Date.now()).toLocaleDateString("zh-CN")}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showDialog && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowDialog(false)}>
          <div className="bg-white sketchy shadow-card max-w-xl w-full p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-ink-800 mb-1">{editing ? "编辑" : "新增"}</h3>
            <p className="text-sm text-ink-500 mb-6">完善详细内容</p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">{cfg.itemTitle}</label>
                  <input type="text" className="input-sketchy" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="请输入标题..." required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">{cfg.itemCategory}</label>
                  <select className="input-sketchy" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {cfg.categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {type === "foreshadow" && (
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">回收章节（可选）</label>
                  <input type="number" className="input-sketchy" value={form.payoffChapter || ""} onChange={(e) => setForm({ ...form, payoffChapter: e.target.value })} placeholder="例如：25" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">{cfg.itemContent}</label>
                <textarea rows={6} className="input-sketchy resize-none" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="详细内容..." />
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <button onClick={() => setShowDialog(false)} className="flex-1 py-2.5 btn-sketchy text-ink-700 font-medium">取消</button>
              <button onClick={handleSave} className="flex-1 py-2.5 btn-sketchy-primary text-white font-medium">保存</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
