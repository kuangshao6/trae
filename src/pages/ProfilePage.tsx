import { useState } from "react";
import { User, Mail, Pen, Lock, Camera, Save, Shield } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import Layout from "../components/Layout";

export default function ProfilePage() {
  const { user } = useAuthStore();
  
  const [form, setForm] = useState({
    username: user?.username || "",
    penName: user?.penName || "",
    email: user?.email || "",
    bio: "热爱创作，专注于网文小说写作",
  });
  
  const [password, setPassword] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });
  
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  const [saved, setSaved] = useState(false);

  const handleSaveProfile = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    alert("个人信息更新成功！");
  };

  const handleChangePassword = () => {
    if (!password.current) {
      alert("请输入当前密码");
      return;
    }
    if (!password.newPassword) {
      alert("请输入新密码");
      return;
    }
    if (password.newPassword !== password.confirm) {
      alert("两次输入的密码不一致");
      return;
    }
    if (password.newPassword.length < 6) {
      alert("新密码长度不能少于 6 位");
      return;
    }
    alert("密码修改成功！");
    setPassword({ current: "", newPassword: "", confirm: "" });
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-ink-800 mb-2 font-sketchy">个人中心</h1>
          <p className="text-ink-500">管理您的账号信息和设置</p>
        </div>

        {/* 头像区域 */}
        <div className="card-sketchy p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 sketchy-accent bg-accent-50 text-accent-600 flex items-center justify-center text-3xl font-bold font-sketchy">
                {form.penName?.charAt(0) || form.username?.charAt(0) || "A"}
              </div>
              <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white border border-ink-200 rounded-full flex items-center justify-center text-ink-500 hover:text-ink-700 hover:border-ink-300 transition-colors shadow-sm">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-ink-800 mb-1">{form.penName || form.username}</h2>
              <p className="text-ink-500 text-sm mb-3">作者</p>
              <button className="text-sm text-accent-600 hover:text-accent-700 font-medium">
                更换头像
              </button>
            </div>
          </div>
        </div>

        {/* 标签页 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "profile"
                ? "sketchy-light bg-accent-50 text-accent-700"
                : "text-ink-600 hover:bg-ink-50"
            }`}
          >
            个人信息
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "security"
                ? "sketchy-light bg-accent-50 text-accent-700"
                : "text-ink-600 hover:bg-ink-50"
            }`}
          >
            账号安全
          </button>
        </div>

        {/* 个人信息表单 */}
        {activeTab === "profile" && (
          <div className="card-sketchy p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    用户名
                  </span>
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="input-sketchy"
                  placeholder="请输入用户名"
                />
                <p className="text-xs text-ink-400 mt-1">用户名是您登录使用的账号名称</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Pen className="w-4 h-4" />
                    笔名
                  </span>
                </label>
                <input
                  type="text"
                  value={form.penName}
                  onChange={(e) => setForm({ ...form, penName: e.target.value })}
                  className="input-sketchy"
                  placeholder="请输入笔名"
                />
                <p className="text-xs text-ink-400 mt-1">笔名是您在创作时使用的名称，将显示在您的作品页面</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    邮箱
                  </span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-sketchy"
                  placeholder="请输入邮箱"
                />
                <p className="text-xs text-ink-400 mt-1">用于接收重要通知和找回密码</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">个人简介</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  className="input-sketchy resize-none"
                  placeholder="介绍一下自己..."
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-ink-100">
                <div className="flex items-center gap-2">
                  {saved && (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      保存成功
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center gap-2 px-6 py-2.5 btn-sketchy-primary text-white font-medium"
                >
                  <Save className="w-4 h-4" />
                  保存修改
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 账号安全表单 */}
        {activeTab === "security" && (
          <div className="card-sketchy p-6">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-ink-100">
              <div className="w-12 h-12 sketchy-light bg-green-50 flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-ink-800">账号安全等级：良好</h3>
                <p className="text-sm text-ink-500">建议您定期更换密码以保护账号安全</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    当前密码
                  </span>
                </label>
                <input
                  type="password"
                  value={password.current}
                  onChange={(e) => setPassword({ ...password, current: e.target.value })}
                  className="input-sketchy"
                  placeholder="请输入当前密码"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    新密码
                  </span>
                </label>
                <input
                  type="password"
                  value={password.newPassword}
                  onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
                  className="input-sketchy"
                  placeholder="请输入新密码"
                />
                <p className="text-xs text-ink-400 mt-1">密码长度至少 6 位</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    确认新密码
                  </span>
                </label>
                <input
                  type="password"
                  value={password.confirm}
                  onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                  className="input-sketchy"
                  placeholder="请再次输入新密码"
                />
              </div>

              <button
                onClick={handleChangePassword}
                className="w-full py-3 btn-sketchy-primary text-white font-medium"
              >
                修改密码
              </button>
            </div>

            {/* 其他安全设置 */}
            <div className="mt-8 pt-6 border-t border-ink-100">
              <h4 className="font-medium text-ink-800 mb-4">其他安全设置</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 px-4 sketchy-light bg-ink-50">
                  <div>
                    <div className="font-medium text-ink-700">登录邮箱</div>
                    <div className="text-sm text-ink-500">{user?.email}</div>
                  </div>
                  <button className="text-sm text-accent-600 hover:text-accent-700 font-medium">
                    修改
                  </button>
                </div>
                <div className="flex items-center justify-between py-3 px-4 sketchy-light bg-ink-50">
                  <div>
                    <div className="font-medium text-ink-700">账号创建时间</div>
                    <div className="text-sm text-ink-500">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("zh-CN") : "未知"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
