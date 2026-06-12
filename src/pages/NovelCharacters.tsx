import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Edit3, Trash2, User, Sparkles } from "lucide-react";
import { novelApi, characterApi, worldApi, aiApi, Character } from "../lib/api";
import Layout, { NovelSidebarNav } from "../components/Layout";

export default function NovelCharacters() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [novel, setNovel] = useState<any>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Character | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [form, setForm] = useState<any>({ name: "", role: "配角", age: 25, appearance: "", personality: "", background: "", motivation: "", relationship: "" });

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [n, c] = await Promise.all([novelApi.get(id), characterApi.list(id)]);
      setNovel(n);
      setCharacters(c);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (char?: Character) => {
    if (char) {
      setEditing(char);
      setForm({
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
    } else {
      setEditing(null);
      setForm({ name: "", role: "配角", age: 25, appearance: "", personality: "", background: "", motivation: "", relationship: "" });
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!id) return;
    if (!form.name.trim()) {
      alert("请输入角色名称");
      return;
    }
    try {
      if (editing) {
        await characterApi.update(id, editing.id, form);
      } else {
        await characterApi.create(id, form);
      }
      setShowDialog(false);
      loadData();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDelete = async (charId: string) => {
    if (!id) return;
    if (!confirm("确定删除这个角色吗？")) return;
    try {
      await characterApi.delete(id, charId);
      loadData();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleAiGenerate = async () => {
    if (!id) return;
    setAiGenerating(true);
    try {
      // 读取作品简介和分卷框架
      const [worldSettings] = await Promise.all([worldApi.list(id)]);
      const volumesSetting = worldSettings.find((w) => w.title === "volumes");
      const volumesJson = volumesSetting ? volumesSetting.content : "[]";

      // 收集已有角色名
      const existingNames = characters.map((c) => c.name);

      // 调用AI查漏补缺生成角色
      const result = await aiApi.generateCharacters({
        title: novel.title || "",
        genre: novel.genre || "其他",
        description: novel.description || "",
        volumes: volumesJson,
        existingNames,
      });

      // 保存生成的角色
      if (result.characters && result.characters.length > 0) {
        for (const char of result.characters) {
          await characterApi.create(id, {
            name: char.name,
            role: char.role,
            age: char.age,
            appearance: char.appearance,
            personality: char.personality,
            background: char.background,
            motivation: char.motivation,
            relationship: char.relationship,
          });
        }
      }

      setShowDialog(false);
      await loadData();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setAiGenerating(false);
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
        <div className="card-sketchy p-3 h-fit"><NovelSidebarNav novelId={novel.id} activeTab="characters" /></div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-ink-800 font-sketchy">角色设定</h1>
              <p className="text-sm text-ink-500">共 {characters.length} 位角色</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAiGenerate} disabled={aiGenerating} className="btn-sketchy flex items-center gap-1.5 disabled:opacity-50">
                <Sparkles className={`w-4 h-4 ${aiGenerating ? "animate-spin" : ""}`} /> {aiGenerating ? "生成中..." : "AI 生成角色"}
              </button>
              <button onClick={() => handleOpen()} className="btn-sketchy-primary flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> 新增角色
              </button>
            </div>
          </div>

          {characters.length === 0 ? (
            <div className="card-sketchy p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 sketchy-light bg-ink-50 flex items-center justify-center">
                <User className="w-8 h-8 text-ink-300" />
              </div>
              <h3 className="text-lg font-semibold text-ink-700 mb-2 font-sketchy">还没有角色</h3>
              <p className="text-ink-500 mb-6">开始为您的故事添加角色吧</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => handleOpen()} className="btn-sketchy-primary">手动创建</button>
                <button onClick={handleAiGenerate} disabled={aiGenerating} className="btn-sketchy flex items-center gap-1.5 disabled:opacity-50"><Sparkles className={`w-4 h-4 ${aiGenerating ? "animate-spin" : ""}`} /> {aiGenerating ? "生成中..." : "AI 生成"}</button>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {characters.map((char) => (
                <div key={char.id} className="card-sketchy p-5 group relative">
                  <div className="flex gap-1 absolute top-4 right-4">
                    <button onClick={() => handleOpen(char)} className="p-2 text-ink-500 hover:bg-ink-50 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(char.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="flex items-start gap-4">
                    <div
                      className="w-14 h-14 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-soft"
                      style={{ backgroundColor: char.avatarColor || "#a8885a", borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
                    >
                      {char.name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-ink-800 text-lg truncate">{char.name}</h3>
                        <span className="tag-sketchy text-xs shrink-0">{char.role}</span>
                      </div>
                      <div className="text-sm text-ink-500 mb-3">{char.age} 岁</div>
                    </div>
                  </div>

                  <div className="space-y-3 mt-4 text-sm">
                    <InfoItem label="外貌" value={char.appearance} />
                    <InfoItem label="性格" value={char.personality} />
                    <InfoItem label="背景" value={char.background} />
                    <InfoItem label="动机" value={char.motivation} />
                    <InfoItem label="关系" value={char.relationship} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showDialog && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowDialog(false)}>
          <div className="bg-white sketchy shadow-card max-w-2xl w-full p-6 animate-slide-up max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-ink-800 mb-1">{editing ? "编辑角色" : "新增角色"}</h3>
            <p className="text-sm text-ink-500 mb-6">完善角色的详细设定</p>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <InputField label="角色名称" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">角色定位</label>
                  <select className="input-sketchy" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option>主角</option>
                    <option>配角</option>
                    <option>反派</option>
                    <option>龙套</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">年龄</label>
                  <input type="number" className="input-sketchy" value={form.age} onChange={(e) => setForm({ ...form, age: Number(e.target.value) })} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">外貌特征</label>
                <textarea rows={2} className="input-sketchy resize-none" value={form.appearance} onChange={(e) => setForm({ ...form, appearance: e.target.value })} placeholder="描述角色的外貌特征..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">性格特点</label>
                <textarea rows={2} className="input-sketchy resize-none" value={form.personality} onChange={(e) => setForm({ ...form, personality: e.target.value })} placeholder="角色的性格、脾气、行事风格..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">背景故事</label>
                <textarea rows={3} className="input-sketchy resize-none" value={form.background} onChange={(e) => setForm({ ...form, background: e.target.value })} placeholder="角色的出身、经历、成长背景..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">行为动机</label>
                <textarea rows={2} className="input-sketchy resize-none" value={form.motivation} onChange={(e) => setForm({ ...form, motivation: e.target.value })} placeholder="驱动角色行动的核心目标或欲望..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">人物关系</label>
                <textarea rows={2} className="input-sketchy resize-none" value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} placeholder="与其他角色的关系..." />
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <button onClick={() => setShowDialog(false)} className="flex-1 py-2.5 btn-sketchy text-ink-700 font-medium">取消</button>
              {!editing && (
                <button onClick={handleAiGenerate} disabled={aiGenerating} className="px-6 py-2.5 btn-sketchy text-accent-700 font-medium flex items-center gap-1.5 disabled:opacity-50">
                  <Sparkles className={`w-4 h-4 ${aiGenerating ? "animate-spin" : ""}`} /> {aiGenerating ? "生成中..." : "AI 生成"}
                </button>
              )}
              <button onClick={handleSave} className="flex-1 py-2.5 btn-sketchy-primary text-white font-medium">保存</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-xs font-medium text-ink-400 mb-1">{label}</div>
      <div className="text-ink-700 whitespace-pre-line">{value}</div>
    </div>
  );
}

function InputField({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink-700 mb-1.5">{label}{required && " *"}</label>
      <input type="text" className="input-sketchy" value={value} onChange={(e) => onChange(e.target.value)} required={required} />
    </div>
  );
}
