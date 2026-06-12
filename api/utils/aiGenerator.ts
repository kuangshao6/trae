import { isAIAvailable, callAI } from "./aiService";

const firstNames = ["林", "苏", "秦", "沈", "顾", "叶", "陆", "江", "韩", "周", "萧", "白", "南宫", "东方", "上官"];
const lastNames = ["清", "夜", "寒", "辰", "轩", "墨", "羽", "辰", "曜", "璃", "月", "曦", "雪", "霜", "风"];

const genresThemes = {
  玄幻: ["天道", "修仙", "长生", "飞升", "破道", "逆命", "诸天", "万界", "神魔", "仙缘"],
  都市: ["逆袭", "重生", "系统", "商战", "异能", "豪门", "职场", "都市", "科技", "金融"],
  仙侠: ["剑道", "问道", "长生", "仙缘", "心魔", "渡劫", "洞天", "法宝", "道统", "传承"],
  科幻: ["星际", "机甲", "末世", "赛博", "穿越", "人工智能", "基因", "宇宙", "时空", "维度"],
  言情: ["豪门", "契约", "重生", "穿越", "青梅", "暗恋", "霸道", "温柔", "权谋", "宫廷"],
  悬疑: ["推理", "侦探", "灵异", "心理", "犯罪", "阴谋", "诅咒", "密室", "连环", "真相"],
  历史: ["争霸", "权谋", "乱世", "帝王", "将星", "文人", "江湖", "庙堂", "边塞", "盛世"],
  游戏: ["网游", "竞技", "通关", "副本", "公会", "装备", "技能", "任务", "竞技", "电竞"],
};

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** 清理 AI 返回的 JSON，移除 markdown 代码块标记 */
function cleanAIResponse(text: string): string {
  let cleaned = text.replace(/^```(?:json)?\s*\n?/gm, '').replace(/\n?```\s*$/gm, '').trim();
  // 处理JSON字符串值中的控制字符（换行符等），避免JSON.parse崩溃
  cleaned = cleaned.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (match) => {
    return match.replace(/[\n\r\t]/g, (ch: string) => {
      if (ch === '\n') return '\\n';
      if (ch === '\r') return '\\r';
      if (ch === '\t') return '\\t';
      return ch;
    });
  });
  return cleaned;
}

function generateName(role: string): string {
  const first = randomPick(firstNames);
  const last = randomPick(lastNames) + (Math.random() > 0.5 ? randomPick(lastNames) : "");
  if (role === "反派") {
    return randomPick(["魔", "邪", "血", "煞", "夜", "绝", "冥", "鬼"]) + last;
  }
  return first + last;
}

function generateAppearance(role: string): string {
  if (role === "主角") {
    return "面容俊朗，剑眉星目，身形挺拔，气质超然。身着一袭青衫，长发如墨，眼神坚定深邃，举手投足间自有一股威严。";
  }
  if (role === "反派") {
    return "面容阴鸷，眼瞳如幽潭，常着一袭玄色长袍。周身散发着令人心悸的气息，嘴角常挂一抹意味深长的冷笑。";
  }
  if (role === "配角") {
    return "相貌堂堂，温文尔雅，身着锦袍玉带，举止从容。眼眸如星月，笑靥如春风，令人一见便生好感。";
  }
  return "容貌普通，衣着朴素，神色平淡，行走于人群中并不起眼。";
}

function generatePersonality(role: string): string {
  if (role === "主角") {
    return "性格坚韧不拔，重情重义，心怀天下。外冷内热，对待朋友真诚热忱，面对敌人则毫不留情。有自己的原则与底线，遇强则强，从不轻言放弃。";
  }
  if (role === "反派") {
    return "心狠手辣，野心勃勃，城府极深。为达目的不择手段，视人命如草芥。但内心深处也有自己的执念与执着，并非天生邪恶，而是被命运与欲望所驱使。";
  }
  if (role === "配角") {
    return "聪慧机敏，心思细腻，善于察言观色。为人仗义，知恩图报，在主角遇到困难时总能挺身而出。看似温和，实则有自己的坚定立场。";
  }
  return "性格随和，与世无争，喜欢平静的生活。待人宽厚，乐于助人，在自己的小天地里自得其乐。";
}

function generateBackground(role: string): string {
  if (role === "主角") {
    return "出身平凡，却身怀异禀。幼年遭遇变故，历经磨难，机缘巧合下踏上修行之路。一路披荆斩棘，屡破生死之局，终成一代传奇。";
  }
  if (role === "反派") {
    return "出身显赫，却因家族恩怨与命运作弄走上歧途。年少时受尽屈辱，立誓要以力量颠覆天地规则，让所有人都匍匐在自己脚下。";
  }
  if (role === "配角") {
    return "家族世代传承，自幼饱读诗书，见识广博。与主角因机缘巧合相识，被其人格魅力折服，甘心辅佐左右，成就一番事业。";
  }
  return "市井出身，从小在人间烟火中摸爬滚打，练就一身察言观色的本事。虽无大志向，却有小人物的生存智慧。";
}

function generateMotivation(role: string): string {
  if (role === "主角") {
    return "守护所爱之人，追寻天地大道的终极奥秘。希望凭借自己的力量，打破命运的桎梏，为世间带来真正的安宁。";
  }
  if (role === "反派") {
    return "证明自己的道，让那些曾经轻视自己、背叛自己的人付出代价。追求无上的力量，想要掌握自己的命运，不受任何规则束缚。";
  }
  if (role === "配角") {
    return "辅佐主角成就大业，同时实现自己心中的理想与抱负。希望见证一个时代的诞生，在历史长河中留下自己的印记。";
  }
  return "安稳度日，守护家人与朋友，在平凡生活中寻找属于自己的小确幸。";
}

function pickColor(): string {
  const colors = ["#e8833a", "#6f533b", "#bfa578", "#a8885a", "#4e3b2a", "#8c6c4a", "#ea580c", "#c2410c"];
  return randomPick(colors);
}

export async function generateCharacter(novelId: string, role: string, _description: string, existingNames: string[] = []) {
  try {
    if (isAIAvailable()) {
      const prompt = `你是一位专业的网文角色设计师。请为以下小说生成一个角色：\n小说ID：${novelId}\n角色类型：${role}\n角色描述：${_description}${existingNames.length > 0 ? `\n已有角色名（不要与这些角色重名）：${existingNames.join("、")}` : ""}\n\n请生成包含以下字段的JSON：\n{"name": "角色名", "role": "角色类型", "age": 年龄, "appearance": "外貌描写", "personality": "性格特点", "background": "背景故事", "motivation": "动机", "relationship": "与主角关系"}\n不要添加markdown代码块标记。`;
      const aiResult = await callAI(prompt);
      const parsed = JSON.parse(cleanAIResponse(aiResult));
      return {
        novelId,
        name: parsed.name || "未命名",
        role: parsed.role || role,
        age: parsed.age || 25,
        appearance: parsed.appearance || "",
        personality: parsed.personality || "",
        background: parsed.background || "",
        motivation: parsed.motivation || "",
        relationship: parsed.relationship || "",
        avatarColor: pickColor(),
      };
    }
  } catch (e) {
    console.warn("AI API 调用失败，降级到本地模板:", e);
  }

  const normalizedRole = (["主角", "配角", "反派", "龙套"].includes(role) ? role : "配角") as
    | "主角"
    | "配角"
    | "反派"
    | "龙套";

  let charName = generateName(normalizedRole);
  let attempts = 0;
  while (existingNames.includes(charName) && attempts < 10) {
    charName = generateName(normalizedRole);
    attempts++;
  }

  return {
    novelId,
    name: charName,
    role: normalizedRole,
    age: normalizedRole === "主角" ? 22 : normalizedRole === "反派" ? 35 : 28,
    appearance: generateAppearance(normalizedRole),
    personality: generatePersonality(normalizedRole),
    background: generateBackground(normalizedRole),
    motivation: generateMotivation(normalizedRole),
    relationship: "与主角关系待定，随剧情发展逐步揭示。",
    avatarColor: pickColor(),
  };
}

export async function generateCharacters(title: string, genre: string, description: string, volumesJson: string, existingNames: string[] = [], worldview: string = "", existingRoles: {name: string, role: string}[] = [], chapters: string = "") {
  let volumesInfo = "";
  try {
    const volumes = JSON.parse(volumesJson);
    volumesInfo = volumes.map((v: any, i: number) =>
      `第${i + 1}卷：${v.title} - ${v.description || ""}（核心冲突：${v.coreConflict || "无"}）`
    ).join("\n");
  } catch {
    volumesInfo = volumesJson;
  }

  try {
    if (isAIAvailable()) {
      let prompt: string;
      if (existingNames.length > 0) {
        prompt = `你是一位网文角色设计师。请根据以下信息为小说查漏补缺，补充缺失的角色：

标题：${title}
题材：${genre}
简介：${description}
分卷框架：${volumesInfo}
${worldview ? `世界观设定：${worldview}` : ""}
${chapters ? `已写章节内容摘要：\n${chapters}` : ""}

已有角色及其定位：
${existingRoles.length > 0 ? existingRoles.map(r => `- ${r.name}（${r.role}）`).join("\n") : existingNames.map(n => `- ${n}（定位未知）`).join("\n")}

【重要】查漏补缺规则：
1. 先检查已有角色中缺少哪些重要定位：如果已有角色中没有"主角"，必须优先从简介、分卷框架、世界观设定和章节内容中识别并生成主角；如果没有"反派"且故事有对立面，必须生成反派
2. 从简介、分卷框架、世界观设定和章节内容中找出尚未在已有角色列表中的角色名，为这些角色生成设定
3. 根据每个角色在故事中的核心程度判断定位：故事核心人物为"主角"，对立面为"反派"，重要但非核心为"配角"，次要为"龙套"
4. 在主角、反派等重要角色都已存在的情况下，再考虑补充配角、龙套等
5. 返回的角色中必须至少有1个"主角"（如果已有角色中没有主角的话）

请返回JSON数组，每个角色包含：name, role(主角/配角/反派/龙套), age, appearance, personality, background, motivation, relationship`;
      } else {
        prompt = `你是一位网文角色设计师。请根据以下信息为小说生成角色：

标题：${title}
题材：${genre}
简介：${description}
分卷框架：${volumesInfo}
${worldview ? `世界观设定：${worldview}` : ""}
${chapters ? `已写章节内容摘要：\n${chapters}` : ""}

要求：
1. 【先识别角色】从简介、分卷框架和世界观设定中找出所有提到的角色名
2. 【再判断类型】根据每个角色在故事中的定位判断类型：故事核心人物为"主角"，对立面为"反派"，重要但非核心为"配角"，次要为"龙套"
3. 如果识别出的角色不足3个，根据剧情需要补充角色（如反派、关键配角等）
4. 返回的角色中必须至少有1个"主角"，如果故事有对立面则必须有1个"反派"
5. 为每个角色生成完整的设定

请返回JSON数组，每个角色包含：name, role(主角/配角/反派/龙套), age, appearance, personality, background, motivation, relationship`;
      }
      const aiResult = await callAI(prompt);
      const parsed = JSON.parse(cleanAIResponse(aiResult));
      const rawCharacters = Array.isArray(parsed) ? parsed : (parsed.characters || []);
      const characters = rawCharacters.map((c: any) => ({
        name: c.name || "未命名",
        role: c.role || "",
        age: c.age || 25,
        appearance: c.appearance || "",
        personality: c.personality || "",
        background: c.background || "",
        motivation: c.motivation || "",
        relationship: c.relationship || "",
      }));
      return { characters };
    }
  } catch (e) {
    console.warn("AI API 调用失败，降级到本地模板:", e);
  }

  // 降级方案：生成3个默认角色（主角、配角、反派）
  const roles = ["主角", "配角", "反派"] as const;
  const usedNames: string[] = [...existingNames];
  const characters = roles.map((role) => {
    let charName = generateName(role);
    let attempts = 0;
    while (usedNames.includes(charName) && attempts < 10) {
      charName = generateName(role);
      attempts++;
    }
    usedNames.push(charName);
    return {
      name: charName,
      role,
      age: role === "主角" ? 22 : role === "反派" ? 35 : 28,
      appearance: generateAppearance(role),
      personality: generatePersonality(role),
      background: generateBackground(role),
      motivation: generateMotivation(role),
      relationship: "与主角关系待定，随剧情发展逐步揭示。",
    };
  });

  return { characters };
}

