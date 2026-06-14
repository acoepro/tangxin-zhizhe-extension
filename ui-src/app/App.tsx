import { useEffect, useRef, useState } from "react";
import { Bell, Download, Info, LayoutDashboard, Play, Settings, Users, X } from "lucide-react";
import { listenBridgeState, notifyUiReady, sendUiAction } from "./bridge";
import type { BridgeState, Page } from "./types";
import { OverviewPage } from "./components/OverviewPage";
import { AccountsPage } from "./components/AccountsPage";
import { PlaybackPage } from "./components/PlaybackPage";
import { DownloadsPage } from "./components/DownloadsPage";
import { SettingsPage } from "./components/SettingsPage";
import { flowItemText } from "./helpers";

const navItems: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "总览", icon: LayoutDashboard },
  { id: "accounts", label: "账号池", icon: Users },
  { id: "playback", label: "播放", icon: Play },
  { id: "downloads", label: "下载", icon: Download },
  { id: "settings", label: "设置", icon: Settings }
];

const pageTitles: Record<Page, string> = {
  overview: "总览",
  accounts: "账号池",
  playback: "播放",
  downloads: "下载",
  settings: "设置"
};

function action(actionName: string, payload: Record<string, unknown> = {}) {
  sendUiAction(actionName, payload);
}

function flowMessage(state: BridgeState, index: number) {
  const latest = (state.flow || []).slice(-4);
  if (latest.length) {
    return flowItemText(latest[index % latest.length]) || "糖心志者正在运行";
  }
  const fallback = [
    "正在同步云端账号池…",
    "当前使用账号：糖糖一号",
    "获取播放详情完成",
    "金币视频已解锁"
  ];
  return fallback[index % fallback.length];
}

