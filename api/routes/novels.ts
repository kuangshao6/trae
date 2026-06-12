import { Router, Request, Response } from "express";
import { novelStore, chapterStore, characterStore, worldSettingStore, foreshadowStore, constraintStore } from "../utils/storage";
import { generateCharacter, generateChapter, generateOutline, generateHighlights } from "../utils/aiGenerator";

const router = Router();

// 辅助：从 request 中取 token（简化版鉴权，MVP 级别）
function getUserIdFromReq(req: Request): string | null {
  const authHeader = req.headers.authorization || (req.headers["x-auth-token"] as string);
  const token = authHeader?.replace("Bearer ", "") || "";
  if (!token) return null;
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    return decoded.split(":")[0] || null;
  } catch {
    return null;
  }
}

// ========== 作品 ==========

// 获取用户作品列表
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, message: "请先登录" });

    const novels = await novelStore.findByUserIdAsync(userId);
    res.json(novels);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "服务器错误" });
  }
});

// 获取单个作品详情
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, message: "请先登录" });

    const novel = await novelStore.findByIdAsync(req.params.id);
    if (!novel) return res.status(404).json({ message: "作品不存在" });
    if (novel.userId !== userId) return res.status(403).json({ message: "无权限访问该作品" });

    res.json(novel);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "服务器错误" });
  }
});

// 创建作品
router.post("/", async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, message: "请先登录" });

    const { title, genre, description, tags, targetWordCount } = req.body;

    if (!title || !genre) {
      return res.status(400).json({ message: "标题和题材为必填项" });
    }

    const novel = await novelStore.createAsync({
      userId,
      title,
      genre,
      status: "draft",
      wordCount: 0,
      chapterCount: 0,
      description: description || "",
      tags: tags || [],
      targetWordCount: targetWordCount || 200000,
      progress: 0,
    });

    res.json(novel);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "服务器错误" });
  }
});

// 更新作品
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, message: "请先登录" });

    const novel = await novelStore.findByIdAsync(req.params.id);
    if (!novel) return res.status(404).json({ message: "作品不存在" });
    if (novel.userId !== userId) return res.status(403).json({ message: "无权限" });

    const updated = await novelStore.updateAsync(req.params.id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "服务器错误" });
  }
});

// 删除作品
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, message: "请先登录" });

    const novel = await novelStore.findByIdAsync(req.params.id);
    if (!novel) return res.status(404).json({ message: "作品不存在" });
    if (novel.userId !== userId) return res.status(403).json({ message: "无权限" });

    const success = await novelStore.removeAsync(req.params.id);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "服务器错误" });
  }
});

// ========== 章节 ==========

router.get("/:id/chapters", async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, message: "请先登录" });

    const novel = await novelStore.findByIdAsync(req.params.id);
    if (!novel || novel.userId !== userId) return res.status(403).json({ message: "无权限" });

    const chapters = await chapterStore.findByNovelIdAsync(req.params.id);
    res.json(chapters);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "服务器错误" });
  }
});

router.post("/:id/chapters", async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, message: "请先登录" });

    const novel = await novelStore.findByIdAsync(req.params.id);
    if (!novel || novel.userId !== userId) return res.status(403).json({ message: "无权限" });

    const { chapterNumber, title, content, summary, volume, aiGenerated } = req.body;

    const chapter = await chapterStore.createAsync({
      novelId: req.params.id,
      chapterNumber: chapterNumber || 1,
      title: title || "新章节",
      content: content || "",
      summary: summary || "",
      wordCount: (content || "").length,
      status: "草稿",
      volume: volume || "第一卷",
      aiGenerated: aiGenerated || false,
    });

    // 更新作品字数和章节数
    const chapters = await chapterStore.findByNovelIdAsync(req.params.id);
    const totalWords = chapters.reduce((sum, c) => sum + c.wordCount, 0);
    await novelStore.updateAsync(req.params.id, {
      chapterCount: chapters.length,
      wordCount: totalWords,
      progress: Math.min(100, Math.round((totalWords / (novel.targetWordCount || 200000)) * 100)),
    });

    res.json(chapter);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "服务器错误" });
  }
});

router.put("/:id/chapters/:chapterId", async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, message: "请先登录" });

    const novel = await novelStore.findByIdAsync(req.params.id);
    if (!novel || novel.userId !== userId) return res.status(403).json({ message: "无权限" });

    const chapter = await chapterStore.findByIdAsync(req.params.chapterId);
    if (!chapter) return res.status(404).json({ message: "章节不存在" });

    const updateData: Record<string, unknown> = { ...req.body };
    if (updateData.content && typeof updateData.content === "string") {
      updateData.wordCount = (updateData.content as string).length;
    }

    const updated = await chapterStore.updateAsync(req.params.chapterId, updateData);

    // 更新作品总字数
    const chapters = await chapterStore.findByNovelIdAsync(req.params.id);
    const totalWords = chapters.reduce((sum, c) => sum + c.wordCount, 0);
    await novelStore.updateAsync(req.params.id, {
      wordCount: totalWords,
      progress: Math.min(100, Math.round((totalWords / (novel.targetWordCount || 200000)) * 100)),
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "服务器错误" });
  }
});

