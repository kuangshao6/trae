import "dotenv/config";
import app from "./app";

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`📖 AI小说家创作平台 API 服务已启动`);
  console.log(`   服务地址: http://localhost:${port}`);
  console.log(`   健康检查: http://localhost:${port}/api/health`);
});
