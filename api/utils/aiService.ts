import OpenAI from "openai";

const AI_API_KEY = process.env.AI_API_KEY || "";
const AI_BASE_URL = process.env.AI_BASE_URL || "https://api.deepseek.com";
const AI_MODEL = process.env.AI_MODEL || "deepseek-chat";

const DEFAULT_SYSTEM_PROMPT =
  "你是一位专业的网文创作助手，擅长创作各类题材的网络小说。";

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: AI_API_KEY,
      baseURL: AI_BASE_URL,
      timeout: 60_000,
      maxRetries: 1,
    });
  }
  return openaiClient;
}

/**
 * 检查AI是否可用
 */
export function isAIAvailable(): boolean {
  return AI_API_KEY.length > 0;
}

/**
 * 统一AI调用函数
 */
export async function callAI(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  if (!isAIAvailable()) {
    throw new Error("AI服务未配置");
  }

  const client = getOpenAIClient();

  try {
    const response = await client.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt || DEFAULT_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("AI返回内容为空");
    }
    return content;
  } catch (error: unknown) {
    if (error instanceof OpenAI.APIError) {
      throw new Error(`AI API错误: ${error.message}`);
    }
    if (error instanceof OpenAI.APIConnectionError) {
      throw new Error("AI服务连接失败，请检查网络或API地址配置");
    }
    if (error instanceof OpenAI.RateLimitError) {
      throw new Error("AI服务请求频率超限，请稍后重试");
    }
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new Error("AI服务请求超时，请稍后重试");
    }
    if (error instanceof Error) {
      throw new Error(`AI服务错误: ${error.message}`);
    }
    throw new Error("AI服务未知错误");
  }
}