router.delete("/:id/chapters/:chapterId", async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, message: "请先登录" });

    const novel = await novelStore.findByIdAsync(req.params.id);
    if (!novel || novel.userId !== userId) return res.status(403).json({ message: "无权限" });

    await chapterStore.removeAsync(req.params.chapterId);

    // 更新作品章节数和字数
    const chapters = await chapterStore.findByNovelIdAsync(req.params.id);
    const totalWords = chapters.reduce((sum, c) => sum + c.wordCount, 0);
    await novelStore.updateAsync(req.params.id, {
      chapterCount: chapters.length,
      wordCount: totalWords,
      progress: Math.min(100, Math.round((totalWords / (novel.targetWordCount || 200000)) * 100)),
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "服务器错误" });
  }
});

// ========== 角色 ==========

router.get("/:id/characters", async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, message: "请先登录" });

    const novel = await novelStore.findByIdAsync(req.params.id);
    if (!novel || novel.userId !== userId) return res.status(403).json({ message: "无权限" });

    const characters = await characterStore.findByNovelIdAsync(req.params.id);
    res.json(characters);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "服务器错误" });
  }
});

router.post("/:id/characters", async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, message: "请先登录" });

    const novel = await novelStore.findByIdAsync(req.params.id);
    if (!novel || novel.userId !== userId) return res.status(403).json({ message: "无权限" });

    const { aiGenerate, role, description, existingNames, ...rest } = req.body;

    if (aiGenerate) {
      const generated = await generateCharacter(req.params.id, role || "配角", description || "", existingNames || []);
      const character = await characterStore.createAsync({ ...generated, ...rest });
      return res.json(character);
    }

    const character = await characterStore.createAsync({
      novelId: req.params.id,
      name: rest.name || "新角色",
      role: rest.role || "配角",
      age: rest.age || 25,
      appearance: rest.appearance || "",
      personality: rest.personality || "",
      background: rest.background || "",
      motivation: rest.motivation || "",
      relationship: rest.relationship || "",
      avatarColor: rest.avatarColor || "#bfa578",
    });
    res.json(character);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "服务器错误" });
  }
});

router.put("/:id/characters/:charId", async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, message: "请先登录" });

    const novel = await novelStore.findByIdAsync(req.params.id);
    if (!novel || novel.userId !== userId) return res.status(403).json({ message: "无权限" });

    const updated = await characterStore.updateAsync(req.params.charId, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "服务器错误" });
  }
});

router.delete("/:id/characters/:charId", async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, message: "请先登录" });

    const novel = await novelStore.findByIdAsync(req.params.id);
    if (!novel || novel.userId !== userId) return res.status(403).json({ message: "无权限" });

    const success = await characterStore.removeAsync(req.params.charId);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "服务器错误" });
  }
});

// ========== 世界观 ==========

router.get("/:id/world", async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, message: "请先登录" });

    const novel = await novelStore.findByIdAsync(req.params.id);
    if (!novel || novel.userId !== userId) return res.status(403).json({ message: "无权限" });

    const settings = await worldSettingStore.findByNovelIdAsync(req.params.id);
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "服务器错误" });
  }
});

router.post("/:id/world", async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, message: "请先登录" });

    const novel = await novelStore.findByIdAsync(req.params.id);
    if (!novel || novel.userId !== userId) return res.status(403).json({ message: "无权限" });

    const ws = await worldSettingStore.createAsync({
      novelId: req.params.id,
      title: req.body.title || "新设定",
      category: req.body.category || "通用",
      content: req.body.content || "",
    });
    res.json(ws);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "服务器错误" });
  }
});

router.put("/:id/world/:wsId", async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, message: "请先登录" });

    const novel = await novelStore.findByIdAsync(req.params.id);
    if (!novel || novel.userId !== userId) return res.status(403).json({ message: "无权限" });

    const updated = await worldSettingStore.updateAsync(req.params.wsId, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "服务器错误" });
  }
});

router.delete("/:id/world/:wsId", async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, message: "请先登录" });

    const novel = await novelStore.findByIdAsync(req.params.id);
    if (!novel || novel.userId !== userId) return res.status(403).json({ message: "无权限" });

    const success = await worldSettingStore.removeAsync(req.params.wsId);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "服务器错误" });
  }
});

// ========== 伏笔 ==========

router.get("/:id/foreshadow", async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, message: "请先登录" });

    const novel = await novelStore.findByIdAsync(req.params.id);
    if (!novel || novel.userId !== userId) return res.status(403).json({ message: "无权限" });

    const foreshadows = await foreshadowStore.findByNovelIdAsync(req.params.id);
    res.json(foreshadows);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "服务器错误" });
  }
});

router.post("/:id/foreshadow", async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, message: "请先登录" });

    const novel = await novelStore.findByIdAsync(req.params.id);
    if (!novel || novel.userId !== userId) return res.status(403).json({ message: "无权限" });

    const fs = await foreshadowStore.createAsync({
      novelId: req.params.id,
      title: req.body.title || "新伏笔",
      content: req.body.content || "",
      payoffChapter: req.body.payoffChapter,
      status: req.body.status || "埋入",
    });
    res.json(fs);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "服务器错误" });
  }
});

