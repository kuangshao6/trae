import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Edit3, Trash2, FileText } from "lucide-react";
import { novelApi, chapterApi, Chapter } from "../lib/api";
import Layout, { NovelSidebarNav } from "../components/Layout";

export default function NovelChapters() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [novel, setNovel] = useState<any>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [n, c] = await Promise.all([novelApi.get(id), chapterApi.list(id)]);
      setNovel(n);
      setChapters(c);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!id) return;
    const chapterNum = (chapters.length || 0) + 1;
    try {
      const ch = await chapterApi.create(id, {
        chapterNumber: chapterNum,
        title: `第${chapterNum}章`,
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

  const handleDelete = async (chapterId: string) => {
    if (!id) return;
    if (!confirm("确定删除这个章节吗？")) return;
    try {
      await chapterApi.delete(id, chapterId);
      loadData();
    } catch (err) {
      alert((err as Error).message);
    }
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
      <button onClick={() => navigate(`/novels/${id}`)} className="flex items-center gap-1.5 text-ink-500 hover:text-ink-700 text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> 返回作品
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[200px,1fr] gap-6">
        <div className="card-sketchy p-3 h-fit">
          <NovelSidebarNav novelId={novel.id} activeTab="chapters" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-sketchy text-ink-800">{novel.title}</h1>
              <p className="text-sm text-ink-500">共 {chapters.length} 章</p>
            </div>
            <button onClick={handleCreate} className="btn-sketchy-primary flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> 新建章节
            </button>
          </div>

          <div className="card-sketchy p-4">
            {chapters.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 sketchy-light bg-ink-50 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-ink-300" />
                </div>
                <h3 className="text-lg font-semibold font-sketchy text-ink-700 mb-2">还没有章节</h3>
                <p className="text-ink-500 mb-6">开始创作您的第一章吧</p>
                <button onClick={handleCreate} className="btn-sketchy-primary">创建第一章</button>
              </div>
            ) : (
              <div className="divide-y divide-ink-100">
                {chapters.map((ch) => (
                  <div key={ch.id} className="flex items-center gap-4 p-3 hover:bg-ink-50 rounded-xl transition-colors group">
                    <div className="w-10 h-10 bg-ink-100 group-hover:bg-accent-100 sketchy-light flex items-center justify-center text-ink-500 font-bold flex-shrink-0">
                      {ch.chapterNumber}
                    </div>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/novels/${id}/editor/${ch.id}`)}>
                      <div className="font-medium text-ink-800 truncate">{ch.title}</div>
                      <div className="text-xs text-ink-500 mt-0.5">
                        {(ch.wordCount || 0).toLocaleString()} 字 · {ch.status}
                        {ch.aiGenerated && <span className="ml-2 text-accent-600">AI 生成</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => navigate(`/novels/${id}/editor/${ch.id}`)}
                        className="p-2 text-ink-500 hover:bg-ink-100 rounded-lg"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ch.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
