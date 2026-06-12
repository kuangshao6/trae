import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, BookOpen, FileText, Sparkles, Upload, Zap, Lightbulb, Flame, Crown, X, Check, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { novelApi, Novel, aiApi, chapterApi, characterApi, worldApi, foreshadowApi } from "../lib/api";
import Layout from "../components/Layout";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importCreating, setImportCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      alert('请选择TXT格式的文件');
      return;
    }

    setImportLoading(true);
    try {
      const text = await file.text();
      const result = await aiApi.parseNovel(text);
      setImportResult(result);
      setImporting(true);
    } catch (err) {
      alert((err as Error).message || '解析文件失败');
    } finally {
      setImportLoading(false);
      // Reset file input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = async () => {
    if (!importResult) return;
    setImportCreating(true);
    try {
      // 1. 创建作品
      const novel = await novelApi.create({
        title: importResult.title,
        genre: importResult.genre,
        description: importResult.description,
        status: "ongoing",
        wordCount: 0,
        chapterCount: importResult.chapters?.length || 0,
        targetWordCount: 200000,
        progress: 0,
        tags: [],
      });

      // 2. 创建分卷框架
      if (importResult.volumes?.length > 0) {
        await worldApi.create(novel.id, {
          title: "volumes",
          category: "分卷框架",
          content: JSON.stringify(importResult.volumes),
        });
      }

      // 3. 创建角色
      if (importResult.characters?.length > 0) {
        for (const char of importResult.characters) {
          await characterApi.create(novel.id, {
            name: char.name,
            role: char.role || "配角",
            age: 0,
            appearance: "",
            personality: char.personality || "",
            background: char.background || "",
            motivation: "",
            relationship: "",
            avatarColor: "",
          });
        }
      }

      // 4. 创建章节
      if (importResult.chapters?.length > 0) {
        for (let i = 0; i < importResult.chapters.length; i++) {
          const ch = importResult.chapters[i];
          await chapterApi.create(novel.id, {
            chapterNumber: i + 1,
            title: ch.title || `第${i + 1}章`,
            content: ch.content || "",
            summary: "",
            volume: "第一卷",
            status: "已完成",
            wordCount: ch.content?.length || 0,
            aiGenerated: false,
          });
        }
      }

      // 5. 创建世界观设定
      if (importResult.worldview?.length > 0) {
        for (const wv of importResult.worldview) {
          await worldApi.create(novel.id, {
            title: wv.title || wv.category,
            category: wv.category || "其他",
            content: wv.content || "",
          });
        }
      }

      // 6. 创建伏笔
      if (importResult.foreshadowing?.length > 0) {
        for (const fs of importResult.foreshadowing) {
          await foreshadowApi.create(novel.id, {
            title: fs.title,
            content: fs.content || "",
            status: "未回收",
          });
        }
      }

      // 关闭弹窗并跳转
      setImporting(false);
      setImportResult(null);
      navigate(`/novels/${novel.id}`);
    } catch (err) {
      alert((err as Error).message || '创建作品失败');
    } finally {
      setImportCreating(false);
    }
  };

  const handleCancelImport = () => {
    setImporting(false);
    setImportResult(null);
  };

  const totalWords = novels.reduce((sum, n) => sum + (n.wordCount || 0), 0);
  const totalChapters = novels.reduce((sum, n) => sum + (n.chapterCount || 0), 0);

  const greetings = ["早上好", "上午好", "中午好", "下午好", "晚上好"];
  const hour = new Date().getHours();
  const greeting = hour < 6 ? greetings[4] : hour < 9 ? greetings[0] : hour < 12 ? greetings[1] : hour < 14 ? greetings[2] : hour < 18 ? greetings[3] : greetings[4];

  return (
    <Layout>
      <input
        type="file"
        ref={fileInputRef}
        accept=".txt"
        onChange={handleFileChange}
        className="hidden"
      />
      {/* 欢迎区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6 mb-6">
        <div className="sketchy-accent bg-paper p-6 text-ink-800 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-6xl opacity-10 font-sketchy">AI小说家</div>
          <div className="relative">
            <h2 className="text-2xl font-bold mb-2 font-sketchy">
              {greeting}，{user?.penName || "作者"} <span className="text-accent-500">✦</span>
            </h2>
            <p className="text-ink-600 mb-6">欢迎回到 AI小说家 智能创作平台，今天想创作什么故事？</p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/novels/create")}
                className="btn-sketchy-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> 开始创作
              </button>
              <button onClick={handleImportClick} disabled={importLoading} className="btn-sketchy flex items-center gap-2 disabled:opacity-50">
                <Upload className="w-5 h-5" /> 导入作品
              </button>
            </div>
          </div>
        </div>

        {/* 用户信息卡片 */}
        <div className="card-sketchy">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sketchy-accent bg-accent-50 flex items-center justify-center text-accent-600 font-bold text-lg font-sketchy">
                {user?.penName?.charAt(0) || user?.username?.charAt(0) || "A"}
              </div>
              <div>
                <div className="font-semibold text-ink-800">{user?.penName || "管理员"}</div>
                <div className="text-sm text-ink-500">今日用量</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="sketchy-light bg-ink-50 p-4 text-center">
              <div className="text-2xl font-bold text-ink-800 font-sketchy">∞</div>
              <div className="text-xs text-ink-500 mt-1">今日剩余</div>
            </div>
            <div className="sketchy-accent bg-accent-50 p-4 text-center">
              <div className="text-2xl font-bold text-accent-600 font-sketchy">38K</div>
              <div className="text-xs text-accent-600/70 mt-1">字数包</div>
            </div>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard icon={<BookOpen className="w-6 h-6" />} label="我的作品" value={`${novels.length} 部`} />
        <StatCard icon={<FileText className="w-6 h-6" />} label="总章节数" value={`${totalChapters} 章`} />
        <StatCard icon={<Flame className="w-6 h-6" />} label="总字数" value={totalWords >= 10000 ? `${(totalWords / 10000).toFixed(1)}万` : `${(totalWords / 1000).toFixed(0)}k`} />
      </div>

      {/* 核心功能 */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-ink-800 mb-4 flex items-center gap-2 font-sketchy">
          <Sparkles className="w-5 h-5 text-accent-500" /> 核心功能
          <span className="text-sm font-normal text-ink-500 font-sans">AI驱动的智能创作工具</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FeatureCard
            title="AI智能大纲"
            icon={<Zap className="w-7 h-7" />}
            onClick={() => navigate("/novels/create")}
          />
          <FeatureCard
            title="一键生成章节"
            icon={<Lightbulb className="w-7 h-7" />}
            onClick={() => navigate("/novels/create")}
          />
          <FeatureCard
            title="剧本创作"
            icon={<FileText className="w-7 h-7" />}
            onClick={() => navigate("/tools/script")}
          />
          <FeatureCard
            title="短故事生成"
            icon={<Flame className="w-7 h-7" />}
            onClick={() => navigate("/tools/short-story")}
          />
        </div>
      </div>

      {/* 最近打开 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ink-800 font-sketchy">最近打开</h2>
          {novels.length > 0 && (
            <Link
              to="/novels"
              className="text-sm text-accent-600 hover:text-accent-700 font-medium flex items-center gap-1"
            >
              查看全部 →
            </Link>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20 text-ink-400">
            <div className="loading-dots text-ink-400"><span /><span /><span /></div>
          </div>
        ) : novels.length === 0 ? (
          <div className="card-sketchy p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 sketchy-accent bg-accent-50 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-accent-500" />
            </div>
            <h3 className="text-xl font-semibold text-ink-700 mb-2 font-sketchy">还没有作品</h3>
            <p className="text-ink-500 mb-6">创建您的第一部作品，开启创作之旅</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate("/novels/create")}
                className="btn-sketchy-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> 新建作品
              </button>
              <button onClick={handleImportClick} disabled={importLoading} className="btn-sketchy flex items-center gap-2 disabled:opacity-50">
                <Upload className="w-4 h-4" /> 导入作品
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {novels.slice(0, 4).map((novel) => (
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
                      <span className="tag-sketchy">{novel.genre}</span>
                      {novel.status === "ongoing" && (
                        <span className="tag-sketchy" style={{borderColor: '#22c55e', color: '#16a34a'}}>连载中</span>
                      )}
                      {novel.status === "draft" && (
                        <span className="tag-sketchy" style={{borderColor: '#f59e0b', color: '#d97706'}}>草稿</span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-ink-800 mb-2 group-hover:text-accent-600 transition-colors font-sketchy">{novel.title}</h3>
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
                    <div className="h-2 bg-ink-100 overflow-hidden" style={{borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px'}}>
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
      </div>

      {/* 导入预览弹窗 */}
      {importing && importResult && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold font-sketchy text-ink-800">导入预览</h3>
              <button onClick={handleCancelImport} className="p-1 hover:bg-ink-100 rounded-lg">
                <X className="w-5 h-5 text-ink-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="tag-sketchy">{importResult.genre}</span>
                <h4 className="text-lg font-bold text-ink-800">{importResult.title}</h4>
              </div>

              {importResult.description && (
                <p className="text-sm text-ink-600 bg-ink-50 p-3 rounded-lg">{importResult.description}</p>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-accent-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-accent-600 font-sketchy">{importResult.chapters?.length || 0}</div>
                  <div className="text-ink-500">章节</div>
                </div>
                <div className="bg-accent-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-accent-600 font-sketchy">{importResult.characters?.length || 0}</div>
                  <div className="text-ink-500">角色</div>
                </div>
                <div className="bg-ink-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-ink-700 font-sketchy">{importResult.volumes?.length || 0}</div>
                  <div className="text-ink-500">分卷</div>
                </div>
                <div className="bg-ink-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-ink-700 font-sketchy">{importResult.worldview?.length || 0}</div>
                  <div className="text-ink-500">世界观</div>
                </div>
              </div>

              {importResult.characters?.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-ink-500 mb-1">角色</div>
                  <div className="flex flex-wrap gap-1.5">
                    {importResult.characters.slice(0, 8).map((c: any, i: number) => (
                      <span key={i} className="tag-sketchy text-xs">{c.name}({c.role})</span>
                    ))}
                    {importResult.characters.length > 8 && <span className="tag-sketchy text-xs">+{importResult.characters.length - 8}</span>}
                  </div>
                </div>
              )}

              {importResult.foreshadowing?.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-ink-500 mb-1">伏笔 ({importResult.foreshadowing.length})</div>
                  <div className="text-xs text-ink-600">{importResult.foreshadowing.map((f: any) => f.title).join('、')}</div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCancelImport}
                disabled={importCreating}
                className="flex-1 py-2.5 btn-sketchy text-ink-700 disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={importCreating}
                className="flex-1 py-2.5 btn-sketchy-primary text-white disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {importCreating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> 创建中...</>
                ) : (
                  <><Check className="w-4 h-4" /> 确认导入</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 解析中遮罩 */}
      {importLoading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-accent-500 animate-spin mx-auto" />
            <div className="text-ink-700 font-sketchy">AI 正在解析您的作品...</div>
            <div className="text-sm text-ink-500">这可能需要几分钟，请耐心等待</div>
          </div>
        </div>
      )}

    </Layout>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="card-sketchy flex items-center gap-3">
      <div className="w-12 h-12 sketchy-accent bg-accent-50 flex items-center justify-center text-accent-600">{icon}</div>
      <div>
        <div className="text-2xl font-bold text-ink-800 font-sketchy">{value}</div>
        <div className="text-xs text-ink-500">{label}</div>
      </div>
    </div>
  );
}

function FeatureCard({ title, icon, onClick }: { title: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="card-sketchy text-center p-6 group animate-wiggle">
      <div className="w-16 h-16 mx-auto sketchy bg-ink-50 flex items-center justify-center text-ink-700 mb-4 group-hover:bg-accent-50 group-hover:text-accent-600 transition-colors">
        {icon}
      </div>
      <div className="font-semibold text-ink-800 font-sketchy">{title}</div>
    </button>
  );
}
