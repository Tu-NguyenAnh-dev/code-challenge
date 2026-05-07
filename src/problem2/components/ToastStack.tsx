/** @format */

import React from "react"
import type { Toast } from "../hooks/useToasts"

const styles: Record<Toast["kind"], { ring: string; dot: string; title: string }> = {
  success: { ring: "ring-emerald-200", dot: "bg-emerald-500", title: "text-slate-900" },
  error: { ring: "ring-rose-200", dot: "bg-rose-500", title: "text-slate-900" },
  info: { ring: "ring-sky-200", dot: "bg-sky-500", title: "text-slate-900" },
}

export const ToastStack: React.FC<{ toasts: Toast[]; onDismiss: (id: string) => void }> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((t) => {
        const s = styles[t.kind]
        return (
          <div
            key={t.id}
            className={`rounded-2xl bg-white/90 backdrop-blur shadow-lg ring-1 ${s.ring} border border-slate-200 px-4 py-3`}
            role="status"
          >
            <div className="flex items-start gap-3">
              <div className={`mt-1 h-2.5 w-2.5 rounded-full ${s.dot}`} />
              <div className="min-w-0 flex-1">
                <div className={`text-sm font-semibold ${s.title}`}>{t.title}</div>
                {t.message ? <div className="mt-0.5 text-xs text-slate-600">{t.message}</div> : null}
              </div>
              <button
                type="button"
                onClick={() => onDismiss(t.id)}
                className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                aria-label="Dismiss toast"
              >
                ×
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