export async function generateOutline(title: string, genre: string, theme: string, description: string) {
  try {
    if (isAIAvailable()) {
      const prompt = `你是一位网文作者。请根据以下信息生成小说大纲：

标题：${title}
题材：${genre}
主题：${theme}
简介：${description}

【重要】你必须以用户提供的简介为核心展开故事！简介中提到的每个细节（人物、事件、设定）都必须在大纲中体现，不能偏离用户输入另起炉灶。如果简介中提到了具体人物名，大纲中必须使用该人物名。

要求：
1. mainOutline: 围绕用户简介展开的故事简介，300字左右，像讲故事一样自然直接，不要用"故事融合了""力图为读者呈现""整体风格"这类AI套话
2. volumes: 分卷数组，每卷包含 title, description, chapterCount, coreConflict
3. highlights: 爽点设计数组

请直接返回JSON，不要添加markdown代码块标记。`;
      const aiResult = await callAI(prompt);
      const parsed = JSON.parse(cleanAIResponse(aiResult));
      return {
        title,
        theme,
        mainOutline: parsed.mainOutline || "",
        volumes: parsed.volumes || [],
        highlights: parsed.highlights || [],
      };
    }
  } catch (e) {
    console.warn("AI API 调用失败，降级到本地模板:", e);
  }

  const themes = genresThemes[genre as keyof typeof genresThemes] || genresThemes.玄幻;
  const keyWords = [...themes].sort(() => Math.random() - 0.5).slice(0, 5);

  const mainOutline = `${description || `${title}的故事，从一个不起眼的角落开始。一个看似平凡的人，却因为一次意外，被卷入了一场远超想象的风暴之中。从此，命运的天平开始倾斜，曾经遥不可及的世界在他眼前徐徐展开。他不得不在险境中求生存，在背叛中寻真心，在一次次的绝境里咬牙前行。当真相浮出水面，他才发现，这一切不过是更大棋局的开始。}`}`;

  const volumes = [
    {
      title: "第一卷：初入江湖",
      description: "主角初登场，世界观展开，引入关键人物与核心矛盾。铺垫主角的身世背景与性格特点。",
      chapterCount: 20,
      coreConflict: "主角面临人生重大转折，被迫离开熟悉的环境，踏上未知的道路。",
    },
    {
      title: "第二卷：风云际会",
      description: "主角实力提升，结识重要伙伴，卷入更大的纷争。世界观进一步展开，各方势力陆续登场。",
      chapterCount: 30,
      coreConflict: "主角在新的环境中立足，与敌对势力产生正面冲突，揭开更大的阴谋。",
    },
    {
      title: "第三卷：暗流汹涌",
      description: "剧情进入中段，矛盾激化，隐藏的伏笔逐渐揭晓。主角面临重大考验，友情与忠诚受到挑战。",
      chapterCount: 30,
      coreConflict: "主角团队内部出现分歧，外部压力空前巨大，必须做出艰难的抉择。",
    },
    {
      title: "第四卷：破茧成蝶",
      description: "主角经历重大蜕变，实力与心境同步提升。所有伏笔在此卷中开始回收，最终大战的序幕缓缓拉开。",
      chapterCount: 25,
      coreConflict: "主角直面终极敌人的前哨战，付出巨大代价，为最终决战积蓄力量。",
    },
    {
      title: "第五卷：天地为证",
      description: "最终卷，所有矛盾在此解决。主角迎来命运的终极考验，以自己的道回应整个世界的期待。",
      chapterCount: 15,
      coreConflict: "最终决战，主角以一己之力撼动天地格局，成就属于自己的传奇。",
    },
  ];

  const highlights = [
    `以${keyWords[0]}为核心的爽点设计：主角每一次突破都伴随实力的飞跃，给予读者持续的正向反馈。`,
    `情感张力：主角与重要人物之间的情感纠葛，既是温情的来源，也是推动剧情发展的关键动力。`,
    `世界观展开：随着剧情推进，世界的深度与广度逐步揭示，给读者探索的乐趣。`,
    `节奏把控：张弛有度，紧张的战斗与温馨的日常交替，避免审美疲劳。`,
    `伏笔回收：前期精心布置的伏笔在中后期逐一揭晓，给读者恍然大悟的阅读快感。`,
  ];

  return {
    title,
    theme,
    mainOutline,
    volumes,
    highlights,
  };
}

export async function generateChapter(
  _novelId: string,
  chapterNumber: number,
  outline: string,
  _previousChapter?: string,
  _context?: string,
  novelTitle?: string,
  genre?: string,
) {
  if (!isAIAvailable()) {
    throw new Error("AI服务未配置，无法生成章节内容。请检查.env文件中的AI_API_KEY配置。");
  }

  const prompt = `你是一位专业的网文作者。你的任务是：将下面的章节大纲扩写为完整的章节正文。

重要：你是在扩写，不是在创作新内容。你必须且只能基于下面的大纲来写，大纲里有的必须写出来，大纲里没有的绝对不能写。

小说标题：${novelTitle || "原创小说"}
题材：${genre || "其他"}
章节号：第${chapterNumber}章

==========以下是章节大纲，你必须严格按照这个大纲来写==========
${outline}
==========大纲结束==========

${_previousChapter ? `前一章内容摘要：\n${_previousChapter.slice(-800)}\n` : ""}写作要求：
1. 逐条展开大纲中的每一个情节点，将简略的描述扩写为具体的场景、对话、动作、心理
2. 大纲中提到的每个事件、人物、场景都必须在正文中出现
3. 不得自行添加大纲中没有的情节或人物
4. 不得遗漏大纲中的任何内容
5. 字数1000字左右
6. 语言自然流畅，像真正的网文，不要用AI套话

请返回JSON格式：{"title": "章节标题", "content": "章节正文", "summary": "章节摘要"}
不要添加markdown代码块标记。`;
  const aiResult = await callAI(prompt);
  const parsed = JSON.parse(cleanAIResponse(aiResult));
  return {
    chapterNumber,
    title: parsed.title || `第${chapterNumber}章`,
    content: parsed.content || "",
    summary: parsed.summary || "",
  };
}

export async function continueChapter(currentContent: string, _context?: string, novelTitle?: string, genre?: string, characters?: string, worldview?: string, volumes?: string, chapterInfo?: string) {
  try {
    if (isAIAvailable()) {
      const prompt = `你是一位专业的网文作者。请续写以下内容，保持风格和情节连贯：

小说标题：${novelTitle || "原创小说"}
题材：${genre || "其他"}
${characters ? `角色信息：\n${characters}\n` : ""}${worldview ? `世界观设定：\n${worldview}\n` : ""}${volumes ? `【分卷框架】\n${volumes}\n` : ""}${chapterInfo ? `当前章节：${chapterInfo}\n` : ""}
以下是当前章节已有内容：
${currentContent}

续写要求：
1. 根据分卷框架合理安排每章内容，确保当前章节的情节推进符合整体规划
2. 续写内容要与上文自然衔接，符合角色性格和世界观设定
3. 根据当前章节在分卷框架中的位置，控制情节节奏——章节开头可铺垫，章节中段推进情节，章节结尾可留悬念
4. 请直接续写500-1000字，不要重复已有内容，不要添加标题或说明`;
      const aiResult = await callAI(prompt);
      return { content: aiResult };
    }
  } catch (e) {
    console.warn("AI API 调用失败，降级到本地模板:", e);
  }

  const continuation = [
    "\n\n思绪纷飞间，门外忽然传来一阵轻微的脚步声。由远及近，不急不缓，却带着一种不容忽视的存在感。主角停下手中的动作，目光缓缓转向门口。",
    "\n\n「既然来了，又何必躲躲藏藏。」他的声音平静，却带着一种毋庸置疑的穿透力。",
    "\n\n门外的脚步声戛然而止。沉默了片刻后，一道低沉的声音缓缓响起：「看来，你比我想象中要敏锐得多。」",
    "\n\n话音落下，门扉无声地敞开。一个身影缓步走入，面容隐在阴影之中，只能看清那双眸子，亮得惊人。",
  ];

  return { content: continuation.join("") };
}

