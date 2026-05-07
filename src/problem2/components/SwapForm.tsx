/** @format */

import React, { useEffect, useMemo, useState } from "react"
import { CurrencyPanel } from "./CurrencyPanel"
import { ArrowDownUp, Loader2, Trash2 } from "lucide-react"
import { useSwap } from "../hooks/useSwap"
import { useToasts } from "../hooks/useToasts"
import { ToastStack } from "./ToastStack"
import { ConfirmSwapModal } from "./ConfirmSwapModal"

export const SwapForm: React.FC = () => {
  const { tokens, fromToken, toToken, fromAmount, toAmount, feeRate, history, error, successMessage, isLoadingTokens, isSwapping, exchangeRateText, canSwapCurrencies, canSubmitSwap, actions } =
    useSwap()

  const { toasts, push, remove } = useToasts()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [pendingSnapshot, setPendingSnapshot] = useState<ReturnType<typeof actions.getSwapSnapshot> | null>(null)

  useEffect(() => {
    if (!error) return
    push({ kind: "error", title: "Swap error", message: error })
    actions.dismissMessages()
  }, [error, push, actions])

  useEffect(() => {
    if (!successMessage) return
    push({ kind: "success", title: "Swap completed", message: successMessage })
    actions.dismissMessages()
  }, [successMessage, push, actions])

  const recentHistory = useMemo(() => history.slice(0, 6), [history])

  if (isLoadingTokens) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-slate-600">
        <Loader2 className="w-12 h-12 animate-spin text-sky-600 mb-4" />
        <p>Loading available tokens...</p>
      </div>
    )
  }

  return (
    <>
      <ToastStack toasts={toasts} onDismiss={remove} />

      <ConfirmSwapModal
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={(snapshot) => {
          actions.submitSwap(snapshot)
          setIsConfirmOpen(false)
        }}
        isConfirming={isSwapping}
        snapshot={pendingSnapshot}
        exchangeRateText={exchangeRateText}
        feeRate={feeRate}
      />

      <div className="w-full max-w-md bg-white/85 backdrop-blur-md shadow-2xl rounded-2xl p-6 space-y-5 border border-slate-200">
        <h1 className="text-2xl font-semibold text-center text-slate-900 mb-1">Currency Swap</h1>
        <p className="text-xs text-center text-slate-500">Confirm step + history + toasts</p>

        <CurrencyPanel
          label="You Pay"
          tokens={tokens}
          selectedToken={fromToken}
          onSelectToken={actions.handleFromTokenSelect}
          amount={fromAmount}
          onAmountChange={actions.handleFromAmountChange}
          isAmountReadOnly={false}
          isAmountDisabled={isSwapping}
        />

        <div className="flex justify-center my-[-8px]">
          <button
            onClick={actions.handleSwapCurrencies}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700 transition-all duration-150 shadow-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-300"
            aria-label="Swap currencies"
            disabled={!canSwapCurrencies}
            type="button"
          >
            <ArrowDownUp className="w-5 h-5" />
          </button>
        </div>

        <CurrencyPanel
          label="You Receive (Estimated)"
          tokens={tokens}
          selectedToken={toToken}
          onSelectToken={actions.handleToTokenSelect}
          amount={toAmount}
          onAmountChange={actions.handleToAmountChange}
          isAmountReadOnly={false}
          isAmountDisabled={isSwapping}
        />

        {exchangeRateText && fromToken && toToken && (
          <div className="text-sm text-center text-slate-600 pt-2">
            1 {fromToken.currency} ≈ {exchangeRateText} {toToken.currency}
          </div>
        )}

        <button
          onClick={() => {
            const snap = actions.getSwapSnapshot()
            if (!snap) return
            setPendingSnapshot(snap)
            setIsConfirmOpen(true)
          }}
          disabled={!canSubmitSwap}
          className="w-full flex items-center justify-center bg-sky-600 hover:bg-sky-500 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSwapping ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Swapping...
            </>
          ) : (
            "Swap"
          )}
        </button>

        <div className="pt-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900">Recent swaps</div>
            <button
              type="button"
              onClick={actions.clearHistory}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              aria-label="Clear history"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
          </div>

          <div className="mt-2 space-y-2">
            {recentHistory.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">No swaps yet.</div>
            ) : (
              recentHistory.map((h) => (
                <div key={h.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-900">
                      {h.fromCurrency} → {h.toCurrency}
                    </div>
                    <div className={`text-xs font-semibold ${h.status === "success" ? "text-emerald-600" : "text-rose-600"}`}>{h.status}</div>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-600">
                    <div>
                      {h.fromAmount} {h.fromCurrency} → {h.toAmount} {h.toCurrency}
                    </div>
                    <div>{new Date(h.timeMs).toLocaleString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500 text-center pt-1">Quotes are for demonstration purposes.</p>
      </div>
    </>
  )
}