export default function App() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState<Page>("overview");
  const [ballPos, setBallPos] = useState({ x: 0, y: 0 });
  const [flowIdx, setFlowIdx] = useState(0);
  const [showFlow, setShowFlow] = useState(true);
  const [showUpdateBanner, setShowUpdateBanner] = useState(true);
  const [bridgeState, setBridgeState] = useState<BridgeState>({});
  const dragging = useRef(false);
  const dragStart = useRef({ mx: 0, my: 0, bx: 0, by: 0 });
  const moved = useRef(false);

  useEffect(() => {
    const stop = listenBridgeState((next) => {
      setBridgeState(next);
      if (typeof next.expanded === "boolean") setOpen(next.expanded);
    });
    notifyUiReady();
    const timer = window.setTimeout(notifyUiReady, 300);
    return () => {
      window.clearTimeout(timer);
      stop();
    };
  }, []);

  useEffect(() => {
    if (open) return;
    const timer = window.setInterval(() => setFlowIdx((value) => value + 1), 2500);
    return () => window.clearInterval(timer);
  }, [open]);

  const openPanel = () => {
    setOpen(true);
    action("toggle", { force: true });
  };

  const closePanel = () => {
    setOpen(false);
    action("close");
  };

  const onBallPointerDown = (event: React.PointerEvent) => {
    dragging.current = true;
    moved.current = false;
    dragStart.current = { mx: event.clientX, my: event.clientY, bx: ballPos.x, by: ballPos.y };
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  };

  const onBallPointerMove = (event: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = event.clientX - dragStart.current.mx;
    const dy = event.clientY - dragStart.current.my;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved.current = true;
    setBallPos({ x: dragStart.current.bx + dx, y: dragStart.current.by + dy });
  };

  const onBallPointerUp = () => {
    dragging.current = false;
    if (!moved.current) openPanel();
  };

  const renderPage = () => {
    if (page === "overview") return <OverviewPage state={bridgeState} onAction={action} onPage={setPage} />;
    if (page === "accounts") return <AccountsPage state={bridgeState} onAction={action} />;
    if (page === "playback") return <PlaybackPage state={bridgeState} onAction={action} />;
    if (page === "downloads") return <DownloadsPage state={bridgeState} onAction={action} />;
    return <SettingsPage state={bridgeState} onAction={action} />;
  };

  const updateAvailable = Boolean(bridgeState.repositoryUpdate?.updateAvailable);

  return (
    <div className="txzz-candy-app size-full relative overflow-hidden">
      {!open && showFlow && (
        <div
          className="txzz-candy-interactive fixed top-4 left-4 z-40 flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[11px] font-medium px-3 py-1.5 rounded-full shadow-lg animate-pulse"
          style={{ maxWidth: "calc(100vw - 80px)" }}
          onClick={() => setShowFlow(false)}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
          <span className="truncate">{flowMessage(bridgeState, flowIdx)}</span>
        </div>
      )}

      {!open && (
        <div
          onPointerDown={onBallPointerDown}
          onPointerMove={onBallPointerMove}
          onPointerUp={onBallPointerUp}
          className="txzz-candy-interactive fixed bottom-20 right-5 z-50 cursor-pointer select-none touch-none"
          style={{ transform: `translate(${ballPos.x}px, ${ballPos.y}px)` }}
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 via-rose-400 to-purple-600 shadow-xl flex items-center justify-center relative active:scale-95 transition-transform">
            <span className="text-white text-xl font-bold">志</span>
            <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
          </div>
        </div>
      )}

      {open && (
        <div className="txzz-candy-interactive fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={closePanel} />
          <div className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:w-[700px] sm:max-w-full bg-white/95 backdrop-blur-xl rounded-none sm:rounded-3xl shadow-2xl flex flex-col sm:flex-row overflow-hidden border border-pink-100">
            <aside className="hidden sm:flex flex-col w-20 bg-gradient-to-b from-pink-400 via-rose-400 to-purple-600 py-5 items-center gap-1 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-4">
                <span className="text-white text-xl font-bold">志</span>
              </div>
              {navItems.map((item) => {
                const active = page === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setPage(item.id)}
                    className={`w-14 flex flex-col items-center gap-1 py-2.5 rounded-2xl transition-all ${active ? "bg-white/25 shadow-inner" : "hover:bg-white/10"}`}
                  >
                    <item.icon size={20} className="text-white" />
                    <span className="text-[9px] text-white font-medium">{item.label}</span>
                  </button>
                );
              })}
              <button onClick={closePanel} className="mt-auto w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-all">
                <X size={16} className="text-white" />
              </button>
            </aside>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <header className="flex items-center justify-between px-4 py-3 border-b border-pink-100 shrink-0 bg-white/80">
                <div className="flex items-center gap-2">
                  <div className="sm:hidden w-8 h-8 rounded-xl bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">志</span>
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-purple-800">{pageTitles[page]}</h1>
                    <p className="text-[10px] text-purple-400 hidden sm:block">糖心志者控制台</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {showUpdateBanner && (
                    <button
                      onClick={() => setPage("settings")}
                      className={`hidden sm:flex items-center gap-1.5 border rounded-full px-3 py-1 text-[11px] ${updateAvailable ? "bg-amber-50 border-amber-200 text-amber-600" : "bg-pink-50 border-pink-100 text-purple-400"}`}
                    >
                      <Bell size={11} />
                      <span>{updateAvailable ? "有新版本可用" : "更新状态正常"}</span>
                    </button>
                  )}
                  <button onClick={() => action("about")} className="rounded-full p-1.5 text-purple-400 hover:bg-purple-50" title="打开项目主页">
                    <Info size={16} />
                  </button>
                  <button onClick={closePanel} className="rounded-full p-1.5 text-purple-400 hover:bg-pink-50 sm:hidden">
                    <X size={16} />
                  </button>
                </div>
              </header>

              {showUpdateBanner && updateAvailable && (
                <div className="flex shrink-0 items-center gap-2 border-b border-amber-100 bg-amber-50 px-4 py-2 text-[11px] text-amber-600 sm:hidden">
                  <Bell size={11} className="shrink-0" />
                  <button className="flex-1 text-left" onClick={() => setPage("settings")}>发现新版本，点击设置页下载最新版</button>
                  <button onClick={() => setShowUpdateBanner(false)}><X size={12} /></button>
                </div>
              )}

              <main className="flex-1 overflow-y-auto overscroll-contain">
                {renderPage()}
              </main>

              <nav className="flex shrink-0 items-center border-t border-pink-100 bg-white/90 sm:hidden">
                {navItems.map((item) => {
                  const active = page === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setPage(item.id)}
                      className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-all ${active ? "text-pink-500" : "text-purple-300"}`}
                    >
                      <div className={`rounded-xl p-1.5 transition-all ${active ? "bg-gradient-to-br from-pink-400 to-purple-500 shadow-md" : ""}`}>
                        <item.icon size={18} className={active ? "text-white" : ""} />
                      </div>
                      <span className="text-[9px] font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