export async function expandContent(_content: string, _context?: string, novelTitle?: string, genre?: string, characters?: string, worldview?: string) {
  try {
    if (isAIAvailable()) {
      const prompt = `你是一位专业的网文作者。请对以下内容进行适度扩写，丰富细节描写：

小说标题：${novelTitle || "原创小说"}
题材：${genre || "其他"}
${characters ? `角色信息：\n${characters}\n` : ""}${worldview ? `世界观设定：\n${worldview}\n` : ""}
要扩写的内容：
${_content}

扩写要求：
1. 只基于给定内容适度扩展细节，如环境描写、心理活动、动作细节、对话细节等
2. 不要添加原文未提及的新情节、新角色或新事件
3. 不要凭空捏造内容，所有扩展都应围绕原文已有信息展开
4. 扩写后字数适度增加即可，不必刻意追求字数
5. 保持原文的叙事风格和语气

请直接输出扩写后的内容，不要添加标题或说明。`;
      const aiResult = await callAI(prompt);
      return { content: aiResult };
    }
  } catch (e) {
    console.warn("AI API 调用失败，降级到本地模板:", e);
  }

  // 降级：基于原文简单扩展
  return { content: _content + "\n\n" + _content.split("。").filter(s => s.trim()).map(s => s.trim() + "。").join("") };
}

export async function addConflict(_content: string, _context?: string, novelTitle?: string, genre?: string, characters?: string, worldview?: string) {
  try {
    if (isAIAvailable()) {
      const prompt = `你是一位专业的网文作者。请在以下内容的基础上，添加一个冲突或转折桥段，使情节更加紧张刺激：

小说标题：${novelTitle || "原创小说"}
题材：${genre || "其他"}
${characters ? `角色信息：\n${characters}\n` : ""}${worldview ? `世界观设定：\n${worldview}\n` : ""}
当前内容：
${_content}

要求：
1. 冲突要自然融入，不突兀
2. 增加悬念和紧张感
3. 可以引入已有角色或新事件
4. 符合角色性格和世界观设定

请直接输出添加冲突后的完整内容。`;
      const aiResult = await callAI(prompt);
      return { content: aiResult };
    }
  } catch (e) {
    console.warn("AI API 调用失败，降级到本地模板:", e);
  }

  const conflictText = `\n\n就在此时，变故陡生！\n\n窗外寒光一闪，数道黑影如鬼魅般掠入，手中利刃直取室内二人！动作之快，令人目不暇接。\n\n「小心！」主角沉声低喝，身形不动，袖中却已有数道寒芒激射而出。\n\n当——\n\n金铁交鸣之声骤然响起，火花四溅。来袭者一击不中，旋即退开，与室内二人形成对峙之势。\n\n「看来今晚，有人并不希望我们好好谈话。」主角嘴角微微上扬，眼中却无半分笑意，「既然来了，不如留下名号，也免得做个糊涂鬼。」\n\n来人沉默不语，只是手中兵刃握得更紧。气氛骤然紧张，一触即发。`;
  return { content: conflictText };
}

// ==================== 短篇故事生成：风格模板库 ====================

type StoryStyle = "散文" | "现代诗" | "古风" | "悬疑" | "奇幻" | "现实" | "意识流";

interface StyleTemplate {
  openings: string[];
  scenes: string[];
  dialogues: string[];
  endings: string[];
  titleFormats: string[];
  connectorPhrases: string[];
  atmosphereWords: string[];
}

