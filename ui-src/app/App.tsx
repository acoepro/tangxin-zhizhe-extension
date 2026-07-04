import { useEffect, useRef, useState } from "react";
import { Bell, Download, Info, LayoutDashboard, Play, Settings, Users, X, Zap } from "lucide-react";
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

// 流程消息的等级对应颜色
const flowLevelColors: Record<string, string> = {
  ok: "from-emerald-500 to-teal-500",
  error: "from-rose-500 to-red-500",
  info: "from-pink-500 to-purple-600",
  running: "from-amber-400 to-orange-500"
};

function action(actionName: string, payload: Record<string, unknown> = {}) {
  sendUiAction(actionName, payload);
}

function flowMessage(state: BridgeState, index: number): { text: string; level: string } {
  const latest = (state.flow || []).slice(-4);
  if (latest.length) {
    const item = latest[index % latest.length];
    return { text: flowItemText(item) || "糖心志者正在运行", level: item?.level || "info" };
  }
  const fallbacks = [
    { text: "正在同步云端账号池…", level: "info" },
    { text: "账号池就绪，等待播放请求", level: "ok" },
    { text: "获取播放详情完成", level: "ok" },
    { text: "金币视频自动解锁就绪", level: "info" }
  ];
  return fallbacks[index % fallbacks.length];
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

  // 监听桥接状态更新
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

  // 浮动消息轮播定时器
  useEffect(() => {
    if (open) return;
    const timer = window.setInterval(() => setFlowIdx((value) => value + 1), 2800);
    return () => window.clearInterval(timer);
  }, [open]);

  // Escape 键关闭面板
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const openPanel = () => {
    setOpen(true);
    action("toggle", { force: true });
  };

  const closePanel = () => {
    setOpen(false);
    action("close");
  };

  // 悬浮球拖拽事件处理
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
  // 下载队列中是否有活跃任务
  const activeDownloads = Object.values(bridgeState.downloadTasks || {})
    .filter((t) => t && ["queued", "playlist", "segments", "segment", "ready"].includes(String((t as { stage?: string }).stage || ""))).length;
  const { text: flowText, level: flowLevel } = flowMessage(bridgeState, flowIdx);
  const flowGradient = flowLevelColors[flowLevel] || flowLevelColors.info;

  return (
    <div className="txzz-candy-app size-full relative overflow-hidden">
      {/* 顶部流程消息提示条 */}
      {!open && showFlow && (
        <div
          className={`txzz-candy-interactive fixed top-4 left-4 z-40 flex items-center gap-2 bg-gradient-to-r ${flowGradient} text-white text-[11px] font-medium px-3 py-1.5 rounded-full shadow-lg cursor-pointer`}
          style={{ maxWidth: "calc(100vw - 80px)" }}
          onClick={() => setShowFlow(false)}
          title="点击关闭此提示条"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white/80 shrink-0 animate-pulse" />
          <span className="truncate">{flowText}</span>
        </div>
      )}

      {/* 悬浮操作球 */}
      {!open && (
        <div
          onPointerDown={onBallPointerDown}
          onPointerMove={onBallPointerMove}
          onPointerUp={onBallPointerUp}
          className="txzz-candy-interactive fixed bottom-20 right-5 z-50 cursor-pointer select-none touch-none"
          style={{ transform: `translate(${ballPos.x}px, ${ballPos.y}px)` }}
          title="点击打开糖心志者面板（可拖动）"
        >
          {/* 主球体 */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 via-rose-400 to-purple-600 shadow-xl flex items-center justify-center relative active:scale-95 transition-transform duration-150">
            <span className="text-white text-xl font-bold select-none">志</span>
            {/* 活跃状态指示点：有下载任务时显示橙色，有更新时显示黄色，否则绿色 */}
            <div
              className={`absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white transition-colors ${
                updateAvailable ? "bg-amber-400 animate-pulse" : activeDownloads > 0 ? "bg-orange-400 animate-pulse" : "bg-emerald-400"
              }`}
            />
          </div>
          {/* 活跃下载任务数字徽章 */}
          {activeDownloads > 0 && (
            <div className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">{activeDownloads}</span>
            </div>
          )}
        </div>
      )}

      {/* 展开面板 */}
      {open && (
        <div className="txzz-candy-interactive fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* 背景遮罩 */}
          <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={closePanel} />

          {/* 面板主体 */}
          <div className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:w-[720px] sm:max-w-full bg-white/96 backdrop-blur-xl rounded-none sm:rounded-3xl shadow-2xl flex flex-col sm:flex-row overflow-hidden border border-pink-100/80">

            {/* 桌面端左侧导航栏 */}
            <aside className="hidden sm:flex flex-col w-20 bg-gradient-to-b from-pink-400 via-rose-400 to-purple-600 py-5 items-center gap-1 shrink-0">
              {/* Logo 区域 */}
              <div className="w-12 h-12 rounded-2xl bg-white/25 backdrop-blur flex items-center justify-center mb-2 shadow-inner">
                <span className="text-white text-xl font-bold">志</span>
              </div>
              <span className="text-white/70 text-[9px] font-medium mb-3">v2.2.0</span>

              {navItems.map((item) => {
                const active = page === item.id;
                const hasBadge = item.id === "downloads" && activeDownloads > 0;
                return (
                  <button
                    key={item.id}
                    onClick={() => setPage(item.id)}
                    className={`relative w-14 flex flex-col items-center gap-1 py-2.5 rounded-2xl transition-all duration-150 ${active ? "bg-white/25 shadow-inner" : "hover:bg-white/12 active:bg-white/20"}`}
                  >
                    <item.icon size={20} className="text-white" />
                    <span className="text-[9px] text-white font-medium">{item.label}</span>
                    {hasBadge && (
                      <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-orange-400 border border-white/80 flex items-center justify-center text-[8px] text-white font-bold">
                        {activeDownloads}
                      </span>
                    )}
                  </button>
                );
              })}

              <button
                onClick={closePanel}
                className="mt-auto w-10 h-10 rounded-full bg-white/15 hover:bg-white/28 active:bg-white/35 flex items-center justify-center transition-all"
                title="关闭面板 (Esc)"
              >
                <X size={16} className="text-white" />
              </button>
            </aside>

            {/* 右侧主内容区域 */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {/* 顶部 Header */}
              <header className="flex items-center justify-between px-4 py-3 border-b border-pink-100 shrink-0 bg-white/85">
                <div className="flex items-center gap-2.5">
                  <div className="sm:hidden w-8 h-8 rounded-xl bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">志</span>
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-purple-800">{pageTitles[page]}</h1>
                    <p className="text-[10px] text-purple-400 hidden sm:block">糖心志者控制台 · v2.2.0</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* 更新状态指示器（桌面端） */}
                  {showUpdateBanner && (
                    <button
                      onClick={() => setPage("settings")}
                      className={`hidden sm:flex items-center gap-1.5 border rounded-full px-3 py-1 text-[11px] transition-colors ${
                        updateAvailable
                          ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100"
                          : "bg-pink-50 border-pink-100 text-purple-400 hover:bg-pink-100"
                      }`}
                    >
                      {updateAvailable ? <Bell size={11} /> : <Zap size={11} />}
                      <span>{updateAvailable ? "有新版本可用" : "版本最新"}</span>
                    </button>
                  )}
                  {/* 项目主页按钮 */}
                  <button
                    onClick={() => action("about")}
                    className="rounded-full p-1.5 text-purple-400 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                    title="打开项目主页"
                  >
                    <Info size={16} />
                  </button>
                  {/* 移动端关闭按钮 */}
                  <button
                    onClick={closePanel}
                    className="rounded-full p-1.5 text-purple-400 hover:bg-pink-50 sm:hidden"
                  >
                    <X size={16} />
                  </button>
                </div>
              </header>

              {/* 移动端更新横幅 */}
              {showUpdateBanner && updateAvailable && (
                <div className="flex shrink-0 items-center gap-2 border-b border-amber-100 bg-amber-50 px-4 py-2 text-[11px] text-amber-600 sm:hidden">
                  <Bell size={11} className="shrink-0" />
                  <button className="flex-1 text-left" onClick={() => setPage("settings")}>
                    发现新版本，点击前往设置页下载
                  </button>
                  <button onClick={() => setShowUpdateBanner(false)} className="ml-1 p-0.5 rounded hover:bg-amber-100">
                    <X size={12} />
                  </button>
                </div>
              )}

              {/* 页面内容区 */}
              <main className="flex-1 overflow-y-auto overscroll-contain">
                {renderPage()}
              </main>

              {/* 移动端底部导航栏 */}
              <nav className="flex shrink-0 items-center border-t border-pink-100 bg-white/92 sm:hidden">
                {navItems.map((item) => {
                  const active = page === item.id;
                  const hasBadge = item.id === "downloads" && activeDownloads > 0;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setPage(item.id)}
                      className={`relative flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-all ${active ? "text-pink-500" : "text-purple-300"}`}
                    >
                      <div className={`rounded-xl p-1.5 transition-all ${active ? "bg-gradient-to-br from-pink-400 to-purple-500 shadow-md" : ""}`}>
                        <item.icon size={18} className={active ? "text-white" : ""} />
                      </div>
                      <span className="text-[9px] font-medium">{item.label}</span>
                      {hasBadge && (
                        <span className="absolute top-2 right-2 w-3 h-3 rounded-full bg-orange-400 border border-white" />
                      )}
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
