import express from "express";
import cors from "cors";
import authRouter from "./routes/auth";
import novelsRouter from "./routes/novels";
import aiRouter from "./routes/ai";

const app = express();

// CORS 配置：允许前端域名访问
const allowedOrigins = [
  process.env.FRONTEND_URL, // Vercel 部署地址
  "http://localhost:5173",  // 本地开发
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(null, true);
  },
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// 挂载路由
app.use("/api/auth", authRouter);
app.use("/api/novels", novelsRouter);
app.use("/api/ai", aiRouter);

// 健康检查
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404
app.use("/api/*", (_req, res) => {
  res.status(404).json({ message: "API 不存在" });
});

export default app;