const styleTemplates: Record<StoryStyle, StyleTemplate> = {
  散文: {
    openings: [
      "记忆中的{scene}总是笼罩在一层薄薄的雾气里，像是老照片上褪色的光晕，模糊却温暖。",
      "那天的{weather}来得毫无征兆，{name}站在{scene}前，忽然觉得时间在某个缝隙里停住了。",
      "很多年后，{name}依然会想起那个{time}。{scene}的轮廓在{weather}中若隐若现，一切都像是刚刚好。",
      "世间万物都有属于自己的一刻，而{scene}的一刻，总是在{time}才肯展露真容。",
    ],
    scenes: [
      "{scene}里弥漫着{atmosphere}的气息，{name}轻轻{action}，仿佛怕惊扰了什么。{keyword}的痕迹随处可见，像是一封未寄出的信。",
      "窗外的{weather}不知何时停了，{scene}恢复了往日的宁静。{name}望着远处{keyword}的方向，心中涌起一种说不清的惆怅。",
      "{time}，{scene}的{detail}格外清晰。{name}想起关于{keyword}的往事，那些细碎的片段像落叶般纷纷扬扬。",
      "光线从{scene}的缝隙中穿过，在地面投下斑驳的影子。{keyword}的气息还残留在空气中，{name}深吸一口气，试图将这一刻记住。",
      "沿着{scene}的小路慢慢走着，{name}的思绪被{keyword}牵引。{weather}中的世界安静极了，连脚步声都显得多余。",
      "{scene}的尽头是一扇半掩的门，{name}犹豫了片刻，还是推了开来。{keyword}的景象映入眼帘，让人恍惚间分不清今夕何夕。",
    ],
    dialogues: [
      "「你还记得{keyword}吗？」{name}忽然开口，声音轻得像是怕惊碎了什么。\n\n对面的人沉默了很久，才轻声回答：「记得，怎么会忘呢。」",
      "「{keyword}……」{name}念着这个词，像是在品味一杯陈年的茶，「有时候觉得，这世上最远的距离，不是天涯海角，而是明明记得，却再也回不去。」",
      "「我总觉得{keyword}和从前不一样了。」{name}说这话时，目光落在远处，像是在和另一个时空的什么对话。\n\n「变的不是{keyword}，」对方轻声说，「是我们看它的眼睛变了。」",
      "「如果{keyword}可以选择，你觉得它会选择被记住，还是被遗忘？」{name}问。\n\n「大概会选择被偶尔想起吧，」对方想了想，「太深的记住是负担，太彻底的遗忘是辜负。」",
      "「{keyword}的事，你后悔吗？」\n\n{name}摇了摇头，又点了点头：「后悔谈不上，只是偶尔会想，如果当时走了另一条路，现在会是什么样子。」",
    ],
    endings: [
      "{name}最终没有等到答案。但也许，{keyword}本身就不需要答案，它只是安静地存在于那里，像{scene}里永远不会熄灭的一盏灯。",
      "后来，{name}再也没有回到过{scene}。但每当{weather}的时候，总会想起那个关于{keyword}的{time}，心里便觉得柔软而酸涩。",
      "故事到这里就该结束了。{keyword}依旧在{scene}里安静地生长，而{name}已经学会了不去打扰。有些东西，远远地看着，就已经很好。",
      "多年以后，{name}偶尔路过{scene}，总会不自觉地停下脚步。{keyword}的味道还在，只是人事已非。生活就是这样，一边失去，一边记得。",
    ],
    titleFormats: [
      "{scene}的最后一班",
      "{keyword}之后",
      "雨后的{scene}",
      "{time}的{keyword}",
      "关于{keyword}的碎片",
    ],
    connectorPhrases: ["后来", "然而", "就这样", "不知过了多久", "恍惚间"],
    atmosphereWords: ["温柔", "惆怅", "宁静", "朦胧", "淡然", "缱绻", "悠远"],
  },
  现代诗: {
    openings: [
      "我拆开{keyword}的信封\n里面只有一片空白\n{name}说\n空白是最诚实的语言",
      "{scene}在{time}醒来\n{keyword}是它说的第一个词\n我试图拼读\n却只拼出自己的名字",
      "把{keyword}折叠\n塞进{scene}的缝隙\n{name}说\n这样它就不会消失",
      "我们用{keyword}造句\n主语是{scene}\n谓语是{weather}\n宾语是一个没有地址的名字",
    ],
    scenes: [
      "{scene}的{detail}\n像一行被划掉的诗\n{keyword}站在删节号的位置\n沉默比语言更完整",
      "{name}在{scene}数{keyword}\n一个两个三个\n数到第七个的时候\n天就亮了\n而{keyword}变成了露水",
      "{weather}落在{scene}上\n每一滴都是一个{keyword}\n{name}伸手去接\n手心只有一道湿痕",
      "我看见{keyword}在{scene}的倒影里\n它比本身更真实\n{name}说\n也许我们都是某面镜子里的{keyword}",
      "{time}\n{scene}开始说梦话\n全是关于{keyword}的\n我竖起耳朵\n只听清一个「你」字",
      "把{keyword}放进{scene}\n加一点{weather}\n再加一点{name}的叹息\n煮成一首\n谁也读不完的诗",
    ],
    dialogues: [
      "「{keyword}是什么颜色的？」\n{name}问\n我想了想\n「是你闭上眼的颜色」",
      "「你见过{keyword}吗？」\n{name}站在{scene}的边缘\n「见过」我说\n「在每一个\n快要忘记的瞬间」",
      "「如果{keyword}有声音」\n{name}望着{weather}\n「大概是你叫我的方式\n——轻到几乎不存在\n却让整个世界安静下来」",
      "「写一首关于{keyword}的诗吧」\n{name}说\n我拿起笔\n写下{scene}\n然后\n什么也写不出来了\n因为{keyword}\n已经是一首诗",
      "「{keyword}会不会痛？」\n{name}突然问\n「会的」我说\n「但它的痛\n比我们的美\n更值得被记住」",
    ],
    endings: [
      "最后\n{keyword}变成一个标点\n站在{scene}的句末\n不是句号\n是省略号\n\n——故事没有结束\n只是不再说了",
      "{name}关上{scene}的门\n{keyword}留在门外\n它没有敲门\n只是安静地\n变成了一首\n没有读者的诗",
      "我把{keyword}还给了{scene}\n把{weather}还给了天空\n把{name}还给了记忆\n\n自己\n还给了空白",
      "如果有人问起{keyword}\n就说它在{scene}里\n在{time}的缝隙中\n在一首\n永远写不完的诗里",
    ],
    titleFormats: [
      "关于{keyword}的十四行",
      "{scene}诗抄",
      "{keyword}与省略号",
      "给{keyword}的未寄信",
      "{time}独白",
    ],
    connectorPhrases: ["而", "于是", "——", "后来", "可是"],
    atmosphereWords: ["空白", "轻盈", "断裂", "回响", "隐匿", "漂浮"],
  },
  古风: {
    openings: [
      "{time}，{scene}烟波浩渺，{name}一袭{clothing}立于{detail}之上，衣袂翻飞如云。{keyword}之事，已过三载，然每念及此，心中犹有千千结。",
      "话说{scene}之畔，{time}花正盛，{name}负手而立，遥望{keyword}方向，眉间三分清冷，七分怅惘。风起处，落英缤纷如雨。",
      "史载{time}，{scene}有异象。{name}夜观天象，见{keyword}之星隐而不没，心知大事将起，遂整衣敛容，提笔书之。",
      "昔年{time}，{name}初至{scene}，正值{keyword}之变。{detail}之下，人声鼎沸，唯{clothing}身影独立于喧嚣之外，如松如竹。",
    ],
    scenes: [
      "{scene}深处，{detail}幽幽，{name}缓步而行。{keyword}之影映于{detail}之上，恍若隔世。忽闻琴声自远处传来，如泣如诉，与{weather}相和，令人不忍卒听。",
      "{time}，{scene}之{detail}。{name}执{clothing}立于廊下，望{keyword}方向。{weather}渐起，吹动衣袂猎猎作响。侍从欲上前添衣，被其抬手制止。",
      "{scene}之侧，{keyword}花开正盛。{name}驻足良久，忽以指轻触花瓣，喃喃道：「此花年年如旧，人事却已全非。」言罢，长叹一声，{clothing}之影没入{weather}之中。",
      "{name}行至{scene}，见{detail}之上刻有旧日题词，乃{keyword}之年所留。墨迹虽淡，笔锋犹在。{name}以袖拂尘，凝视良久，眼中似有千言万语。",
      "是夜，{scene}灯火通明。{name}独坐{detail}，案上铺陈{keyword}之卷宗。烛火摇曳间，忽觉窗外有异，抬眼望去，但见{weather}中似有人影一闪而过。",
      "{keyword}之事传遍{scene}，人言纷纷。{name}立于{detail}之上，{clothing}临风而立，面如平湖，唯握剑之手微微收紧。左右皆不敢言，唯闻{weather}之声。",
    ],
    dialogues: [
      "「{keyword}之事，你当真要管？」来人冷声道。\n\n{name}淡然一笑：「天下之事，何人不可管？何况——」目光微转，「此事与我，并非无关。」",
      "「{name}，{keyword}之局已定，何必再逆势而为？」\n\n{name}缓缓抬眸：「势？我从不信势。我只信——」手中{clothing}一震，「手中此物，与心中此道。」",
      "「先生可知{keyword}？」{name}问道，语气恭敬。\n\n老者捋须长叹：「知，如何不知。只是有些事，知道不如不知道，记住不如忘掉。」",
      "「{keyword}……」{name}默念此词，忽而苦笑，「世人皆道此二字重如千钧，于我而言，却不过是——一个念想罢了。」\n\n「念想足以移山。」身旁之人轻声道。",
      "「若{keyword}为真，你待如何？」\n\n{name}负手望天，良久方道：「若为真，便承其重。若为假，便破其局。是非真假，总要亲眼看过，方不负此生。」",
      "「{name}大人，{keyword}的消息已确认。」\n\n{name}搁下手中茶盏，眸色微沉：「知道了。退下吧。」待来人离去，方才低声道：「终究……还是来了。」",
    ],
    endings: [
      "此后，{scene}再无{keyword}之传说。唯{detail}之上，{name}所题之字历历在目，后人观之，皆叹世事无常，唯道心不灭。",
      "{name}终是踏上了{keyword}之路。{scene}的{weather}中，{clothing}之影渐行渐远，唯余{detail}之下，一地落花，满目清寒。",
      "故事至此，{keyword}之局已了。{name}立于{scene}之巅，{weather}猎猎，衣袂翻飞。回首来路，千山暮雪，只余一声长啸，响彻天地之间。",
      "后人路过{scene}，偶闻{keyword}之旧事，皆唏嘘不已。{detail}依旧，{weather}如昨，只是那{clothing}的身影，再也无人得见。",
    ],
    titleFormats: [
      "{scene}月下",
      "烟雨{keyword}",
      "{keyword}赋",
      "{scene}{keyword}梦",
      "{keyword}长歌",
    ],
    connectorPhrases: ["却说", "且说", "话分两头", "须臾", "翌日"],
    atmosphereWords: ["清冷", "苍茫", "萧瑟", "幽远", "寂寥", "凛冽"],
  },
  悬疑: {
    openings: [
      "{name}第一次注意到{keyword}的异常，是在{scene}的{time}。那本不该出现的东西，就那样突兀地出现在{detail}上，像是某种无声的宣告。",
      "关于{keyword}的传闻，{scene}的人讳莫如深。{name}原本不信，直到那天{time}，{detail}上出现了一道不该存在的划痕——和七年前一模一样。",
      "档案室里关于{keyword}的记录被人撕掉了。{name}站在{scene}的阴影中，看着残页上仅存的一行字：「不要在{time}去{detail}。」",
      "{scene}的{time}，{name}收到了一条没有发件人的消息，只有两个字——{keyword}。而三小时前，关于{keyword}的那个人，刚刚被宣布失踪。",
    ],
    scenes: [
      "{name}推开{scene}的门，{detail}上积了厚厚的灰。但奇怪的是，{keyword}相关的物品上却一尘不染——像是有人一直在擦拭。{name}蹲下身，在{detail}的底部发现了一串数字：{code}。",
      "{scene}的监控在{time}出现了整整{duration}的空白。{name}反复回看前后片段，终于在最后一帧画面中捕捉到一个模糊的轮廓——那人的手里，似乎拿着与{keyword}有关的东西。",
      "关于{keyword}的线索在{scene}断了。{name}站在{detail}前，试图拼凑出完整的逻辑链。所有的证据都指向同一个方向，但直觉告诉{name}，这恰恰是最危险的地方——太过完美的答案，往往意味着精心设计的陷阱。",
      "{name}第二次来到{scene}时，{detail}上的东西变了。原本关于{keyword}的标记被人移动过，虽然只有微小的偏移，却足以说明——有人比{name}先到一步。而这个人，显然不想被发现。",
      "在{scene}的{detail}后面，{name}找到了一本笔记。翻开第一页，上面只写着一行字：「关于{keyword}的真相，你确定想知道吗？」笔迹陌生，但语气却莫名熟悉。",
      "{time}，{name}在{scene}的{detail}处发现了一个暗格。里面是一组关于{keyword}的照片，每张照片背面都写着一个日期。{name}按日期排列后，发现这些数字组成了一组坐标。",
    ],
    dialogues: [
      "「你为什么要查{keyword}？」对方的声音从黑暗中传来，辨不清方向。\n\n{name}没有转头：「因为有人不想让我查。而越是如此，越说明——{keyword}背后藏着的东西，比我想象的大得多。」",
      "「{keyword}的事，我劝你别再查了。」\n\n{name}抬起头，目光平静：「是忠告，还是威胁？」\n\n对方沉默了三秒：「两者皆是。」",
      "「你知道{keyword}的真相？」{name}压低声音。\n\n对面的人苦笑：「真相？我只知道，知道真相的人，要么疯了，要么——」停顿了一下，「不在了。」",
      "「{name}，{keyword}的案子已经结了。」\n\n「结了？」{name}冷笑，「一个所有证据都太过完美的案子，你不觉得才刚刚开始吗？」",
      "「那天在{scene}，你到底看到了什么？」\n\n{name}的手指微微收紧：「我看到了{keyword}。但问题不在我看到了什么——而在于，它也看到了我。」",
      "「{keyword}不是你以为的那样。」来人摘下帽子，露出一张{surprise}的脸。\n\n{name}后退一步：「你——」\n\n「没错，」对方说，「从头到尾，{keyword}都和我有关。」",
    ],
    endings: [
      "{name}终于拼出了{keyword}的全部真相。但当他站在{scene}的{detail}前，看着最终的答案时，却希望自己从未开始过这场追寻。有些真相，比谎言更令人窒息。",
      "关于{keyword}的档案被重新封存。{name}在最后一页写下了自己的结论，然后合上文件夹。窗外{scene}的灯火依旧，但{name}知道，有些东西已经永远不同了——包括他自己。",
      "{keyword}的真相浮出水面的那天，{scene}下了一场大雨。{name}站在{detail}前，看着证据一点点被雨水冲刷。也许，有些事情注定要被遗忘。也许，遗忘才是最后的慈悲。",
      "故事到这里，{keyword}似乎有了答案。但{name}在{scene}的{detail}上又发现了一行字——和之前的笔迹一模一样。这一次，上面写着：「你以为结束了？这只是第二层。」",
    ],
    titleFormats: [
      "第{ordinal}封{keyword}信",
      "消失的{keyword}",
      "{keyword}的第七天",
      "{scene}暗语",
      "{keyword}档案",
    ],
    connectorPhrases: ["然而", "就在此时", "更令人不安的是", "事情远没有这么简单", "但真正的转折"],
    atmosphereWords: ["诡异", "压抑", "阴冷", "凝重", "晦暗", "惊悚"],
  },
  奇幻: {
    openings: [
      "当{keyword}的最后一道封印在{scene}崩裂时，{name}感受到了大地的震颤。那股沉睡了千年的力量正在苏醒，而{scene}的{detail}上，古老的符文开始逐一亮起。",
      "{scene}的{time}，{name}第一次看见了{keyword}。它悬浮在{detail}之上，散发着幽蓝色的光芒，空气中弥漫着一种不属于这个世界的气息。{name}知道，命运从此刻起，已不可逆转。",
      "传说{keyword}沉睡在{scene}的最深处，由{detail}守护。{name}从未想过自己会走到这里——直到那道来自{keyword}的呼唤，在每个梦中反复出现，再也无法忽视。",
      "{scene}的结界在{time}出现了裂缝，{keyword}的气息从缝隙中渗出。{name}站在{detail}前，感受着那股力量掠过皮肤，像灼烧，又像低语。它说：来吧。",
    ],
    scenes: [
      "{name}踏入{scene}的瞬间，{detail}上的符文骤然亮起。{keyword}的力量如潮水般涌来，{name}以{clothing}之力勉强抵挡。空气中充满了{keyword}的回响——那是跨越千年的低语，诉说着一个被遗忘的誓约。",
      "{scene}的{detail}处，{keyword}的碎片悬浮在半空，折射出七彩的光芒。{name}伸出手，指尖触碰到碎片的刹那，一段不属于自己记忆涌入脑海——那是关于{keyword}最初的模样，以及它被分裂的原因。",
      "在{scene}的深处，{name}终于见到了{keyword}的真身。它远比传说中更加宏大，也更加——悲伤。{detail}在它周围缓缓旋转，像是忠诚的卫士，又像是无形的枷锁。",
      "{keyword}的力量在{scene}引发了异变。{detail}开始扭曲变形，{weather}中充满了不稳定的魔力波动。{name}知道，必须在{keyword}完全失控之前找到控制它的方法，否则整个{scene}都将被吞噬。",
      "{name}在{scene}的{detail}中发现了关于{keyword}的古老壁画。画中描绘了一场远古的大战，而{keyword}正是那场战争的核心。令{name}震惊的是，壁画最后一幅图中，与{keyword}对峙的那个人——和自己长得一模一样。",
      "{time}，{scene}的天空裂开一道口子，{keyword}的光芒从中倾泻而下。{name}站在{detail}之上，感受着那股力量灌入体内。痛苦与力量交织，{clothing}在身周猎猎作响，仿佛下一刻就要化为灰烬。",
    ],
    dialogues: [
      "「{keyword}选择了你。」老者的声音苍老而遥远。\n\n{name}攥紧了拳头：「我没有选择它。」\n\n「选择从来不是单向的，」老者叹息，「它选中你的那一刻，你的命运就已经改写。」",
      "「你真的以为能驾驭{keyword}？」对方冷笑。\n\n{name}抬起头，眼中映着{keyword}的光芒：「不是驾驭。是理解。{keyword}不是武器——它是一个等待被倾听的声音。」",
      "「{keyword}的力量会吞噬你。」\n\n{name}沉默片刻：「也许。但如果不用这股力量，{scene}里的人——一个都活不了。」",
      "「为什么{keyword}会出现在{scene}？」{name}问道。\n\n守护者摇了摇头：「不是它出现在{scene}——是{scene}因它而生。你以为这片土地一直都在？不，它是{keyword}的梦，梦醒了，一切都将消失。」",
      "「{keyword}在哭泣。」{name}忽然说。\n\n「什么？」\n\n「你没听到吗？」{name}闭上眼睛，「它不想被使用，不想成为武器。它只是——想回家。」",
    ],
    endings: [
      "{keyword}最终回归了{scene}的{detail}，封印重新亮起，比从前更加坚固。{name}站在{scene}的出口，回望那道渐渐熄灭的光芒。{keyword}的声音最后一次在脑海中响起：「谢谢你，让我终于可以安睡。」",
      "当{keyword}的力量平息，{scene}恢复了往日的模样。{name}看着{detail}上残留的符文痕迹，知道这一切并没有真正结束。{keyword}只是暂时沉睡，而自己，已经成为了它的一部分。",
      "{name}用{keyword}的力量修复了{scene}的一切，代价是——关于{keyword}的所有记忆。当{name}走出{detail}时，只觉得心中空了一块，却想不起那里曾经装着什么。风吹过{scene}，带走了最后一丝{keyword}的回响。",
      "故事在{scene}的{detail}处画上了句号。{keyword}化作一颗星辰，永远悬挂在{scene}的天空。{name}抬头仰望，嘴角微微上扬。有些告别不需要言语，就像有些羁绊，即使跨越千年，也不会断裂。",
    ],
    titleFormats: [
      "{keyword}纪元",
      "{scene}之{keyword}",
      "{keyword}与{scene}的誓约",
      "最后的{keyword}",
      "{keyword}觉醒录",
    ],
    connectorPhrases: ["就在这时", "然而命运并未就此止步", "更令人震惊的是", "在那之后", "一切才刚刚开始"],
    atmosphereWords: ["苍茫", "恢弘", "神秘", "壮阔", "苍凉", "瑰丽"],
  },
  现实: {
    openings: [
      "{name}在{scene}的{time}接到那通电话时，手里还端着刚泡的{drink}。关于{keyword}的事，{name}以为早就翻篇了，但电话那头的声音让一切又涌了回来。",
      "关于{keyword}，{name}已经很久没想过了。直到那天在{scene}的{detail}上，看到了一个熟悉的背影——和{keyword}那年的背影如出一辙。",
      "{scene}的{time}和往常没什么两样。{name}照常{action}，照常路过{detail}。但关于{keyword}的消息像一颗石子投进了平静的湖面，涟漪一圈圈地荡开，再也收不回来。",
      "如果那天{time}，{name}没有走进{scene}，也许关于{keyword}的一切都不会发生。但生活没有如果，只有后果。",
    ],
    scenes: [
      "{scene}里人声嘈杂，{name}找了个角落坐下。关于{keyword}的事，{name}不想让任何人知道。但{detail}上的手机一直在震，消息一条接一条，每一条都像是在提醒——有些事，躲不掉。",
      "{name}在{scene}的{detail}前站了很久。关于{keyword}的决定，已经拖了太久了。{weather}打在窗户上，像是在催促。{name}深吸一口气，终于拿起了手机。",
      "关于{keyword}，{name}和{peer}已经吵了不止一次。此刻坐在{scene}里，两人之间的沉默比争吵更让人难受。{detail}上的{drink}已经凉了，谁都没有动。",
      "{scene}的{time}，{name}独自走在{detail}上。{keyword}的事情像一块石头压在胸口，让每一步都变得沉重。路边的{weather}打湿了鞋面，{name}却浑然不觉。",
      "{name}在{scene}翻到了关于{keyword}的旧物。{detail}上的灰尘被轻轻拂去，露出了当年的痕迹。{name}的手指在那些痕迹上停留了很久，最终还是没有扔掉——有些东西，不是想放就能放的。",
      "关于{keyword}的消息在{scene}传开了。{name}站在{detail}旁，听着周围人的议论，一言不发。{drink}已经喝完了，杯底的{drink}渍像一幅抽象画，看不出任何意义。",
    ],
    dialogues: [
      "「{keyword}的事，你怎么看？」{peer}问。\n\n{name}搅着杯子里的{drink}：「我不知道。我只知道，不管怎么选，都会有人受伤。」",
      "「你就不能为了{keyword}再努力一次吗？」\n\n{name}苦笑：「努力？我已经努力到不知道还能怎么努力了。有些事不是努力就有用的。」",
      "「{keyword}的事我想通了。」{name}的声音很平静。\n\n{peer}放下手中的东西，认真地看着{name}：「想通了？还是放弃了？」\n\n「有区别吗？」{name}笑了笑，但眼里没有笑意。",
      "「你后悔吗？关于{keyword}。」\n\n{name}沉默了很久：「后悔没有用。如果时光倒流，我大概还是会做同样的选择。因为那时候的我，只能做到那样。」",
      "「{keyword}的事，我们能不能好好谈谈？」{name}终于开口。\n\n对面的人抬起头，眼眶微红：「谈？你什么时候愿意听我说话了？」",
    ],
    endings: [
      "关于{keyword}，{name}最终做出了选择。不是最好的选择，但至少是当下能做的选择。走出{scene}时，{weather}刚好停了，空气里有泥土和青草的味道。生活还在继续，带着所有的遗憾和微小的希望。",
      "{keyword}的事情过去了。{name}坐在{scene}的{detail}上，看着手机里最后一条消息，按下了删除。不是释然，只是觉得——有些东西，留在记忆里就够了。",
      "后来，{name}偶尔想起{keyword}，心里已经不像当初那样翻涌了。{scene}还是那个{scene}，{time}还是那个{time}，只是{name}已经不一样了。成长大概就是这样，不是突然的顿悟，而是慢慢学会了和遗憾共处。",
      "故事没有结局。{keyword}依然悬而未决，{name}依然在{scene}和{detail}之间来回。但至少——至少{name}不再逃避了。而面对，有时候就是最大的勇敢。",
    ],
    titleFormats: [
      "{scene}的{keyword}",
      "关于{keyword}的日常",
      "{keyword}以后",
      "{time}的{keyword}",
      "{keyword}没有答案",
    ],
    connectorPhrases: ["后来", "那天之后", "日子一天天过去", "直到有一天", "然而现实是"],
    atmosphereWords: ["平淡", "压抑", "温暖", "无奈", "真实", "琐碎"],
  },
  意识流: {
    openings: [
      "{keyword}{keyword}{keyword}这个词在{name}脑子里转了三圈半然后卡在了{scene}的某个角落和{time}的光线纠缠在一起怎么也解不开像一团毛线不应该是毛线是{detail}上那片水渍的形状",
      "我在{scene}不也许{scene}在我里面{keyword}从{time}开始渗入每一个毛孔{name}说你不觉得吗觉得什么觉得{keyword}正在替代我们思考",
      "{time}{scene}{keyword}三个词像三颗骰子同时落地点数加起来刚好是{name}的年龄但这不重要重要的是{detail}上那道裂缝它一直在扩大像{keyword}本身一样",
      "如果{keyword}是一种颜色它是{scene}在{time}的那种——不是蓝也不是灰是两者之间的缝隙{name}站在缝隙里往下看看到了自己正在往上望",
    ],
    scenes: [
      "{scene}在呼吸{keyword}也在呼吸{name}分不清是自己在呼吸还是{scene}在替自己呼吸{detail}上的影子比本人先一步到达了{time}而本人还在{keyword}的迷宫里打转每个转角都通向同一个{detail}",
      "时间在{scene}里不是直线是{keyword}的形状——弯折缠绕重叠{name}在{time}同时也在昨天同时也在一个尚未发生的{keyword}里{detail}上的灰尘是未来的灰烬",
      "{keyword}的味道从{scene}的{detail}上飘来不是嗅觉是某种更原始的感知{name}试图用语言捕捉它但语言在{keyword}面前像一张破了洞的网什么都捞不住只有水从洞里漏下去漏到{time}的底部",
      "我在{scene}的{detail}上看到了{keyword}的倒影但倒影在看我{name}说那不是倒影那是{keyword}在另一个维度里的本体我们才是影子{time}不过是影子投下的影子",
      "{scene}的墙壁在{keyword}的作用下变得透明{name}看到了隔壁的隔壁的隔壁每一间都是{time}的变体{detail}上坐着不同版本的同一个人他们都在想同一件事——{keyword}到底是什么",
      "{keyword}在{scene}里分裂成无数个碎片每一片都映着{name}的一张脸但每张脸的表情都不同{detail}上时间在倒流{time}变成了一个动词而不是名词{name}决定不再试图理解",
    ],
    dialogues: [
      "「{keyword}」{name}说但这个词从嘴里出来时变成了{scene}的形状\n\n「你说什么」\n\n「我说{keyword}但它不听话它自己变成了别的什么」\n\n「也许它比我们更知道该成为什么」",
      "「你觉得{keyword}存在吗」\n\n{name}想了很久或者一秒在{scene}里时间和思考不成正比\n\n「它存在的方式是不存在不存在的方式是存在我们讨论它的方式是——」\n\n「是什么」\n\n「是{keyword}本身」",
      "「{keyword}在说话」{name}突然说\n\n「说什么」\n\n「说{scene}说{time}说{detail}上的灰尘说一切我们来不及说的」\n\n「那我们呢我们说什么」\n\n「我们说{keyword}在说话」",
      "「如果{keyword}是一个人」\n\n「它不是」\n\n「如果它是」\n\n「那它一定是那个在{scene}的{time}站在{detail}上看着我们的人」\n\n「看着我们做什么」\n\n「看着我们讨论如果{keyword}是一个人」",
      "「{name}你还在吗」\n\n在也不在{scene}里{keyword}把{name}撕成了两半一半在{time}一半在{detail}\n\n「在」\n\n「你在想什么」\n\n「在想{keyword}在想你在想我在想{keyword}在想你在想——」\n\n「停」\n\n好",
    ],
    endings: [
      "{keyword}最终没有答案因为{keyword}本身就是答案{scene}在{time}合上了它的眼睛{name}从{detail}上站起来或者坐下或者从未移动过{keyword}继续在某个角落里自己和自己对话",
      "故事在这里断裂像{keyword}在{scene}里断裂一样{time}的碎片散落在{detail}上{name}捡起一片发现上面写着开头于是又回到了{keyword}的起点——也许从来就没有终点也许我们一直在{keyword}的内部打转",
      "我{keyword}你{keyword}他{keyword}我们都在{scene}的{time}里{keyword}着{detail}上的灰尘落了又起起了又落{name}说也许{keyword}就是这个——灰尘落下的声音你听到了吗",
      "如果有人问{keyword}是什么告诉他们{keyword}是{scene}在{time}做的一个梦梦里{name}在{detail}上写了一个故事故事的名字叫{keyword}而{keyword}是——\n\n（此处意识中断）",
    ],
    titleFormats: [
      "{keyword}的{keyword}",
      "{scene}·{keyword}·碎片",
      "关于{keyword}的{time}独白",
      "{keyword}与{keyword}之间",
      "{time}的意识{keyword}",
    ],
    connectorPhrases: ["然后", "或者说", "与此同时", "不", "也许"],
    atmosphereWords: ["断裂", "重叠", "漂浮", "扭曲", "模糊", "碎片化"],
  },
};

