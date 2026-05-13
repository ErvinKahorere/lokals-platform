import { useDashboardRealtimeState } from '../../lib/dashboardRealtime'

function formatTimestamp(value?: number | null) {
  if (!value) return 'Never'
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(value)
}

export function DashboardRealtimeDiagnostics() {
  const realtime = useDashboardRealtimeState()

  return (
    <aside className="fixed bottom-4 right-4 z-40 w-[320px] rounded-[24px] border border-white/70 bg-slate-950/92 p-4 text-white shadow-2xl backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">Realtime diagnostics</p>
          <p className="mt-1 text-sm font-semibold text-white">Dashboard sync</p>
        </div>
        <span className={`inline-flex h-2.5 w-2.5 rounded-full ${realtime.status === 'live' ? 'bg-emerald-400' : realtime.status === 'polling' ? 'bg-amber-300' : 'bg-slate-400'}`} />
      </div>

      <dl className="mt-4 space-y-2 text-xs text-slate-200">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-400">Connection</dt>
          <dd className="font-medium text-white">{realtime.status}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-400">Polling fallback</dt>
          <dd className="font-medium text-white">{realtime.pollingActive ? 'Active' : 'Inactive'}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-400">Last event</dt>
          <dd className="truncate font-medium text-white">{realtime.lastEvent?.alias ?? 'Waiting'}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-400">Last refresh</dt>
          <dd className="font-medium text-white">{formatTimestamp(realtime.lastRefreshAt ?? realtime.updatedAt)}</dd>
        </div>
      </dl>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">Subscribed channels</p>
        <ul className="mt-2 space-y-1 text-xs text-slate-100">
          {realtime.subscribedChannels.length > 0 ? (
            realtime.subscribedChannels.map((channel) => <li key={channel} className="truncate">{channel}</li>)
          ) : (
            <li className="text-slate-400">No live channels</li>
          )}
        </ul>
      </div>
    </aside>
  )
}
