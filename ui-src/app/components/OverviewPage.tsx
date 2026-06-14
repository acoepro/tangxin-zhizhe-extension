import { AlertCircle, CheckCircle, Clock, Download, Play, RefreshCw, Star, TrendingUp, Zap } from "lucide-react";
import type { BridgeState, Page } from "../types";
import { accountName, downloadStats, downloadTasks, flowItemText, latestFullDetail, selectedAccount, shortTime } from "../helpers";

type Props = {
  state: BridgeState;
  onAction: (action: string, payload?: Record<string, unknown>) => void;
  onPage: (page: Page) => void;
};

export function OverviewPage({ state, onAction, onPage }: Props) {
  const tasks = downloadTasks(state);
  const stats = downloadStats(tasks);
  const latest = latestFullDetail(state);
  const selected = selectedAccount(state);
  const flow = (state.flow || []).slice(-5).reverse();

  const statusItems = [
    { label: "会员状态", value: state.displayPatchApplied ? "VIP 有效" : "待应用", ok: Boolean(state.displayPatchApplied) },
    { label: "扩展运行", value: state.session?.hasToken ? "正常" : "等待会话", ok: Boolean(state.session?.hasToken) },
    { label: "账号池", value: `${state.accountPool?.length || 0} 个可用`, ok: Boolean(state.accountPool?.length) },
    { label: "播放服务", value: latest ? "就绪" : "等待记录", ok: Boolean(latest) }
  ];

  const quickActions = [
    { icon: RefreshCw, label: "同步账号池", color: "from-pink-400 to-rose-400", run: () => onAction("sync-remote") },
    { icon: Play, label: "查看播放", color: "from-purple-400 to-violet-400", run: () => onPage("playback") },
    { icon: Download, label: "下载管理", color: "from-sky-400 to-blue-400", run: () => onPage("downloads") },
    { icon: Zap, label: "清理缓存", color: "from-amber-400 to-orange-400", run: () => onAction("clear-cache") }
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-pink-400 via-purple-400 to-violet-500 p-5 text-white shadow-lg">
        <div className="absolute right-4 top-2 select-none text-6xl opacity-20">🍭</div>
        <div className="absolute bottom-2 right-16 select-none text-4xl opacity-15">🍬</div>
        <p className="mb-1 text-xs font-medium opacity-80">糖心志者控制台</p>
        <h2 className="mb-1 text-xl font-bold">你好，欢迎回来 👋</h2>
        <p className="text-xs opacity-75">{state.session?.nickname || state.session?.userId || "等待读取当前页面会话"} · 当前版本 v2.1.3</p>
        <div className="mt-3 flex gap-3 text-xs">
          <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur">账号 {state.accountPool?.length || 0} 个</span>
          <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur">下载 {stats.total} 个</span>
          <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur">播放记录 {state.fullDetails?.length || 0}</span>
        </div>
      </div>

      <div>
        <h3 className="mb-2 flex items-center gap-1 text-sm font-bold text-purple-700">
          <Star size={14} className="text-pink-500" /> 当前状态
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {statusItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2 rounded-2xl border border-pink-100 bg-white p-3 shadow-sm">
              {item.ok ? <CheckCircle size={16} className="shrink-0 text-emerald-400" /> : <AlertCircle size={16} className="shrink-0 text-rose-400" />}
              <div className="min-w-0">
                <p className="text-[10px] text-purple-400">{item.label}</p>
                <p className="truncate text-xs font-semibold text-purple-800">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 flex items-center gap-1 text-sm font-bold text-purple-700">
          <Zap size={14} className="text-amber-500" /> 快捷操作
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((item) => (
            <button key={item.label} onClick={item.run} className={`bg-gradient-to-br ${item.color} rounded-2xl p-3 flex flex-col items-center gap-1.5 text-white shadow-md active:scale-95 transition-transform`}>
              <item.icon size={20} />
              <span className="text-center text-[10px] font-medium leading-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 flex items-center gap-1 text-sm font-bold text-purple-700">
          <TrendingUp size={14} className="text-sky-500" /> 最近流程
        </h3>
        <div className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm">
          {flow.length ? flow.map((item, index) => (
            <div key={`${item.title}-${item.ts}-${index}`} className={`flex items-start gap-2 px-3 py-2.5 ${index < flow.length - 1 ? "border-b border-pink-50" : ""}`}>
              <Clock size={12} className="mt-0.5 shrink-0 text-purple-300" />
              <span className="shrink-0 pt-0.5 text-[10px] text-purple-300">{shortTime(item.ts)}</span>
              <span className="text-xs leading-relaxed text-purple-700">{flowItemText(item)}</span>
            </div>
          )) : (
            <div className="px-3 py-4 text-xs text-purple-400">等待页面操作、账号池轮换和下载进度。</div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-pink-100 bg-white p-3 text-xs text-purple-500 shadow-sm">
        当前账号：{selected ? accountName(selected) : state.session?.nickname || "未选择账号池账号"}
      </div>
    </div>
  );
}