// ==================== 短篇故事生成：辅助函数 ====================

/** 解析关键词字符串为数组 */
function parseKeywords(keywords: string): string[] {
  if (!keywords || !keywords.trim()) return [];
  return keywords
    .split(/[,，、\s]+/)
    .map((k) => k.trim())
    .filter((k) => k.length > 0);
}

/** 规范化风格名称，匹配到最接近的已知风格 */
function normalizeStyle(style: string): StoryStyle {
  const styleMap: Record<string, StoryStyle> = {
    散文: "散文",
    prose: "散文",
    现代诗: "现代诗",
    诗歌: "现代诗",
    poem: "现代诗",
    古风: "古风",
    古典: "古风",
    classical: "古风",
    悬疑: "悬疑",
    推理: "悬疑",
    mystery: "悬疑",
    奇幻: "奇幻",
    fantasy: "奇幻",
    玄幻: "奇幻",
    现实: "现实",
    写实: "现实",
    realism: "现实",
    意识流: "意识流",
    stream: "意识流",
  };
  return styleMap[style] || styleMap[style.trim()] || "散文";
}

/** 从模板中填充占位符 */
function fillTemplate(tpl: string, vars: Record<string, string>): string {
  let result = tpl;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  }
  // 清除未填充的占位符
  result = result.replace(/\{\w+\}/g, "");
  return result;
}

