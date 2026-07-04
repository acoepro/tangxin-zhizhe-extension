import { AlertCircle, CheckCircle, Clock, Copy, Download, Film, Layers, Link, Timer, Wifi } from "lucide-react";
import type { BridgeState } from "../types";
import { latestFullDetail, localizeFlowText, maskUrl, shortTime } from "../helpers";

type Props = {
  state: BridgeState;
  onAction: (action: string, payload?: Record<string, unknown>) => void;
};

export function PlaybackPage({ state, onAction }: Props) {
  const latest = latestFullDetail(state);
  const records = (state.fullDetails || []).slice(-24).reverse();
  const segmentTotal = latest?.fullStat?.segments || 0;
  const duration = latest?.fullStat?.duration;

  return (
    <div className="space-y-4 p-4">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-400 to-violet-500 p-4 text-white shadow-lg">
        <div className="absolute right-3 top-2 select-none text-5xl opacity-15 pointer-events-none">🎬</div>
        <p className="mb-0.5 text-[10px] opacity-70 uppercase tracking-wider">最近视频</p>
        <h3 className="mb-2 pr-10 text-sm font-bold leading-snug">
          {latest?.movieTitle || latest?.title || latest?.movieId || "等待播放详情"}
        </h3>
        <div className="flex items-center gap-1.5 text-xs mb-3">
          {latest ? <CheckCircle size={12} className="text-emerald-300 shrink-0" /> : <AlertCircle size={12} className="text-amber-200 shrink-0" />}
          <span className="opacity-85">
            {latest
              ? `已获取播放详情 · ${segmentTotal || "?"} 个分片${duration ? ` · ${Math.floor(duration / 60)}分${Math.floor(duration % 60)}秒` : ""}`
              : "打开视频详情页后会记录完整播放资源"}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] backdrop-blur">M3U8</span>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] backdrop-blur">{latest?.accountLabel || latest?.accountUser || "自动轮换账号"}</span>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] backdrop-blur">{localizeFlowText(latest?.action || "full_detail")}</span>
        </div>
        {latest?.playLink && (
          <div className="flex items-center gap-1.5 mb-2 rounded-lg bg-black/20 px-2 py-1.5">
            <Link size={10} className="shrink-0 text-white/60" />
            <span className="flex-1 truncate text-[10px] text-white/80 font-mono">{maskUrl(latest.playLink)}</span>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onAction("download-full-video", { movieId: latest?.movieId || "" })}
            className="flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 active:scale-95 px-3 py-1.5 text-xs font-medium backdrop-blur transition-all"
          >
            <Download size={12} /> 下载视频
          </button>
          {latest?.playLink && (
            <button
              onClick={() => onAction("copy-full-link")}
              className="flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 active:scale-95 px-3 py-1.5 text-xs font-medium backdrop-blur transition-all"
            >
              <Copy size={12} /> 复制播放链接
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-pink-100 bg-white p-4 shadow-sm">
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-purple-700">
          <Layers size={14} className="text-purple-400" /> 分片统计
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "总分片", value: segmentTotal || "—", color: "text-purple-600", bg: "bg-purple-50" },
            { label: "总时长", value: duration ? `${Math.floor(duration / 60)}m${Math.floor(duration % 60)}s` : "—", color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "状态", value: latest?.fullStat?.error ? "异常" : latest ? "正常" : "—", color: latest?.fullStat?.error ? "text-rose-600" : "text-sky-600", bg: latest?.fullStat?.error ? "bg-rose-50" : "bg-sky-50" }
          ].map((item) => (
            <div key={item.label} className={`${item.bg} rounded-xl p-2.5 text-center`}>
              <p className={`text-base font-bold ${item.color}`}>{item.value}</p>
              <p className="text-[10px] text-purple-400 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-[10px] text-purple-400">
            <span>数据完整性</span>
            <span>{segmentTotal ? `${segmentTotal} 个分片` : "等待数据"}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-pink-100">
            <div className="h-full rounded-full bg-gradient-to-r from-purple-400 to-violet-500 transition-all" style={{ width: latest ? "100%" : "6%" }} />
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-purple-700">
            <Film size={14} className="text-pink-400" /> 播放记录
          </h3>
          <span className="text-[10px] text-purple-400">{records.length} 条</span>
        </div>
        <div className="space-y-2">
          {records.length ? records.map((item, index) => (
            <div key={`${item.movieId}-${index}`} className="rounded-2xl border border-pink-100 bg-white p-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-purple-800">{item.movieTitle || item.title || item.movieId || "播放详情"}</p>
                  <div className="mt-0.5 flex items-center gap-1">
                    {item.playLink || item.backupLink ? <CheckCircle size={10} className="shrink-0 text-emerald-400" /> : <AlertCircle size={10} className="shrink-0 text-rose-400" />}
                    <p className="truncate text-[10px] text-purple-400">
                      {item.playLink || item.backupLink ? `已就绪 · ${maskUrl(item.playLink || item.backupLink)}` : "播放详情缺少链接"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onAction("download-full-video", { movieId: item.movieId || "" })}
                  className="shrink-0 rounded-xl bg-gradient-to-r from-pink-400 to-purple-500 p-1.5 text-white shadow-sm transition-transform active:scale-95"
                  title="下载该视频"
                >
                  <Download size={13} />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="flex items-center gap-0.5 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] text-purple-500"><Wifi size={9} /> M3U8</span>
                <span className="flex items-center gap-0.5 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] text-sky-500"><Layers size={9} /> {item.fullStat?.segments || "?"} 分片</span>
                {item.fullStat?.duration && (
                  <span className="flex items-center gap-0.5 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] text-violet-500"><Timer size={9} /> {Math.floor(item.fullStat.duration / 60)}m</span>
                )}
                <span className="rounded-full bg-pink-50 px-2 py-0.5 text-[10px] text-pink-500">{item.accountLabel || item.accountUser || "自动账号"}</span>
                <span className="flex items-center gap-0.5 rounded-full bg-gray-50 px-2 py-0.5 text-[10px] text-gray-400"><Clock size={9} /> {shortTime(String((item as { ts?: string }).ts || ""))}</span>
              </div>
            </div>
          )) : (
            <div className="rounded-2xl border border-pink-100 bg-white p-4 text-xs text-purple-400 shadow-sm">还没有播放详情记录。打开视频详情页后即会自动记录。</div>
          )}
        </div>
      </div>
    </div>
  );
}
