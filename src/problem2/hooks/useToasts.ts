/** @format */

import { useCallback, useMemo, useRef, useState } from "react"

export type ToastKind = "success" | "error" | "info"

export type Toast = {
  id: string
  kind: ToastKind
  title: string
  message?: string
}

const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

export const useToasts = (opts?: { max?: number; ttlMs?: number }) => {
  const max = opts?.max ?? 3
  const ttlMs = opts?.ttlMs ?? 3500

  const [toasts, setToasts] = useState<Toast[]>([])
  const timersRef = useRef<Map<string, number>>(new Map())

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timersRef.current.get(id)
    if (timer) {
      window.clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }, [])

  const push = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = uid()
      setToasts((prev) => [{ id, ...toast }, ...prev].slice(0, max))
      const timer = window.setTimeout(() => remove(id), ttlMs)
      timersRef.current.set(id, timer)
      return id
    },
    [max, ttlMs, remove]
  )

  return useMemo(() => ({ toasts, push, remove }), [toasts, push, remove])
}