/** 生成动态标题 */
function generateStoryTitle(theme: string, style: StoryStyle, keywords: string[]): string {
  const template = styleTemplates[style];
  const titleFormat = randomPick(template.titleFormats);

  const kw = keywords.length > 0 ? randomPick(keywords) : theme || "无名";
  const sceneOptions = ["街角", "旧巷", "站台", "桥上", "窗前", "巷口", "天台", "河畔", "弄堂", "渡口"];
  const timeOptions = ["深夜", "黄昏", "黎明", "午后", "清晨", "暮色", "子夜", "薄暮"];
  const ordinalOptions = ["七", "十三", "九", "三", "五"];

  const vars: Record<string, string> = {
    keyword: kw,
    scene: randomPick(sceneOptions),
    time: randomPick(timeOptions),
    ordinal: randomPick(ordinalOptions),
  };

  return fillTemplate(titleFormat, vars);
}

/** 构建场景变量集 */
function buildSceneVars(theme: string, keywords: string[], style: StoryStyle): Record<string, string> {
  const scenes = ["旧书店", "咖啡馆", "火车站", "老巷子", "河岸边", "天台", "图书馆", "小酒馆", "公园长椅", "渡口", "阁楼", "废墟", "庭院", "长廊", "桥头"];
  const weathers = ["细雨", "薄雾", "晚风", "落雪", "阴云", "微光", "寒霜", "暮霭", "晨露", "残阳"];
  const times = ["黄昏", "深夜", "黎明", "午后", "清晨", "暮色中", "子夜", "薄暮时分", "夜半", "日落时分"];
  const details = ["桌面", "窗台", "书架", "墙角", "台阶", "栏杆", "门框", "石碑", "柱子", "地板"];
  const actions = ["叹了口气", "合上了书", "转过身去", "闭上了眼", "攥紧了手", "低下头", "望向远方", "抚摸着旧物"];
  const clothings = ["青衫", "长袍", "白衣", "玄衣", "锦衣", "素衣", "劲装"];
  const drinks = ["茶", "咖啡", "清酒", "白水", "热汤"];
  const peers = ["老友", "同事", "旧识", "邻居", "搭档"];
  const codes = Array.from({ length: 6 }, () => String(Math.floor(Math.random() * 10))).join("");
  const durations = ["十三分钟", "七分钟", "二十三秒", "一分四十二秒"];
  const surprises = ["意料之外", "不可思议", "令人震惊"];

  const kw = keywords.length > 0 ? keywords : [theme || "命运"];

  return {
    keyword: randomPick(kw),
    scene: randomPick(scenes),
    weather: randomPick(weathers),
    time: randomPick(times),
    detail: randomPick(details),
    action: randomPick(actions),
    clothing: randomPick(clothings),
    drink: randomPick(drinks),
    peer: randomPick(peers),
    code: codes,
    duration: randomPick(durations),
    surprise: randomPick(surprises),
    name: generateName("主角"),
  };
}

/** 根据关键词生成场景片段 */
function generateKeywordScenes(keywords: string[], template: StyleTemplate, vars: Record<string, string>): string[] {
  const scenes: string[] = [];

  for (let i = 0; i < Math.min(keywords.length, 3); i++) {
    const sceneVars = { ...vars, keyword: keywords[i] };
    const sceneTpl = randomPick(template.scenes);
    scenes.push(fillTemplate(sceneTpl, sceneVars));

    // 50% 概率在场景后插入对话
    if (Math.random() > 0.5) {
      const dialogueTpl = randomPick(template.dialogues);
      scenes.push(fillTemplate(dialogueTpl, sceneVars));
    }
  }

  // 如果关键词不足3个，补充额外场景
  if (keywords.length < 2) {
    const extraSceneVars = { ...vars, keyword: vars.keyword };
    const extraScene = randomPick(template.scenes);
    scenes.push(fillTemplate(extraScene, extraSceneVars));
  }

  return scenes;
}

/** 生成高潮段落 */
function generateClimax(style: StoryStyle, _template: StyleTemplate, vars: Record<string, string>, keywords: string[]): string {
  const climaxTemplates: Record<StoryStyle, string[]> = {
    散文: [
      "然而一切在那个{time}戛然而止。{keyword}像一面突然碎裂的镜子，所有的碎片映着不同的面孔，每一张都是{name}不愿面对的自己。{scene}的{weather}忽然变得猛烈，仿佛连天地都在为这场变故作证。",
      "转折来得猝不及防。关于{keyword}的真相，{name}从未想过会以这样的方式揭开。{scene}的{weather}中，一切都变得陌生而尖锐，像一把被磨了很久的刀，终于露出了锋刃。",
    ],
    现代诗: [
      "然后{keyword}碎了\n不是慢慢碎的\n是一瞬间\n像{scene}的{weather}\n突然记起自己\n曾经是海\n\n{name}站在碎片中间\n每一片都映着不同的{keyword}\n哪一片才是真的\n也许都是\n也许都不是",
      "{keyword}在{time}反转\n上变成下\n前变成后\n{name}变成{keyword}\n{keyword}变成{scene}\n所有的词都脱轨了\n只有{weather}还在下\n它不管这些",
    ],
    古风: [
      "变故陡生！{keyword}之力骤然爆发，{scene}之{detail}轰然碎裂。{name}以{clothing}之力强行镇压，却见{keyword}之光冲天而起，照亮了半边天际。天地为之色变，风云因之倒卷。",
      "千钧一发之际，{keyword}之秘终于揭晓。{name}立于{scene}之{detail}，{clothing}猎猎作响，面对{keyword}之真身，方知此前种种，不过是一场试炼。而真正的考验，此刻才刚刚开始。",
    ],
    悬疑: [
      "真相在{time}浮出水面——{keyword}的背后，藏着一个{name}从未怀疑过的人。所有的线索在此刻串联成线，而这条线的终点，指向了一个令人不寒而栗的事实：一切从一开始就是设计好的。",
      "当{keyword}的最后一层伪装被撕开，{name}终于看清了全貌。{scene}的{detail}上，证据铺陈开来，每一条都指向同一个结论——而这个人，此刻正站在{name}身后。",
    ],
    奇幻: [
      "{keyword}的力量在{scene}彻底觉醒！天地变色，{detail}上的封文逐一崩碎。{name}感到{keyword}的力量如洪流般涌入体内，痛苦与力量交织，{clothing}在身周化为光点。这是毁灭，也是重生。",
      "最终之战在{scene}的{detail}上爆发。{keyword}的真正形态显露——它不是{name}想象中的任何样子。{weather}中，{keyword}与{name}的力量碰撞，整个{scene}都在震颤。这一刻，将决定一切。",
    ],
    现实: [
      "事情在{time}彻底失控了。关于{keyword}，{name}一直以为还有回旋的余地，但现实给了最冷酷的回答。{scene}的{detail}上，{peer}留下的那句话像一把刀，切断了所有的退路。",
      "那个关于{keyword}的决定性时刻，来得比{name}预想的更早。没有预兆，没有缓冲，就像{weather}中突然亮起的闪电——短暂，却照亮了一切{name}不愿面对的东西。",
    ],
    意识流: [
      "{keyword}在{time}爆炸不是声音的爆炸是意义的爆炸{scene}的{detail}上所有的词都开始融化{name}也是{keyword}也是{scene}也是一切都在变成一切又一切都在变成{keyword}没有边界没有顺序没有因果只有{weather}还在下它不在乎",
      "然后{keyword}不再是一个词它变成了{scene}变成了{time}变成了{name}的每一根神经{detail}上的裂缝延伸到{detail}之外延伸到{keyword}之外延伸到语言之外{name}试图说点什么但嘴里只有{keyword}{keyword}{keyword}",
    ],
  };

  const styleClimaxes = climaxTemplates[style] || climaxTemplates.散文;
  const kw = keywords.length > 0 ? randomPick(keywords) : vars.keyword;
  const climaxVars = { ...vars, keyword: kw };
  return fillTemplate(randomPick(styleClimaxes), climaxVars);
}

