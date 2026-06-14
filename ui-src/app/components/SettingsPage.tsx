import { useState } from "react";
import { AlertTriangle, CheckCircle, Download, ExternalLink, Info, Package, RefreshCw, Trash2, X } from "lucide-react";
import type { BridgeState } from "../types";

type Props = {
  state: BridgeState;
  onAction: (action: string, payload?: Record<string, unknown>) => void;
};

const cacheItems = [
  "插件本地账号池缓存",
  "远程账号池摘要缓存",
  "播放状态缓存",
  "下载任务缓存",
  "页面监听运行缓存",
  "旧版本默认配置"
];

export function SettingsPage({ state, onAction }: Props) {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [cacheChecked, setCacheChecked] = useState(cacheItems.map((_, index) => index !== 3));

  const checkUpdate = () => {
    setCheckingUpdate(true);
    onAction("check-update");
    window.setTimeout(() => {
      setCheckingUpdate(false);
      setShowUpdateModal(true);
    }, 1200);
  };

  const updateAvailable = Boolean(state.repositoryUpdate?.updateAvailable);

  return (
    <div className="space-y-4 p-4">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-400 via-rose-400 to-purple-500 p-4 text-white shadow-lg">
        <div className="absolute right-3 top-2 select-none text-5xl opacity-20">🍭</div>
        <div className="mb-2 flex items-center gap-2">
          <Package size={18} />
          <span className="font-bold">糖心志者</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { label: "版本", value: "v2.1.3" },
            { label: "Manifest", value: "V3" },
            { label: "mux.js", value: "7.0.0" },
            { label: "界面", value: "Figma Make" }
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-white/20 px-3 py-1.5 backdrop-blur">
              <p className="text-[10px] opacity-75">{item.label}</p>
              <p className="font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-pink-100 bg-white p-4 shadow-sm">
        <h3 className="flex items-center gap-1.5 text-sm font-bold text-purple-700">
          <RefreshCw size={14} className="text-sky-400" /> 更新管理
        </h3>
        <p className="text-xs text-purple-400">
          {updateAvailable ? `发现新版本：${state.repositoryUpdate?.remote?.version || "远程版本"}` : "当前版本已是最新。插件会在启动时静默检查远程版本清单。"}
        </p>
        <div className="flex gap-2">
          <button
            onClick={checkUpdate}
            disabled={checkingUpdate}
            className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 py-2 text-xs font-medium text-white shadow-sm transition-all active:scale-95 disabled:opacity-70"
          >
            {checkingUpdate ? <><RefreshCw size={13} className="animate-spin" /> 检查中...</> : <><RefreshCw size={13} /> 检查更新</>}
          </button>
          <button onClick={() => onAction("download-latest")} className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-purple-200 py-2 text-xs font-medium text-purple-500 transition-transform active:scale-95">
            <Download size={13} /> 下载最新版
          </button>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-pink-100 bg-white p-4 shadow-sm">
        <h3 className="flex items-center gap-1.5 text-sm font-bold text-purple-700">
          <Trash2 size={14} className="text-rose-400" /> 清除数据缓存
        </h3>
        <p className="text-xs text-purple-400">覆盖安装后如出现旧账号、旧播放详情或旧配置残留，可在此清除。</p>
        <div className="space-y-2">
          {cacheItems.map((item, index) => (
            <label key={item} className="flex cursor-pointer items-center gap-2">
              <div
                onClick={() => setCacheChecked((prev) => prev.map((value, current) => current === index ? !value : value))}
                className={`flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border-2 transition-all ${cacheChecked[index] ? "border-transparent bg-gradient-to-br from-pink-400 to-purple-500" : "border-purple-200 bg-white"}`}
              >
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
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-purple-700">
          <Info size={14} className="text-purple-400" /> 关于项目
        </h3>
        <p className="mb-3 text-xs text-purple-400">糖心志者是一个 Chrome Manifest V3 浏览器插件，用于账号池管理、播放状态展示、视频下载、版本更新和缓存清理。</p>
        <button onClick={() => onAction("about")} className="flex w-full items-center justify-center gap-1 rounded-xl border border-purple-200 py-2 text-xs font-medium text-purple-500 transition-transform active:scale-95">
          <ExternalLink size={13} /> 打开项目主页
        </button>
      </div>

      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-sky-500">
                  <CheckCircle size={16} className="text-white" />
                </div>
                <h3 className="font-bold text-purple-800">{updateAvailable ? "发现新版本" : "已是最新版本"}</h3>
              </div>
              <button onClick={() => setShowUpdateModal(false)}><X size={18} className="text-purple-400" /></button>
            </div>
            <p className="mb-4 text-xs text-purple-400">{updateAvailable ? "可以点击下载最新版获取远程更新包。" : "当前版本 v2.1.3 已是最新，无需更新。"}</p>
            <button onClick={() => setShowUpdateModal(false)} className="w-full rounded-xl bg-gradient-to-r from-pink-400 to-purple-500 py-2 text-sm font-medium text-white shadow-md">
              好的
            </button>
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
            <p className="mb-4 text-xs text-purple-400">清除后需要重新配置账号池。建议清除后刷新页面。</p>
            <div className="flex gap-2">
              <button onClick={() => setShowClearConfirm(false)} className="flex-1 rounded-xl border border-pink-200 py-2 text-sm font-medium text-purple-500">
                取消
              </button>
              <button onClick={() => { onAction("clear-cache"); setShowClearConfirm(false); }} className="flex-1 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 py-2 text-sm font-medium text-white shadow-md">
                确认清除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
