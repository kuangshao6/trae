import { useState } from "react";
import { Sparkles, BookOpen, FileText } from "lucide-react";
import { aiApi } from "../lib/api";
import Layout from "../components/Layout";

export default function ScriptConverter() {
  const [content, setContent] = useState("");
  const [style, setStyle] = useState("通用");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const handleConvert = async () => {
    if (!content.trim()) {
      alert("请输入要改写的内容");
      return;
    }
    setLoading(true);
    try {
      const r = await aiApi.convertToScript({ content, style });
      setResult(r.content);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const sampleText = `夜色如墨，寒风卷着细碎的雪花掠过街角。远处更夫的梆子声隐隐传来，为这深沉的夜平添几分寂寥。\n\n烛火摇曳，映照在室内斑驳的墙壁上。他坐在案前，眉宇间带着几分凝重。白日里发生的事情太过诡异，让他不得不重新审视这个自己生活多年的地方。\n\n"看来，这平静的日子，终究是要到头了。"他轻声自语，语气中带着一丝无奈，更多的却是一种如释重负。`;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-ink-800 mb-2 flex items-center gap-2 font-sketchy">
          <Sparkles className="w-7 h-7 text-accent-500" /> 网文剧本改写
        </h1>
        <p className="text-ink-500 mb-8">将小说文本转换为剧本格式，便于影视化改编或剧本创作参考</p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 输入区 */}
          <div className="card-sketchy p-6">
            <h3 className="font-semibold text-ink-800 mb-4">原文输入</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">剧本风格</label>
                <select className="input-sketchy" value={style} onChange={(e) => setStyle(e.target.value)}>
                  {["通用", "影视剧本", "舞台剧", "分镜头", "日式剧本"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">小说正文</label>
                <textarea
                  rows={16}
                  className="input-sketchy resize-none font-serif text-ink-700 leading-relaxed"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="粘贴您的小说内容..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setContent(sampleText)}
                  className="flex-1 py-2.5 btn-sketchy text-ink-700 text-sm font-medium"
                >
                  使用示例
                </button>
                <button
                  onClick={handleConvert}
                  disabled={loading}
                  className="flex-1 py-2.5 btn-sketchy-primary text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><span className="loading-dots text-white"><span /><span /><span /></span> 转换中</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> 转换为剧本</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 输出区 */}
          <div className="card-sketchy p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-ink-800">剧本输出</h3>
              {result && (
                <button
                  onClick={() => navigator.clipboard.writeText(result)}
                  className="text-xs text-ink-500 hover:text-accent-600 flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" /> 复制
                </button>
              )}
            </div>

            {result ? (
              <div className="sketchy-light bg-ink-50 p-5 h-[500px] overflow-y-auto animate-fade-in">
                <pre className="text-sm text-ink-700 whitespace-pre-wrap font-mono leading-relaxed">{result}</pre>
              </div>
            ) : (
              <div className="h-[500px] flex flex-col items-center justify-center text-ink-400">
                <BookOpen className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-lg">剧本将在这里生成</p>
                <p className="text-sm mt-2">粘贴小说正文并点击转换</p>
              </div>
            )}
          </div>
        </div>

        {/* 格式说明 */}
        <div className="card-sketchy p-6 mt-6">
          <h3 className="font-semibold text-ink-800 mb-4">📋 剧本格式说明</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-ink-600">
            <div className="p-4 sketchy-light bg-ink-50">
              <div className="font-semibold text-ink-800 mb-2">场景描述</div>
              <p>【场景1】 室内 - 夜</p>
              <p className="text-xs text-ink-500 mt-1">描述地点与时间</p>
            </div>
            <div className="p-4 sketchy-light bg-ink-50">
              <div className="font-semibold text-ink-800 mb-2">动作旁白</div>
              <p>（他站起身，走到窗前）</p>
              <p className="text-xs text-ink-500 mt-1">描述角色动作与环境</p>
            </div>
            <div className="p-4 sketchy-light bg-ink-50">
              <div className="font-semibold text-ink-800 mb-2">人物对话</div>
              <p>角色名    对话内容...</p>
              <p className="text-xs text-ink-500 mt-1">角色名后紧跟对白</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
