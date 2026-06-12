import { Router, Request, Response } from "express";
import { userStore } from "../utils/storage";
import crypto from "crypto";

const router = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function createToken(userId: string): string {
  return Buffer.from(`${userId}:${Date.now()}`).toString("base64");
}

function verifyToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [userId] = decoded.split(":");
    return userId || null;
  } catch {
    return null;
  }
}

// 注册
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { username, email, password, penName } = req.body;

    if (!username || !email || !password || !penName) {
      return res.status(400).json({ success: false, message: "请填写所有必填字段" });
    }

    const existing = await userStore.findByEmailAsync(email);
    if (existing) {
      return res.status(400).json({ success: false, message: "该邮箱已被注册" });
    }

    const user = await userStore.createAsync({
      username,
      email: email.toLowerCase(),
      password: hashPassword(password),
      penName,
    });

    const token = createToken(user.id);

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        penName: user.penName,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "服务器错误" });
  }
});

// 登录
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "请输入邮箱和密码" });
    }

    const user = await userStore.findByEmailAsync(email);
    if (!user) {
      return res.status(401).json({ success: false, message: "邮箱或密码错误" });
    }

    if (user.password !== hashPassword(password)) {
      return res.status(401).json({ success: false, message: "邮箱或密码错误" });
    }

    const token = createToken(user.id);

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        penName: user.penName,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "服务器错误" });
  }
});

// 获取当前用户
router.get("/me", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization || (req.headers["x-auth-token"] as string);
    const token = authHeader?.replace("Bearer ", "") || "";

    if (!token) {
      return res.status(401).json({ success: false, message: "未登录" });
    }

    const userId = verifyToken(token);
    if (!userId) {
      return res.status(401).json({ success: false, message: "无效的token" });
    }

    const user = await userStore.findByIdAsync(userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "用户不存在" });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        penName: user.penName,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "服务器错误" });
  }
});

// 登出
router.post("/logout", (_req: Request, res: Response) => {
  res.json({ success: true });
});

export default router;