export async function generateShortStory(theme: string, style: string, keywords: string) {
  try {
    if (isAIAvailable()) {
      const prompt = `你是一位才华横溢的短篇故事作家。请根据以下参数创作一篇短篇故事：\n主题：${theme}\n风格：${style}\n关键词：${keywords}\n\n要求：\n1. 字数800-1500字\n2. 结构完整，有开头、发展、高潮、结尾\n3. 风格鲜明，符合所选风格特点\n4. 巧妙融入关键词\n\n请返回JSON格式：{"title": "故事标题", "content": "故事正文"}\n不要添加markdown代码块标记。`;
      const aiResult = await callAI(prompt);
      const parsed = JSON.parse(cleanAIResponse(aiResult));
      return { title: parsed.title || "未命名", content: parsed.content || "" };
    }
  } catch (e) {
    console.warn("AI API 调用失败，降级到本地模板:", e);
  }

  const normalizedStyle = normalizeStyle(style);
  const template = styleTemplates[normalizedStyle];
  const parsedKeywords = parseKeywords(keywords);
  const defaultKeywords = parsedKeywords.length > 0 ? parsedKeywords : ["相遇", "离别", "重逢"];
  const vars = buildSceneVars(theme, defaultKeywords, normalizedStyle);

  // 1. 生成标题
  const title = generateStoryTitle(theme, normalizedStyle, defaultKeywords);

  // 2. 开头
  const openingVars = { ...vars, keyword: defaultKeywords[0] || theme || "命运" };
  const opening = fillTemplate(randomPick(template.openings), openingVars);

  // 3. 发展：根据关键词展开场景
  const developmentScenes = generateKeywordScenes(defaultKeywords, template, vars);
  const connector = randomPick(template.connectorPhrases);
  const development = developmentScenes.join(`\n\n${connector}，`);

  // 4. 高潮
  const climax = generateClimax(normalizedStyle, template, vars, defaultKeywords);

  // 5. 结尾
  const endingVars = { ...vars, keyword: defaultKeywords[defaultKeywords.length - 1] || theme || "命运" };
  const ending = fillTemplate(randomPick(template.endings), endingVars);

  // 6. 组装全文
  const content = [opening, development, climax, ending].join("\n\n");

  return { title, content };
}

export async function convertToScript(content: string, _style: string) {
  try {
    if (isAIAvailable()) {
      const prompt = `你是一位专业的剧本改编师。请将以下内容改写为剧本格式：\n\n${content}\n\n剧本风格：${_style}\n\n格式要求：\n1. 使用【场景X】标注场景\n2. 角色对话格式：角色名（加粗）+ 台词\n3. 动作/旁白用（）标注\n4. 保持原故事的核心情节\n\n请直接输出剧本格式的内容。`;
      const aiResult = await callAI(prompt);
      return { content: aiResult };
    }
  } catch (e) {
    console.warn("AI API 调用失败，降级到本地模板:", e);
  }

  const lines = content.split(/\n+/).filter((line) => line.trim());
  const scriptLines: string[] = [];
  let sceneCount = 1;

  scriptLines.push(`【场景${sceneCount}】 室内 - 夜`);
  scriptLines.push("");

  for (const line of lines) {
    if (line.includes("「") || line.includes("」")) {
      // 对话
      const speakerMatch = line.match(/^(.+?)[：:]/);
      const dialogue = line.replace(/^(.+?)[：:]\s*/, "");
      const speaker = speakerMatch ? speakerMatch[1] : "某人";
      scriptLines.push(`    ${speaker}    ${dialogue}`);
    } else {
      // 动作/旁白
      scriptLines.push(`    （${line}）`);
    }
    scriptLines.push("");
  }

  return { content: scriptLines.join("\n") };
}

export async function generateHighlights(_title: string, genre: string, _theme: string) {
  try {
    if (isAIAvailable()) {
      const prompt = `你是一位专业的网文策划师。请为以下小说设计爽点节奏：\n标题：${_title}\n题材：${genre}\n主题：${_theme}\n\n请生成6-8个爽点设计，每个爽点要具体、有吸引力。\n\n请返回JSON格式：{"highlights": ["爽点1", "爽点2", ...]}\n不要添加markdown代码块标记。`;
      const aiResult = await callAI(prompt);
      const parsed = JSON.parse(cleanAIResponse(aiResult));
      return { highlights: parsed.highlights || [] };
    }
  } catch (e) {
    console.warn("AI API 调用失败，降级到本地模板:", e);
  }

  const baseHighlights = [
    "世界观层层展开，随着主角的脚步，读者将一同探索一个庞大而完整的奇幻世界。",
    "人物立体鲜明，每一个重要角色都有自己的动机与立场，绝非脸谱化的工具人。",
    "情节张弛有度，紧张刺激的战斗与温馨日常交替，避免读者审美疲劳。",
    "伏笔精心布置，前期看似无关的细节，在中后期都将成为影响大局的关键。",
    "情感真挚动人，友情、爱情、亲情交织，在宏大叙事中展现人性的细腻之处。",
    "爽点密集合理，主角的每一次提升都有充分铺垫，绝非突兀的战力膨胀。",
    "冲突层次分明，从个人恩怨到势力博弈，再到天下大势，剧情张力逐级提升。",
    "结局收束有力，所有主线副线妥善收尾，给予读者完整而满意的阅读体验。",
  ];

  const genreSpecific: Record<string, string[]> = {
    玄幻: ["修炼体系设定严谨，境界划分清晰合理", "法宝、丹药、功法等元素丰富多样"],
    都市: ["贴近现实，爽点与生活化场景结合", "角色成长有迹可循，代入感强烈"],
    仙侠: ["问道元素贯穿始终，仙凡之别层次分明", "功法、法宝、洞天等设定引人入胜"],
    科幻: ["世界观设定具有前瞻性，科技元素合理", "时空、维度等概念新颖不落俗套"],
    言情: ["情感线细腻真实，人物互动自然", "男女主角形象立体，化学反应强烈"],
    悬疑: ["悬念层层递进，推理逻辑严谨", "真相揭晓时给予读者恍然大悟的快感"],
    历史: ["历史背景考据严谨，细节真实可信", "人物活动符合时代背景，避免违和感"],
    游戏: ["游戏规则设定清晰，不会出现逻辑漏洞", "竞技场面描写精彩，令人热血沸腾"],
  };

  const extras = genreSpecific[genre] || [];
  const combined = [...baseHighlights, ...extras];
  return { highlights: combined.sort(() => Math.random() - 0.5).slice(0, 6) };
}

export async function generateWorldviewByCategories(title: string, genre: string, description: string) {
  try {
    if (isAIAvailable()) {
      const prompt = `你是一位专业的网文世界观设计师。请根据以下小说的已有世界观内容，按分类重新整理和完善：

标题：${title}
题材：${genre}
已有世界观内容：
${description}

要求：
1. 根据已有内容自行判断需要哪些分类，只为有实际内容的分类生成条目
2. 常见分类参考：地点、历史、势力、功法、物品、种族、规则、概念设定等，但不必全部包含，没有相关内容的分类直接省略
3. 基于已有内容进行分类整理，保留原始信息，不要丢弃任何重要设定
4. 只生成世界观设定，不要包含任何故事主线、剧情梗概或角色经历
5. 每个分类100-200字，可以适当补充完善

请返回JSON格式：
{"items": [{"category": "分类名", "title": "分类名设定", "content": "该分类的详细世界观内容"}]}
不要添加markdown代码块标记。`;
      const aiResult = await callAI(prompt);
      const parsed = JSON.parse(cleanAIResponse(aiResult));
      if (parsed.items && Array.isArray(parsed.items)) {
        return parsed.items.filter((item: any) => item.content && item.content.trim());
      }
    }
  } catch (e) {
    console.warn("AI API 调用失败，降级到本地模板:", e);
  }

  // 本地降级模板
  return [];
}

