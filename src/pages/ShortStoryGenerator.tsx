import { useState } from "react";
import { Sparkles, BookOpen, FileText } from "lucide-react";
import { aiApi } from "../lib/api";
import Layout from "../components/Layout";

export default function ShortStoryGenerator() {
  const [theme, setTheme] = useState("");
  const [style, setStyle] = useState("散文");
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ title: string; content: string } | null>(null);

  const handleGenerate = async () => {
    if (!theme.trim()) {
      alert("请输入主题");
      return;
    }
    setLoading(true);
    try {
      const r = await aiApi.generateShortStory({ theme, style, keywords });
      setResult(r);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-ink-800 mb-2 flex items-center gap-2 font-sketchy">
          <Sparkles className="w-7 h-7 text-accent-500" /> 短篇故事生成器
        </h1>
        <p className="text-ink-500 mb-8">输入灵感关键词，快速生成完整的短篇故事</p>

        <div className="grid md:grid-cols-[320px,1fr] gap-6">
          <div className="card-sketchy p-6 h-fit">
            <h3 className="font-semibold text-ink-800 mb-4">创作参数</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">故事主题 *</label>
                <input
                  type="text"
                  className="input-sketchy"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="例如：雨夜相遇..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">风格</label>
                <select className="input-sketchy" value={style} onChange={(e) => setStyle(e.target.value)}>
                  {["散文", "现代诗", "古风", "悬疑", "奇幻", "现实", "意识流"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">关键词</label>
                <textarea
                  rows={3}
                  className="input-sketchy resize-none"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="用逗号分隔，如：雨夜, 咖啡馆, 陌生人..."
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3 btn-sketchy-primary text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><span className="loading-dots text-white"><span /><span /><span /></span> 创作中...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> 开始创作</>
                )}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-ink-100">
              <h4 className="text-sm font-medium text-ink-700 mb-3">💡 灵感推荐</h4>
              <div className="space-y-2">
                {[
                  { t: "都市孤独", k: "深夜, 地铁, 陌生人, 城市灯火" },
                  { t: "奇幻冒险", k: "森林, 魔法, 预言, 龙" },
                  { t: "青春遗憾", k: "校园, 毕业季, 未说出口, 蝉鸣" },
                  { t: "古风唯美", k: "江南, 烟雨, 油纸伞, 青石板" },
                ].map((item) => (
                  <button
                    key={item.t}
                    onClick={() => {
                      setTheme(item.t);
                      setKeywords(item.k);
                    }}
                    className="w-full text-left p-3 hover:bg-ink-50 transition-colors"
                    style={{borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px'}}
                  >
                    <div className="text-sm font-medium text-ink-800">{item.t}</div>
                    <div className="text-xs text-ink-500 mt-0.5">{item.k}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card-sketchy p-6 min-h-[500px]">
            {result ? (
              <div className="animate-fade-in">
                <div className="border-b border-ink-100 pb-4 mb-6 text-center">
                  <h2 className="text-2xl font-bold text-ink-800 font-serif font-sketchy">{result.title}</h2>
                  <div className="text-xs text-ink-500 mt-2">{style} · {theme}</div>
                </div>
                <div className="font-serif text-ink-700 leading-loose whitespace-pre-line text-base">
                  {result.content}
                </div>
                <div className="mt-8 pt-4 border-t border-ink-100 flex justify-end gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(result.title + "\n\n" + result.content)}
                    className="px-4 py-2 btn-sketchy-primary text-white text-sm flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4" /> 复制全文
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 text-ink-400">
                <BookOpen className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-lg">您的故事将在这里诞生</p>
                <p className="text-sm mt-2">填写左侧参数，开启创作之旅</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
