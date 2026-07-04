import { useState } from "react";
import { AlertTriangle, CheckCircle, Download, ExternalLink, Info, Package, Radio, RefreshCw, Sparkles, Trash2, X } from "lucide-react";
import type { BridgeState } from "../types";

type Props = { state: BridgeState; onAction: (action: string, payload?: Record<string, unknown>) => void; };

const cacheItems = ["插件本地账号池缓存","远程账号池摘要缓存","播放状态缓存","下载任务缓存","页面监听运行缓存","旧版本默认配置"];

async function pingWorker(baseUrl: string): Promise<{ ok: boolean; text: string }> {
  const url = `${String(baseUrl || "").replace(/\/+$/, "")}/v1/health`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data?.ok) return { ok: true, text: `在线 · 服务正常 (${data.build || "—"})` };
    return { ok: false, text: `HTTP ${res.status}，服务异常` };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, text: `连接失败：${msg.slice(0, 60)}` };
  }
}

export function SettingsPage({ state, onAction }: Props) {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [cacheChecked, setCacheChecked] = useState(cacheItems.map((_, i) => i !== 3));
  const [pingStatus, setPingStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [pinging, setPinging] = useState(false);

  const checkUpdate = () => {
    setCheckingUpdate(true);
    onAction("check-update");
    window.setTimeout(() => { setCheckingUpdate(false); setShowUpdateModal(true); }, 1400);
  };

  const checkWorkerHealth = async () => {
    const url = state.remote?.baseUrl || "";
    if (!url) { setPingStatus({ ok: false, text: "请先在账号池页面配置 Worker URL" }); return; }
    setPinging(true); setPingStatus(null);
    const result = await pingWorker(url);
    setPingStatus(result); setPinging(false);
  };

  const updateAvailable = Boolean(state.repositoryUpdate?.updateAvailable);

  return (
    <div className="space-y-4 p-4">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-400 via-rose-400 to-purple-500 p-4 text-white shadow-lg">
        <div className="absolute right-3 top-2 select-none text-5xl opacity-15 pointer-events-none">🍭</div>
        <div className="mb-2 flex items-center gap-2"><Package size={18} /><span className="font-bold">糖心志者</span></div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[{ label: "版本", value: "v2.2.0" }, { label: "Manifest", value: "V3" }, { label: "mux.js", value: "7.0.0" }, { label: "React", value: "18 + TSX" }].map((item) => (
            <div key={item.label} className="rounded-xl bg-white/20 px-3 py-1.5 backdrop-blur">
              <p className="text-[10px] opacity-70">{item.label}</p>
              <p className="font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-pink-100 bg-white p-4 shadow-sm">
        <h3 className="flex items-center gap-1.5 text-sm font-bold text-purple-700"><Radio size={14} className="text-sky-400" /> Worker 连接检测</h3>
        <p className="text-xs text-purple-400">检测 Worker 端点 <code className="rounded bg-purple-50 px-1 py-0.5 font-mono text-[10px] text-purple-600">/v1/health</code> 的响应情况。</p>
        {pingStatus && (
          <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs ${pingStatus.ok ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
            {pingStatus.ok ? <CheckCircle size={13} className="shrink-0" /> : <AlertTriangle size={13} className="shrink-0" />}
            <span>{pingStatus.text}</span>
          </div>
        )}
        {state.remote?.baseUrl && <p className="truncate text-[10px] text-purple-300 font-mono">{state.remote.baseUrl}</p>}
        <button onClick={checkWorkerHealth} disabled={pinging} className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 py-2 text-xs font-medium text-white shadow-sm transition-all active:scale-95 disabled:opacity-70">
          {pinging ? <><RefreshCw size={13} className="animate-spin" /> 检测中…</> : <><Radio size={13} /> 检测 Worker 连接</>}
        </button>
      </div>

      <div className="rounded-2xl border border-pink-100 bg-white p-4 shadow-sm">
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-purple-700"><Sparkles size={14} className="text-pink-400" /> 展示覆盖</h3>
        <p className="mb-3 text-xs text-purple-400">{state.displayPatchApplied ? "展示覆盖已应用，VIP 永久有效、余额 999、永久尤物圈已生效。" : "尚未应用展示覆盖，点击下方按钮立即应用。"}</p>
        <button onClick={() => onAction("apply")} className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium text-white shadow-sm transition-all active:scale-95 ${state.displayPatchApplied ? "bg-gradient-to-r from-emerald-400 to-teal-500" : "bg-gradient-to-r from-pink-400 to-rose-500"}`}>
          <Sparkles size={13} />{state.displayPatchApplied ? "重新应用展示覆盖" : "立即应用展示覆盖"}
        </button>
      </div>

      <div className="space-y-3 rounded-2xl border border-pink-100 bg-white p-4 shadow-sm">
        <h3 className="flex items-center gap-1.5 text-sm font-bold text-purple-700"><RefreshCw size={14} className="text-sky-400" /> 更新管理</h3>
        <p className="text-xs text-purple-400">{updateAvailable ? `发现新版本：${state.repositoryUpdate?.remote?.version || "远程版本"}` : "当前版本 v2.2.0 已是最新。"}</p>
        <div className="flex gap-2">
          <button onClick={checkUpdate} disabled={checkingUpdate} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 py-2 text-xs font-medium text-white shadow-sm transition-all active:scale-95 disabled:opacity-70">
            {checkingUpdate ? <><RefreshCw size={13} className="animate-spin" /> 检查中…</> : <><RefreshCw size={13} /> 检查更新</>}
          </button>
          <button onClick={() => onAction("download-latest")} className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-purple-200 py-2 text-xs font-medium text-purple-500 transition-transform active:scale-95">
            <Download size={13} /> 下载最新版
          </button>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-pink-100 bg-white p-4 shadow-sm">
        <h3 className="flex items-center gap-1.5 text-sm font-bold text-purple-700"><Trash2 size={14} className="text-rose-400" /> 清除数据缓存</h3>
        <p className="text-xs text-purple-400">覆盖安装后如出现旧账号、旧配置残留，可在此清除。</p>
        <div className="space-y-2">
          {cacheItems.map((item, index) => (
            <label key={item} className="flex cursor-pointer items-center gap-2 select-none">
              <div onClick={() => setCacheChecked((prev) => prev.map((v, i) => i === index ? !v : v))} className={`flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border-2 transition-all ${cacheChecked[index] ? "border-transparent bg-gradient-to-br from-pink-400 to-purple-500" : "border-purple-200 bg-white"}`}>
                {cacheChecked[index] && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
              </div>
              <span className="text-xs text-purple-700">{item}</span>
            </label>
          ))}
        </div>
        <button onClick={() => setShowClearConfirm(true)} className="flex w-full items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 py-2 text-xs font-medium text-white shadow-sm transition-transform active:scale-95">
          <Trash2 size={13} /> 清除选中缓存
        </button>
      </div>

      <div className="rounded-2xl border border-pink-100 bg-white p-4 shadow-sm">
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-purple-700"><Info size={14} className="text-purple-400" /> 关于项目</h3>
        <p className="mb-3 text-xs text-purple-400">糖心志者 v2.2.0 是一个 Chrome Manifest V3 浏览器插件，提供账号池管理、展示覆盖、播放资源获取、视频下载等功能。</p>
        <button onClick={() => onAction("about")} className="flex w-full items-center justify-center gap-1 rounded-xl border border-purple-200 py-2 text-xs font-medium text-purple-500 transition-transform active:scale-95">
          <ExternalLink size={13} /> 打开项目主页
        </button>
      </div>

      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${updateAvailable ? "bg-gradient-to-br from-amber-400 to-orange-500" : "bg-gradient-to-br from-emerald-400 to-sky-500"}`}>
                  {updateAvailable ? <Download size={16} className="text-white" /> : <CheckCircle size={16} className="text-white" />}
                </div>
                <h3 className="font-bold text-purple-800">{updateAvailable ? "发现新版本" : "已是最新版本"}</h3>
              </div>
              <button onClick={() => setShowUpdateModal(false)}><X size={18} className="text-purple-400" /></button>
            </div>
            <p className="mb-4 text-xs text-purple-400">{updateAvailable ? `远程版本 ${state.repositoryUpdate?.remote?.version || "未知"}，点击下载最新版。` : "当前版本 v2.2.0 已是最新，无需更新。"}</p>
            <button onClick={() => setShowUpdateModal(false)} className="w-full rounded-xl bg-gradient-to-r from-pink-400 to-purple-500 py-2 text-sm font-medium text-white shadow-md">好的</button>
          </div>
        </div>
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500">
                <AlertTriangle size={16} className="text-white" />
              </div>
              <h3 className="font-bold text-purple-800">确认清除缓存？</h3>
            </div>
            <p className="mb-4 text-xs text-purple-400">清除后需要重新同步账号池，建议操作后刷新页面。</p>
            <div className="flex gap-2">
              <button onClick={() => setShowClearConfirm(false)} className="flex-1 rounded-xl border border-pink-200 py-2 text-sm font-medium text-purple-500">取消</button>
              <button onClick={() => { onAction("clear-cache"); setShowClearConfirm(false); }} className="flex-1 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 py-2 text-sm font-medium text-white shadow-md">确认清除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
