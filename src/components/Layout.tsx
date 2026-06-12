import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BookOpen, PenTool, LayoutDashboard, LogOut, Menu, X, Sparkles, FileText, Users, MapPin, AlertTriangle, Bell, Search } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && location.pathname !== "/login") {
      navigate("/login");
    }
  }, [isAuthenticated, location.pathname, navigate]);

  const topNavItems = [
    { path: "/dashboard", label: "工作台", icon: <LayoutDashboard className="w-4 h-4" /> },
    { path: "/novels", label: "我的作品", icon: <FileText className="w-4 h-4" /> },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard" || location.pathname === "/";
    if (path === "/novels") return location.pathname.startsWith("/novels");
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-ink-50/50 flex flex-col">
      {/* 顶部导航栏 */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-paper border-b-2 border-ink-300 z-40">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 sketchy-accent bg-accent-50 text-accent-600 flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-ink-800 text-lg font-sketchy">AI小说家</div>
            </div>
          </Link>

          {/* 导航链接 */}
          <nav className="hidden md:flex items-center gap-1">
            {topNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(item.path)
                    ? "sketchy-light bg-accent-50 text-accent-700"
                    : "text-ink-600 hover:bg-ink-50 hover:text-ink-800"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 搜索和操作 */}
          <div className="flex items-center gap-3">
            {/* 搜索 */}
            <div className="hidden lg:flex items-center px-4 py-2">
              <Search className="w-4 h-4 text-ink-400" />
              <input
                type="text"
                placeholder="搜索作品、灵感..."
                className="input-sketchy bg-transparent border-none outline-none text-sm text-ink-700 placeholder:text-ink-400 ml-2 w-48"
              />
            </div>

            {/* 用户菜单 */}
            <div className="relative user-menu-container">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 hover:bg-ink-50 rounded-lg transition-colors"
              >
                <div className="w-9 h-9 sketchy bg-ink-50 text-ink-700 font-sketchy flex items-center justify-center text-sm">
                  {user?.penName?.charAt(0) || user?.username?.charAt(0) || "A"}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-semibold text-ink-800">{user?.penName || "管理员"}</div>
                  <div className="text-xs text-ink-500">作者</div>
                </div>
              </button>

              {/* 用户下拉菜单 */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div 
                    className="fixed top-14 right-4 w-48 bg-white border-2 border-ink-300 py-1 z-50 shadow-card animate-fade-in"
                    style={{borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px'}}
                  >
                    <div className="px-4 py-3 border-b border-ink-100">
                      <div className="font-semibold text-ink-800">{user?.penName || user?.username}</div>
                      <div className="text-xs text-ink-500">{user?.email}</div>
                    </div>
                    <button 
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate("/profile");
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-ink-600 hover:bg-ink-50 transition-colors"
                    >
                      <Users className="w-4 h-4" /> 个人中心
                    </button>
                    <button 
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                        navigate("/login");
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> 退出登录
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* 移动端菜单按钮 */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg text-ink-600 hover:bg-ink-50"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 移动端底部导航 */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-ink-100 flex items-center justify-around z-40">
          {topNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg ${
                isActive(item.path) ? "text-accent-600 font-sketchy" : "text-ink-500"
              }`}
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </header>

      {/* 侧边栏遮罩 */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40 animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 移动端侧边栏 */}
      <aside
        className={`md:hidden fixed top-16 left-0 h-[calc(100vh-64px)] w-64 bg-paper border-r-2 border-ink-300 z-50 flex flex-col transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-ink-400 uppercase tracking-wider px-3 mb-2">主要</div>
          {topNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive(item.path)
                  ? "sketchy-accent bg-accent-50 text-accent-700"
                  : "text-ink-600 hover:bg-ink-50 hover:text-ink-800"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}

          <div className="mt-6 pt-4 border-t border-ink-100">
            <Link
              to="/tools/short-story"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-600 hover:bg-ink-50 hover:text-ink-800"
            >
              <FileText className="w-5 h-5" /> 短篇故事
            </Link>
            <Link
              to="/tools/script"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-600 hover:bg-ink-50 hover:text-ink-800"
            >
              <PenTool className="w-5 h-5" /> 剧本改写
            </Link>
          </div>

          {user && (
            <div className="mt-6 pt-4 border-t border-ink-100">
              <div className="text-xs font-semibold text-ink-400 uppercase tracking-wider px-3 mb-2">作者信息</div>
              <div className="px-3 py-3 sketchy-light bg-ink-50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 sketchy bg-ink-50 text-ink-700 font-sketchy flex items-center justify-center text-sm">
                    {user.penName?.charAt(0) || user.username?.charAt(0) || "A"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-ink-800 truncate">{user.penName || user.username}</div>
                    <div className="text-xs text-ink-500 truncate">{user.email}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-ink-100">
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-50 hover:text-red-600 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            退出登录
          </button>
        </div>
      </aside>

      {/* 主内容 */}
      <main className="flex-1 pt-16 pb-20 md:pb-0 min-h-screen">
        <div className="container max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">{children}</div>
      </main>
    </div>
  );
}

// 作品详情侧边导航
export function NovelSidebarNav({ novelId, activeTab }: { novelId: string; activeTab: string }) {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: "overview", label: "概览", icon: <LayoutDashboard className="w-4 h-4" />, path: `/novels/${novelId}` },
    { id: "chapters", label: "章节", icon: <FileText className="w-4 h-4" />, path: `/novels/${novelId}/chapters` },
    { id: "characters", label: "角色", icon: <Users className="w-4 h-4" />, path: `/novels/${novelId}/characters` },
    { id: "world", label: "世界观", icon: <MapPin className="w-4 h-4" />, path: `/novels/${novelId}/world` },
    { id: "foreshadow", label: "伏笔", icon: <AlertTriangle className="w-4 h-4" />, path: `/novels/${novelId}/foreshadow` },
  ];

  return (
    <div className="space-y-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => navigate(tab.path)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === tab.id || location.pathname === tab.path
              ? "sketchy-accent bg-accent-50 text-accent-700"
              : "text-ink-600 hover:bg-ink-50"
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
