/** @format */

import React, { useMemo, useState } from "react"
import type { Token } from "../types"

export type SwapSnapshot = {
  fromToken: Token
  toToken: Token
  fromAmount: string
  toAmount: string
}

type Props = {
  open: boolean
  onClose: () => void
  onConfirm: (snapshot: SwapSnapshot) => void
  isConfirming: boolean
  snapshot: SwapSnapshot | null
  exchangeRateText: string | null
  feeRate: number
}

const formatPct = (value: number) => `${(value * 100).toFixed(2)}%`

export const ConfirmSwapModal: React.FC<Props> = ({ open, onClose, onConfirm, isConfirming, snapshot, exchangeRateText, feeRate }) => {
  const [slippagePct, setSlippagePct] = useState<string>("0.50")

  const slippage = useMemo(() => {
    const v = Number(slippagePct)
    if (!Number.isFinite(v) || v < 0 || v > 50) return 0.005
    return v / 100
  }, [slippagePct])

  const minReceivedText = useMemo(() => {
    if (!snapshot) return "-"
    const to = Number(snapshot.toAmount)
    if (!Number.isFinite(to) || to <= 0) return "-"
    const afterFee = to * (1 - feeRate)
    const min = afterFee * (1 - slippage)
    return `${min.toFixed(6)} ${snapshot.toToken.currency}`
  }, [snapshot, feeRate, slippage])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Close modal" />
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-slate-900">Confirm swap</div>
              <div className="mt-0.5 text-xs text-slate-600">Review rate, fee, and minimum received.</div>
            </div>
            <button type="button" onClick={onClose} className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
              Close
            </button>
          </div>

          {snapshot ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <div className="text-slate-600">You pay</div>
                <div className="font-semibold text-slate-900">
                  {snapshot.fromAmount} {snapshot.fromToken.currency}
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <div className="text-slate-600">You receive (est.)</div>
                <div className="font-semibold text-slate-900">
                  {snapshot.toAmount} {snapshot.toToken.currency}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">Missing swap details.</div>
          )}

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <div>Rate</div>
              <div className="font-semibold text-slate-900">
                {snapshot && exchangeRateText ? `1 ${snapshot.fromToken.currency} ≈ ${exchangeRateText} ${snapshot.toToken.currency}` : "-"}
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
              <div>Fee</div>
              <div className="font-semibold text-slate-900">{formatPct(feeRate)}</div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-600">Slippage</div>
              <div className="flex items-center gap-2">
                <input
                  value={slippagePct}
                  onChange={(e) => setSlippagePct(e.target.value)}
                  inputMode="decimal"
                  className="h-9 w-20 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  aria-label="Slippage percent"
                />
                <span className="text-xs font-semibold text-slate-600">%</span>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
              <div>Minimum received</div>
              <div className="font-semibold text-slate-900">{minReceivedText}</div>
            </div>
          </div>

          <button
            type="button"
            disabled={!snapshot || isConfirming}
            onClick={() => snapshot && onConfirm(snapshot)}
            className="mt-5 w-full rounded-2xl bg-sky-600 py-3 text-sm font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isConfirming ? "Confirming..." : "Confirm swap"}
          </button>
        </div>
      </div>
    </div>
  )
}

