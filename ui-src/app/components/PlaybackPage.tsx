import { AlertCircle, CheckCircle, Clock, Download, Film, Layers, Wifi } from "lucide-react";
import type { BridgeState } from "../types";
import { latestFullDetail, localizeFlowText, shortTime } from "../helpers";

type Props = {
  state: BridgeState;
  onAction: (action: string, payload?: Record<string, unknown>) => void;
};

export function PlaybackPage({ state, onAction }: Props) {
  const latest = latestFullDetail(state);
  const records = (state.fullDetails || []).slice(-24).reverse();
  const segmentTotal = latest?.fullStat?.segments || 0;

  return (
    <div className="space-y-4 p-4">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-400 to-violet-500 p-4 text-white shadow-lg">
        <div className="absolute right-3 top-2 select-none text-5xl opacity-20">🎬</div>
        <p className="mb-1 text-xs opacity-75">最近视频</p>
        <h3 className="mb-2 pr-10 text-sm font-bold">{latest?.movieTitle || latest?.title || latest?.movieId || "等待播放详情"}</h3>
        <div className="flex items-center gap-2 text-xs">
          {latest ? <CheckCircle size={13} className="text-emerald-300" /> : <AlertCircle size={13} className="text-amber-200" />}
          <span className="opacity-90">{latest ? `已获取播放详情 · ${segmentTotal || "?"} 个分片` : "打开视频详情页后会记录完整播放资源"}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] backdrop-blur">M3U8</span>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] backdrop-blur">{latest?.accountLabel || latest?.accountUser || "自动轮换账号"}</span>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] backdrop-blur">{localizeFlowText(latest?.action || "full_detail")}</span>
        </div>
        <button
          onClick={() => onAction("download-full-video", { movieId: latest?.movieId || "" })}
          className="mt-3 flex items-center gap-1.5 rounded-xl bg-white/20 px-4 py-2 text-xs font-medium text-white backdrop-blur transition-all hover:bg-white/30 active:scale-95"
        >
          <Download size={13} /> 下载当前视频
        </button>
      </div>

      <div className="rounded-2xl border border-pink-100 bg-white p-4 shadow-sm">
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-purple-700">
          <Layers size={14} className="text-purple-400" /> 分片统计
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "总分片", value: segmentTotal || "?", color: "text-purple-600", bg: "bg-purple-50" },
            { label: "已就绪", value: segmentTotal || 0, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "失败", value: latest?.fullStat?.error ? 1 : 0, color: "text-rose-600", bg: "bg-rose-50" }
          ].map((item) => (
            <div key={item.label} className={`${item.bg} rounded-xl p-2.5 text-center`}>
              <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
              <p className="text-[10px] text-purple-400">{item.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-[10px] text-purple-400">
            <span>分片进度</span>
            <span>{segmentTotal ? `${segmentTotal} / ${segmentTotal}` : "等待统计"}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-pink-100">
            <div className="h-full rounded-full bg-gradient-to-r from-pink-400 to-purple-500" style={{ width: latest ? "100%" : "8%" }} />
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-purple-700">
          <Film size={14} className="text-pink-400" /> 播放记录
        </h3>
        <div className="space-y-2">
          {records.length ? records.map((item, index) => (
            <div key={`${item.movieId}-${index}`} className="rounded-2xl border border-pink-100 bg-white p-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-purple-800">{item.movieTitle || item.title || item.movieId || "播放详情"}</p>
                  <div className="mt-0.5 flex items-center gap-1">
                    {item.playLink || item.backupLink ? <CheckCircle size={11} className="shrink-0 text-emerald-400" /> : <AlertCircle size={11} className="shrink-0 text-rose-400" />}
                    <p className="truncate text-[10px] text-purple-400">{item.playLink || item.backupLink ? "已获取播放详情" : "播放详情缺少链接"}</p>
                  </div>
                </div>
                <button
                  onClick={() => onAction("download-full-video", { movieId: item.movieId || "" })}
                  className="shrink-0 rounded-xl bg-gradient-to-r from-pink-400 to-purple-500 p-1.5 text-white shadow-sm transition-transform active:scale-95"
                >
                  <Download size={13} />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="flex items-center gap-0.5 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] text-purple-500"><Wifi size={9} /> M3U8</span>
                <span className="flex items-center gap-0.5 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] text-sky-500"><Layers size={9} /> {item.fullStat?.segments || "?"} 分片</span>
                <span className="rounded-full bg-pink-50 px-2 py-0.5 text-[10px] text-pink-500">{item.accountLabel || item.accountUser || "自动账号"}</span>
                <span className="flex items-center gap-0.5 rounded-full bg-gray-50 px-2 py-0.5 text-[10px] text-gray-400"><Clock size={9} /> {shortTime(String((item as { ts?: string }).ts || ""))}</span>
              </div>
            </div>
          )) : (
            <div className="rounded-2xl border border-pink-100 bg-white p-4 text-xs text-purple-400 shadow-sm">还没有播放详情记录。</div>
          )}
        </div>
      </div>
    </div>
  );
}
