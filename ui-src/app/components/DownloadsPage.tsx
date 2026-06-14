import { AlertTriangle, CheckCircle, Download, FolderOpen, Loader, RefreshCw, Save, Trash2, XCircle } from "lucide-react";
import type { BridgeState, DownloadTask } from "../types";
import { canSaveDownload, downloadFormat, downloadProgress, downloadStageLabel, downloadStats, downloadTasks, downloadTitle, formatBytes, shortTime } from "../helpers";

type Props = {
  state: BridgeState;
  onAction: (action: string, payload?: Record<string, unknown>) => void;
};

function taskTone(task: DownloadTask) {
  if (task.stage === "complete" || task.stage === "ready") return { label: downloadStageLabel(task.stage), color: "bg-emerald-100 text-emerald-600", icon: <CheckCircle size={11} /> };
  if (task.stage === "error") return { label: "失败", color: "bg-rose-100 text-rose-600", icon: <XCircle size={11} /> };
  if (task.stage === "playlist" || task.stage === "segments" || task.stage === "segment") return { label: downloadStageLabel(task.stage), color: "bg-amber-100 text-amber-600", icon: <Download size={11} /> };
  return { label: downloadStageLabel(task.stage), color: "bg-sky-100 text-sky-600", icon: <Loader size={11} className="animate-spin" /> };
}

export function DownloadsPage({ state, onAction }: Props) {
  const tasks = downloadTasks(state);
  const stats = downloadStats(tasks);

  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "总任务", value: stats.total, color: "bg-purple-100 text-purple-700" },
          { label: "进行中", value: stats.running, color: "bg-amber-100 text-amber-700" },
          { label: "已完成", value: stats.completed, color: "bg-emerald-100 text-emerald-700" },
          { label: "失败", value: stats.failed, color: "bg-rose-100 text-rose-700" }
        ].map((item) => (
          <div key={item.label} className={`${item.color} rounded-2xl p-2 text-center`}>
            <p className="text-lg font-bold">{item.value}</p>
            <p className="text-[10px] opacity-75">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => onAction("open-download-folder")} className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 px-3 py-2 text-xs text-white shadow-sm transition-transform active:scale-95">
          <FolderOpen size={13} /> 下载目录
        </button>
        <button onClick={() => onAction("refresh-downloads")} className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-purple-400 to-violet-500 px-3 py-2 text-xs text-white shadow-sm transition-transform active:scale-95">
          <RefreshCw size={13} /> 刷新下载
        </button>
        <button onClick={() => onAction("clear-downloads")} className="ml-auto flex items-center gap-1 rounded-xl border border-rose-200 px-3 py-2 text-xs text-rose-500 transition-transform active:scale-95">
          <Trash2 size={13} /> 清空任务
        </button>
      </div>

      <div className="space-y-3">
        {tasks.length ? tasks.map((task) => {
          const tone = taskTone(task);
          const progress = downloadProgress(task);
          return (
            <div key={task.taskId || task.movieId || task.url} className="space-y-2 rounded-2xl border border-pink-100 bg-white p-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-purple-800">{downloadTitle(task)}</p>
                  <p className="mt-0.5 text-[10px] text-purple-300">{task.movieId || task.taskId || "视频任务"}</p>
                </div>
                <span className={`flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] ${tone.color}`}>
                  {tone.icon} {tone.label}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 text-[10px]">
                <span className="rounded-full bg-purple-50 px-2 py-0.5 text-purple-500">{downloadFormat(task)}</span>
                <span className="rounded-full bg-sky-50 px-2 py-0.5 text-sky-500">{formatBytes(task.bytes)}</span>
                <span className="rounded-full bg-gray-50 px-2 py-0.5 text-gray-400">{shortTime(task.updatedAt)}</span>
              </div>

              {task.stage !== "complete" && (
                <div>
                  <div className="mb-1 flex justify-between text-[10px] text-purple-400">
                    <span>{downloadStageLabel(task.stage)}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-pink-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {(task.error || task.transmuxError) && (
                <div className="flex items-start gap-1.5 rounded-xl bg-rose-50 p-2">
                  <AlertTriangle size={11} className="mt-0.5 shrink-0 text-rose-400" />
                  <p className="text-[10px] text-rose-600">{task.error || `MP4 转封装失败，已保留 TS 兜底：${task.transmuxError}`}</p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => onAction("save-download-device", { taskId: task.taskId || "" })}
                  disabled={!canSaveDownload(task)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-pink-400 to-purple-500 py-1.5 text-[11px] font-medium text-white shadow-sm transition-transform active:scale-95 disabled:opacity-50"
                >
                  <Save size={12} /> 保存到设备
                </button>
                <button onClick={() => onAction("remove-download-task", { taskId: task.taskId || "", movieId: task.movieId || "" })} className="flex items-center gap-1 rounded-xl border border-rose-200 px-3 py-1.5 text-[11px] text-rose-400 transition-transform active:scale-95">
                  <Trash2 size={12} /> 删除
                </button>
              </div>
            </div>
          );
        }) : (
          <div className="rounded-2xl border border-pink-100 bg-white p-4 text-xs text-purple-400 shadow-sm">还没有下载任务，进入视频详情页点击下载即可创建。</div>
        )}
      </div>
    </div>
  );
}
