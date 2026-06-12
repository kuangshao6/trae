import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NovelDetail from "./pages/NovelDetail";
import NovelChapters from "./pages/NovelChapters";
import NovelCharacters from "./pages/NovelCharacters";
import NovelModule from "./pages/NovelModule";
import MyNovelsPage from "./pages/MyNovelsPage";
import CreateNovelPage from "./pages/CreateNovelPage";
import OutlinePage from "./pages/OutlinePage";
import ChapterEditor from "./pages/ChapterEditor";
import ShortStoryGenerator from "./pages/ShortStoryGenerator";
import ScriptConverter from "./pages/ScriptConverter";
import MembershipPage from "./pages/MembershipPage";
import ProfilePage from "./pages/ProfilePage";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect, useState, Component, ReactNode } from "react";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token } = useAuthStore();
  if (!isAuthenticated && !token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-ink-50">
          <div className="text-center space-y-6 p-8">
            <h1 className="font-sketchy text-4xl text-ink-800">页面出错了</h1>
            <p className="text-ink-600 font-sketchy">抱歉，页面遇到了一些问题，请尝试重新加载。</p>
            <button
              className="btn-sketchy-primary"
              onClick={() => window.location.reload()}
            >
              重新加载
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const { loadUser, isAuthenticated } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await loadUser();
      setReady(true);
    };
    init();
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50">
        <div className="loading-dots text-ink-400"><span /><span /><span /></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/novels" element={<MyNovelsPage />} />
        <Route path="/novels/create" element={<CreateNovelPage />} />
        <Route path="/novels/outline" element={<OutlinePage />} />
        <Route path="/tools/short-story" element={<ShortStoryGenerator />} />
        <Route path="/tools/script" element={<ScriptConverter />} />
        <Route path="/membership" element={<MembershipPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        <Route path="/novels/:id" element={<NovelDetail />} />
        <Route path="/novels/:id/chapters" element={<NovelChapters />} />
        <Route path="/novels/:id/editor/:chapterId" element={<ChapterEditor />} />
        <Route path="/novels/:id/characters" element={<NovelCharacters />} />
        <Route path="/novels/:id/world" element={<NovelModule type="world" />} />
        <Route path="/novels/:id/foreshadow" element={<NovelModule type="foreshadow" />} />
        <Route path="/novels/:id/constraints" element={<NovelModule type="constraints" />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}