export async function generateTitle(genre: string, description: string) {
  try {
    if (isAIAvailable()) {
      const prompt = `你是一位专业的网文起名大师。请为以下小说生成一个有创意的标题：

题材：${genre}
简介：${description || "暂无简介"}

要求：
1. 标题长度2-6个字
2. 要有网文风格，吸引眼球
3. 符合${genre}题材特点
4. 不要使用书名号

请直接返回标题文字，不要添加任何其他内容或标点。`;
      const aiResult = await callAI(prompt);
      const title = aiResult.trim().replace(/[《》\s]/g, "");
      if (title && title.length >= 2 && title.length <= 10) {
        return { title };
      }
    }
  } catch (e) {
    console.warn("AI API 调用失败，降级到本地模板:", e);
  }

  // 本地降级模板
  const titleTemplates: Record<string, string[]> = {
    玄幻: ["破天", "逆道", "万界归一", "太初", "苍穹诀"],
    仙侠: ["剑来", "问道长生", "青云志", "仙途", "渡劫"],
    都市: ["重生之巅", "逆流而上", "都市王者", "巅峰人生", "崛起"],
    科幻: ["星际征途", "维度", "末世黎明", "机甲风暴", "深空"],
    言情: ["心动时分", "情深似海", "甜蜜暴击", "命中注定", "余生"],
    悬疑: ["迷局", "暗夜追踪", "第七感", "真相", "深渊"],
    历史: ["乱世英雄", "天下", "烽火", "霸业", "长歌"],
    游戏: ["巅峰竞技", "全服第一", "超神之路", "王者归来", "极限操作"],
    武侠: ["江湖行", "刀客", "侠骨", "武林", "风云录"],
    军事: ["铁血", "战狼", "利刃", "烽烟", "突击"],
    其他: ["命运之轮", "觉醒", "传说", "黎明", "星辰"],
  };
  const titles = titleTemplates[genre] || titleTemplates["其他"];
  return { title: titles[Math.floor(Math.random() * titles.length)] };
}

export async function generateChapterOutline(
  novelTitle: string,
  genre: string,
  volumesJson: string,
  chapterNumber: number,
  previousChapterContent?: string,
  worldview?: string,
  characters?: string,
  foreshadowing?: string,
) {
  let volumesInfo = "";
  try {
    const volumes = JSON.parse(volumesJson);
    volumesInfo = volumes.map((v: any, i: number) =>
      `第${i + 1}卷：${v.title} - ${v.description || ""}（核心冲突：${v.coreConflict || "无"}，预计${v.chapterCount || 0}章）`
    ).join("\n");
  } catch {
    volumesInfo = volumesJson;
  }

  try {
    if (isAIAvailable()) {
      const prompt = `你是一位专业的网文大纲策划师。请为以下小说生成第${chapterNumber}章的章节大纲：

小说标题：${novelTitle}
题材：${genre}

【分卷框架】
${volumesInfo}

${worldview ? `【世界观设定】（仅供参考，本章涉及相关场景或设定时使用）\n${worldview}\n` : ""}${characters ? `【角色信息】（仅供参考，本章涉及相关角色时使用）\n${characters}\n` : ""}${foreshadowing ? `【伏笔信息】（仅供参考，本章需要推进或回应伏笔时使用）\n${foreshadowing}\n` : ""}${previousChapterContent ? `【前一章内容摘要】\n${previousChapterContent.slice(-500)}` : "这是第一章，请基于分卷框架的第一卷来生成。"}

要求：
1. 生成一个章节小标题（2-4个字，有网文风格，如"风起""暗流""惊变"）
2. 生成章节大纲（100-200字，描述本章的主要情节走向、关键事件和情感节奏）
3. 大纲要具体，不要空泛，要有具体的情节设计
4. 根据分卷框架和章节数来确定本章内容方向，延续前文剧情自然推进
5. 上面的世界观设定、角色信息、伏笔信息是参考材料，只在相关时使用，不需要强行全部融入
6. ${chapterNumber === 1 ? "作为开篇章节，要注意引入主角、建立世界观、设置悬念" : "要承接前文，推动剧情发展"}

请返回JSON格式：{"subtitle": "章节小标题", "outline": "章节大纲内容"}
不要添加markdown代码块标记。`;
      const aiResult = await callAI(prompt);
      const parsed = JSON.parse(cleanAIResponse(aiResult));
      return {
        subtitle: parsed.subtitle || "风起",
        outline: parsed.outline || "",
      };
    }
  } catch (e) {
    console.warn("AI API 调用失败，降级到本地模板:", e);
  }

  // 本地降级
  const subtitles = ["风起", "初遇", "异兆", "暗流", "惊变", "抉择", "破局", "悟道", "故人", "秘辛", "锋芒", "逆命", "天劫", "归途", "黎明"];
  return {
    subtitle: subtitles[Math.floor(Math.random() * subtitles.length)],
    outline: `第${chapterNumber}章：主角在这一章将面临新的挑战与机遇，剧情在紧张与舒缓之间交替推进，为后续发展埋下重要伏笔。`,
  };
}

export async function parseNovelFromText(text: string) {
  // 如果文本过长，截取前15000字用于AI分析（章节内容单独处理）
  const analysisText = text.slice(0, 15000);

  try {
    if (isAIAvailable()) {
      const prompt = `你是一位专业的网文编辑，请对以下小说文本进行分类整理和解析。

【小说文本】
${analysisText}

请按以下步骤处理：

第一步：分类整理
先识别文本中各类内容的性质，区分出：章节正文、角色描述、世界观设定、伏笔线索、作者简介/前言/序言、作品简介等。

第二步：匹配填入
将分类后的内容填入以下JSON结构：
{
  "title": "小说标题（仅从文本中提取，若检测到书名号《》包裹的名称如《某某书名》，直接提取名称本身"某某书名"，不含书名号，不要重复提取；无法确定则留空字符串）",
  "genre": "题材分类（从以下选择：玄幻、都市、仙侠、科幻、言情、悬疑、历史、游戏、其他）",
  "description": "作品简介（仅从原文中提取已有的简介内容，没有则留空字符串，不要自己编造）",
  "volumes": [
    {"title": "卷名", "description": "卷描述", "chapterCount": 章节数, "coreConflict": "核心冲突"}
  ],
  "characters": [
    {"name": "角色名", "role": "主角/配角/反派/龙套", "personality": "性格描述", "background": "背景描述"}
  ],
  "chapters": [
    {"title": "章节标题（不含章节序号标记后的换行内容）", "content": "章节正文内容（不含标题行本身）"}
  ],
  "worldview": [
    {"category": "分类名（如修炼体系、地理、势力等）", "title": "设定标题", "content": "设定内容"}
  ],
  "foreshadowing": [
    {"title": "伏笔标题", "content": "伏笔内容描述"}
  ]
}

重要规则：
1. 【分类优先】文本可能格式杂乱，先判断每段内容属于什么类型（章节正文？角色描述？世界观？作者简介？），再决定放入哪个字段
2. 【章节标题去重】chapters中title放章节标题（如"第一章 风起"），content放标题行之后的正文内容，不要在content开头重复写标题
3. 【角色深度提取】从文本中提取角色时，必须根据该角色在文中的行为、对话、描述来分析其角色定位（主角/配角/反派/龙套）、性格特征和背景信息。不能只返回名字，personality和background必须有实质内容
4. 【作者简介/前言】文本开头的作者简介、前言、序言等非章节内容，应归入description或worldview，不要遗漏
5. 【不自动生成】volumes和description仅从原文中提取已有内容，原文没有的不要编造，对应字段返回空数组或空字符串
6. 【书名提取】若文本中有书名号《》包裹的名称（如《某某书名》），title字段直接填名称本身（某某书名），不含书名号，不要重复提取
7. 【章节划分】根据"第X章"、"第X回"等标记划分章节；没有明确标记时，按内容自然段落每2000-3000字划分为一章
8. 如果某项信息无法从文本中提取，对应字段返回空数组或空字符串
9. 不要添加markdown代码块标记

注意：chapters中的content要尽量保留原文内容，不要缩写。`;

      const aiResult = await callAI(prompt);
      const parsed = JSON.parse(cleanAIResponse(aiResult));

      // 如果AI没有返回完整的章节内容，用原文补充
      if (parsed.chapters && parsed.chapters.length > 0) {
        // 尝试从原文中按章节标记切分完整内容
        const chapterRegex = /第[零一二三四五六七八九十百千万\d]+[章节回卷]/g;
        const matches = [...text.matchAll(chapterRegex)];

        if (matches.length >= parsed.chapters.length) {
          for (let i = 0; i < parsed.chapters.length; i++) {
            const start = matches[i].index!;
            const end = i + 1 < matches.length ? matches[i + 1].index! : text.length;
            let fullContent = text.slice(start, end).trim();
            // 去掉第一行（标题行）
            const firstNewline = fullContent.indexOf('\n');
            if (firstNewline > 0) {
              fullContent = fullContent.slice(firstNewline + 1).trim();
            }
            // 如果AI返回的content太短（可能是摘要），用原文替换
            if (fullContent.length > (parsed.chapters[i].content?.length || 0) * 2) {
              parsed.chapters[i].content = fullContent;
            }
          }
        }
      }

      return {
        title: parsed.title || "",
        genre: parsed.genre || "其他",
        description: parsed.description || "",
        volumes: parsed.volumes || [],
        characters: parsed.characters || [],
        chapters: parsed.chapters || [],
        worldview: parsed.worldview || [],
        foreshadowing: parsed.foreshadowing || [],
      };
    }
  } catch (e) {
    console.warn("AI 解析小说失败，降级到本地处理:", e);
  }

  // 本地降级：简单按章节标记切分
  const chapterRegex = /第[零一二三四五六七八九十百千万\d]+[章节回卷]/g;
  const matches = [...text.matchAll(chapterRegex)];

  const chapters = [];
  if (matches.length > 0) {
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index!;
      const end = i + 1 < matches.length ? matches[i + 1].index! : text.length;
      const chapterText = text.slice(start, end).trim();
      const titleMatch = chapterText.match(/^(第[零一二三四五六七八九十百千万\d]+[章节回卷][^\n]*)/);
      // content去掉标题行
      let content = chapterText;
      if (titleMatch) {
        const afterTitle = chapterText.slice(titleMatch[0].length).trim();
        if (afterTitle) {
          content = afterTitle;
        }
      }
      chapters.push({
        title: titleMatch ? titleMatch[1].trim() : `第${i + 1}章`,
        content,
      });
    }
  } else {
    // 没有章节标记，整篇作为一章
    chapters.push({
      title: "第1章",
      content: text,
    });
  }

  return {
    title: "",
    genre: "其他",
    description: "",
    volumes: [],
    characters: [],
    chapters,
    worldview: [],
    foreshadowing: [],
  };
}
