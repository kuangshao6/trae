import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, BookOpen, FileText, Trash2, Upload } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { novelApi, Novel } from "../lib/api";
import Layout from "../components/Layout";

export default function MyNovelsPage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    loadNovels();
  }, [isAuthenticated, navigate]);

  const loadNovels = async () => {
    setLoading(true);
    try {
      const data = await novelApi.list();
      setNovels(data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除这部作品吗？相关章节与设定也会一并删除。")) return;
    try {
      await novelApi.delete(id);
      setNovels(novels.filter((n) => n.id !== id));
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink-800 font-sketchy">我的作品</h1>
          <p className="text-sm text-ink-500 mt-1">共 {novels.length} 部作品</p>
        </div>
        <button
          onClick={() => navigate("/novels/create")}
          className="flex items-center gap-2 px-4 py-2 btn-sketchy-primary text-white"
        >
          <Plus className="w-4 h-4" /> 新建作品
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-ink-400">
          <div className="loading-dots text-ink-400"><span /><span /><span /></div>
        </div>
      ) : novels.length === 0 ? (
        <div className="card-sketchy p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 sketchy-accent bg-accent-50 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-purple-500" />
          </div>
          <h3 className="text-xl font-semibold text-ink-700 mb-2 font-sketchy">还没有作品</h3>
          <p className="text-ink-500 mb-6">创建您的第一部作品，开启创作之旅</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/novels/create")}
              className="flex items-center gap-2 px-6 py-3 btn-sketchy-primary text-white"
            >
              <Plus className="w-4 h-4" /> 新建作品
            </button>
            <button className="flex items-center gap-2 px-6 py-3 btn-sketchy text-ink-700">
              <Upload className="w-4 h-4" /> 导入作品
            </button>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {novels.map((novel) => (
            <div
              key={novel.id}
              className="card-sketchy group relative overflow-hidden"
            >
              <div
                className="p-5 h-full flex flex-col cursor-pointer"
                onClick={() => navigate(`/novels/${novel.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="tag-sketchy text-xs font-medium">{novel.genre}</span>
                    {novel.status === "ongoing" && (
                      <span className="tag-sketchy text-xs font-medium" style={{borderColor:'#22c55e',color:'#16a34a'}}>连载中</span>
                    )}
                    {novel.status === "draft" && (
                      <span className="tag-sketchy text-xs font-medium" style={{borderColor:'#f59e0b',color:'#d97706'}}>草稿</span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(novel.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-ink-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-ink-800 mb-2 font-sketchy group-hover:text-accent-600 transition-colors">{novel.title}</h3>
                <p className="text-sm text-ink-500 mb-4 line-clamp-2 flex-1">{novel.description || "暂无简介"}</p>

                {novel.tags && novel.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {novel.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="tag-sketchy text-xs">#{tag}</span>
                    ))}
                  </div>
                )}

                <div className="mt-auto">
                  <div className="flex items-center justify-between text-xs text-ink-500 mb-1.5">
                    <span>{(novel.wordCount || 0).toLocaleString()} 字</span>
                    <span>{novel.progress || 0}%</span>
                  </div>
                  <div className="h-2 bg-ink-50 overflow-hidden" style={{borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px'}}>
                    <div
                      className="h-full bg-accent-400 transition-all"
                      style={{ width: `${Math.min(100, novel.progress || 0)}%`, borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-ink-400 mt-2">
                    <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {novel.chapterCount || 0} 章</span>
                    <span>{new Date(novel.updatedAt).toLocaleDateString("zh-CN")}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </Layout>
  );
}