router.put("/:id/foreshadow/:fsId", async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, message: "请先登录" });

    const novel = await novelStore.findByIdAsync(req.params.id);
    if (!novel || novel.userId !== userId) return res.status(403).json({ message: "无权限" });

    const updated = await foreshadowStore.updateAsync(req.params.fsId, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "服务器错误" });
  }
});

router.delete("/:id/foreshadow/:fsId", async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, message: "请先登录" });

    const novel = await novelStore.findByIdAsync(req.params.id);
    if (!novel || novel.userId !== userId) return res.status(403).json({ message: "无权限" });

    const success = await foreshadowStore.removeAsync(req.params.fsId);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "服务器错误" });
  }
});

// ========== 约束 ==========

router.get("/:id/constraints", async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, message: "请先登录" });

    const novel = await novelStore.findByIdAsync(req.params.id);
    if (!novel || novel.userId !== userId) return res.status(403).json({ message: "无权限" });

    const constraints = await constraintStore.findByNovelIdAsync(req.params.id);
    res.json(constraints);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "服务器错误" });
  }
});

router.post("/:id/constraints", async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, message: "请先登录" });

    const novel = await novelStore.findByIdAsync(req.params.id);
    if (!novel || novel.userId !== userId) return res.status(403).json({ message: "无权限" });

    const cs = await constraintStore.createAsync({
      novelId: req.params.id,
      type: req.body.type || "风格约束",
      content: req.body.content || "",
    });
    res.json(cs);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "服务器错误" });
  }
});

router.put("/:id/constraints/:csId", async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, message: "请先登录" });

    const novel = await novelStore.findByIdAsync(req.params.id);
    if (!novel || novel.userId !== userId) return res.status(403).json({ message: "无权限" });

    const updated = await constraintStore.updateAsync(req.params.csId, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "服务器错误" });
  }
});

router.delete("/:id/constraints/:csId", async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, message: "请先登录" });

    const novel = await novelStore.findByIdAsync(req.params.id);
    if (!novel || novel.userId !== userId) return res.status(403).json({ message: "无权限" });

    const success = await constraintStore.removeAsync(req.params.csId);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "服务器错误" });
  }
});

// ========== AI 大纲（作品相关）==========
router.post("/:id/outline", async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, message: "请先登录" });

    const novel = await novelStore.findByIdAsync(req.params.id);
    if (!novel || novel.userId !== userId) return res.status(403).json({ message: "无权限" });

    const { title, genre, theme, description } = req.body;
    const outline = await generateOutline(title || novel.title, genre || novel.genre, theme || "", description || novel.description);
    res.json(outline);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "服务器错误" });
  }
});

// 生成章节（作品上下文相关）
router.post("/:id/generate-chapter", async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, message: "请先登录" });

    const novel = await novelStore.findByIdAsync(req.params.id);
    if (!novel || novel.userId !== userId) return res.status(403).json({ message: "无权限" });

    const { chapterNumber, outline, previousChapter, context } = req.body;
    const chapter = await generateChapter(req.params.id, chapterNumber || 1, outline || "", previousChapter, context);

    // 查找是否已有同章节号的章节
    const existing = await chapterStore.findByNovelIdAsync(req.params.id);
    const existingChapter = existing.find((c) => c.chapterNumber === (chapterNumber || 1));

    let savedChapter;
    if (existingChapter) {
      // 更新已有章节
      savedChapter = await chapterStore.updateAsync(existingChapter.id, {
        title: chapter.title,
        content: chapter.content,
        summary: chapter.summary,
        wordCount: chapter.content.length,
        aiGenerated: true,
      });
    } else {
      // 创建新章节
      savedChapter = await chapterStore.createAsync({
        novelId: req.params.id,
        chapterNumber: chapter.chapterNumber,
        title: chapter.title,
        content: chapter.content,
        summary: chapter.summary,
        wordCount: chapter.content.length,
        status: "草稿",
        volume: "第一卷",
        aiGenerated: true,
      });
    }

    // 更新作品
    const allChapters = await chapterStore.findByNovelIdAsync(req.params.id);
    const totalWords = allChapters.reduce((sum, c) => sum + c.wordCount, 0);
    await novelStore.updateAsync(req.params.id, {
      chapterCount: allChapters.length,
      wordCount: totalWords,
      progress: Math.min(100, Math.round((totalWords / (novel.targetWordCount || 200000)) * 100)),
    });

    res.json(chapter);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "服务器错误" });
  }
});

// 生成作品亮点
router.post("/:id/highlights", async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, message: "请先登录" });

    const novel = await novelStore.findByIdAsync(req.params.id);
    if (!novel || novel.userId !== userId) return res.status(403).json({ message: "无权限" });

    const { title, genre, theme } = req.body;
    const result = await generateHighlights(title || novel.title, genre || novel.genre, theme || "");
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "服务器错误" });
  }
});

export default router;
