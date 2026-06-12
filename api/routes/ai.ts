import { Router, Request, Response } from "express";
import {
  continueChapter,
  expandContent,
  addConflict,
  generateShortStory,
  convertToScript,
  generateOutline,
  generateHighlights,
  generateWorldviewByCategories,
  generateTitle,
  generateCharacters,
  generateChapterOutline,
  generateChapter,
  parseNovelFromText,
} from "../utils/aiGenerator";

const router = Router();

// 生成大纲
router.post("/outline", async (req: Request, res: Response) => {
  const { title, genre, theme, description } = req.body;
  if (!title || !genre) {
    return res.status(400).json({ message: "请提供标题和题材" });
  }
  const outline = await generateOutline(title, genre, theme || "", description || "");
  res.json(outline);
});

// 续写当前内容
router.post("/continue", async (req: Request, res: Response) => {
  const { currentContent, context, novelTitle, genre, characters, worldview, volumes, chapterInfo } = req.body;
  if (!currentContent) {
    return res.status(400).json({ message: "请提供当前内容" });
  }
  const result = await continueChapter(currentContent, context, novelTitle, genre, characters, worldview, volumes, chapterInfo);
  res.json(result);
});

// 扩写内容
router.post("/expand", async (req: Request, res: Response) => {
  const { content, context, novelTitle, genre, characters, worldview } = req.body;
  if (!content) {
    return res.status(400).json({ message: "请提供要扩写的内容" });
  }
  const result = await expandContent(content, context, novelTitle, genre, characters, worldview);
  res.json(result);
});

// 添加冲突
router.post("/conflict", async (req: Request, res: Response) => {
  const { content, context, novelTitle, genre, characters, worldview } = req.body;
  if (!content) {
    return res.status(400).json({ message: "请提供内容上下文" });
  }
  const result = await addConflict(content, context, novelTitle, genre, characters, worldview);
  res.json(result);
});

// 短篇故事生成
router.post("/short-story", async (req: Request, res: Response) => {
  const { theme, style, keywords } = req.body;
  if (!theme) {
    return res.status(400).json({ message: "请提供主题" });
  }
  const result = await generateShortStory(theme, style || "散文", keywords || "");
  res.json(result);
});

// 剧本改写
router.post("/to-script", async (req: Request, res: Response) => {
  const { content, style } = req.body;
  if (!content) {
    return res.status(400).json({ message: "请提供要改写的内容" });
  }
  const result = await convertToScript(content, style || "通用");
  res.json(result);
});

// 生成亮点
router.post("/highlights", async (req: Request, res: Response) => {
  const { title, genre, theme } = req.body;
  if (!title || !genre) {
    return res.status(400).json({ message: "请提供标题和题材" });
  }
  const result = await generateHighlights(title, genre, theme || "");
  res.json(result);
});

// 按分类生成世界观
router.post("/worldview-categories", async (req: Request, res: Response) => {
  const { title, genre, description } = req.body;
  if (!title || !genre) {
    return res.status(400).json({ message: "请提供标题和题材" });
  }
  const items = await generateWorldviewByCategories(title, genre, description || "");
  res.json({ items });
});

// 生成小说标题
router.post("/generate-title", async (req: Request, res: Response) => {
  const { genre, description } = req.body;
  if (!genre) {
    return res.status(400).json({ message: "请提供题材" });
  }
  const result = await generateTitle(genre, description || "");
  res.json(result);
});

// 批量生成角色
router.post("/generate-characters", async (req: Request, res: Response) => {
  const { title, genre, description, volumes, existingNames } = req.body;
  if (!title || !genre) {
    return res.status(400).json({ message: "请提供标题和题材" });
  }
  const result = await generateCharacters(title, genre, description || "", volumes || "[]", existingNames || []);
  res.json(result);
});

// 生成章节大纲
router.post("/chapter-outline", async (req: Request, res: Response) => {
  const { novelTitle, genre, volumes, chapterNumber, previousChapterContent, worldview, characters, foreshadowing } = req.body;
  const result = await generateChapterOutline(
    novelTitle || "",
    genre || "其他",
    volumes || "[]",
    chapterNumber || 1,
    previousChapterContent,
    worldview,
    characters,
    foreshadowing,
  );
  res.json(result);
});

router.post("/generate-chapter-content", async (req: Request, res: Response) => {
  const { novelTitle, genre, chapterNumber, outline, previousChapterContent } = req.body;
  const chapter = await generateChapter(
    "", // novelId not needed for pure generation
    chapterNumber || 1,
    outline || "",
    previousChapterContent,
    undefined,
    novelTitle,
    genre,
  );
  res.json(chapter);
});

// 解析TXT小说文本
router.post("/parse-novel", async (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ message: "请提供文本内容" });
  }
  if (text.length > 500000) {
    return res.status(400).json({ message: "文本内容过长，请控制在50万字以内" });
  }
  const result = await parseNovelFromText(text);
  res.json(result);
});

export default router;
