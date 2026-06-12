import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BookOpen, PenTool, Sparkles, LogIn, UserPlus } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ email: "", password: "", username: "", penName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { isAuthenticated, login, register } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        const ok = await login({ email: form.email, password: form.password });
        if (ok) navigate("/dashboard");
      } else {
        if (!form.username || !form.penName) {
          setError("请填写用户名和笔名");
          setLoading(false);
          return;
        }
        const ok = await register({
          username: form.username,
          email: form.email,
          password: form.password,
          penName: form.penName,
        });
        if (ok) navigate("/dashboard");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ink-50 via-white to-accent-50 flex">
      {/* 左侧品牌展示 */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-center items-center p-12 bg-paper text-ink-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-accent-400 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-ink-500 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 sketchy-accent bg-accent-500 flex items-center justify-center shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-sketchy">&nbsp;AI小说家</h1>
              <p className="text-ink-500 text-sm">网文创作工作台</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold mb-4 leading-tight">
            让创作
            <span className="text-accent-600 font-sketchy">如虎添翼</span>
          </h2>
          <p className="text-ink-600 text-lg leading-relaxed mb-12">
            AI 辅助构思、人设管理、剧情卡文、章节扩写，
            为网文作者提供从灵感诞生到完本的全链路支持。
          </p>

          <div className="space-y-4">
            <FeatureItem icon={<Sparkles className="w-5 h-5" />} title="AI 智能构思" desc="题材大纲、分卷框架、爽点节奏一键生成" />
            <FeatureItem icon={<PenTool className="w-5 h-5" />} title="智能章节创作" desc="卡文续写、剧情扩写、文字润色、冲突补充" />
            <FeatureItem icon={<BookOpen className="w-5 h-5" />} title="创作设定管理" desc="角色人设、世界观、伏笔记录、细节约束" />
          </div>
        </div>
      </div>

      {/* 右侧登录表单 */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="md:hidden mb-8 flex items-center gap-2 justify-center">
            <div className="w-10 h-10 sketchy bg-ink-800 flex items-center justify-center text-white">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-ink-800 font-sketchy">&nbsp;AI小说家</span>
          </div>

          <h2 className="text-3xl font-bold text-ink-800 font-sketchy mb-2">
            {mode === "login" ? "欢迎回来" : "开启创作之旅"}
          </h2>
          <p className="text-ink-500 mb-8">
            {mode === "login" ? "登录您的账号，继续创作" : "创建账号，开启 AI 辅助创作"}
          </p>

          {/* Tab 切换 */}
          <div className="flex sketchy-light bg-ink-50 p-1 mb-6">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                mode === "login" ? "sketchy bg-white text-ink-800 shadow-sm" : "text-ink-500 hover:text-ink-700"
              }`}
            >
              <LogIn className="w-4 h-4" /> 登录
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                mode === "register" ? "sketchy bg-white text-ink-800 shadow-sm" : "text-ink-500 hover:text-ink-700"
              }`}
            >
              <UserPlus className="w-4 h-4" /> 注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">用户名</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="input-sketchy"
                    placeholder="请输入用户名"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">笔名</label>
                  <input
                    type="text"
                    value={form.penName}
                    onChange={(e) => setForm({ ...form, penName: e.target.value })}
                    className="input-sketchy"
                    placeholder="您创作时使用的笔名"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">邮箱</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-sketchy"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">密码</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-sketchy"
                placeholder="至少 6 位字符"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3" style={{ borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px" }}>{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 btn-sketchy-primary text-white font-medium hover:bg-ink-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="loading-dots text-white"><span /><span /><span /></span>
              ) : mode === "login" ? (
                "登录"
              ) : (
                "创建账号"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            继续即表示您同意我们的
            <Link to="#" className="text-accent-600 underline-sketchy hover:underline mx-1">服务条款</Link>
            和
            <Link to="#" className="text-accent-600 underline-sketchy hover:underline mx-1">隐私政策</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-10 h-10 sketchy-accent bg-accent-50 flex items-center justify-center text-accent-600 flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-ink-800">{title}</h3>
        <p className="text-ink-500 text-sm mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
