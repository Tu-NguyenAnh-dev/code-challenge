/** @format */

import { useEffect, useMemo, useRef, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { DEFAULT_PRECISION } from "../constants"
import { fetchTokensWithPrices } from "../services/tokenService"
import type { Token } from "../types"

export type SwapDirection = "from" | "to"

type SwapSnapshot = {
  fromToken: Token
  toToken: Token
  fromAmount: string
  toAmount: string
}

const FEE_RATE = 0.003 // 0.30%
const HISTORY_KEY = "swap_history_v1"

export type SwapHistoryItem = {
  id: string
  timeMs: number
  fromCurrency: string
  toCurrency: string
  fromAmount: string
  toAmount: string
  status: "success" | "failed"
}

const isValidPositiveNumberString = (value: string) => {
  if (value === "") return false
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0
}

const formatAmount = (value: number) => {
  if (!Number.isFinite(value)) return ""
  return value.toFixed(DEFAULT_PRECISION)
}

const pickInitialTokens = (tokens: Token[]) => {
  const from = tokens.find((t) => t.currency === "ETH") ?? tokens[0] ?? null
  const to = tokens.find((t) => t.currency === "USD") ?? tokens[1] ?? tokens[0] ?? null
  return { from, to }
}

export const useSwap = () => {
  const tokensQuery = useQuery({
    queryKey: ["tokens", "prices"],
    queryFn: fetchTokensWithPrices,
    staleTime: 60_000,
    retry: 2,
  })

  const tokens = tokensQuery.data ?? []

  const [fromToken, setFromToken] = useState<Token | null>(null)
  const [toToken, setToToken] = useState<Token | null>(null)
  const [direction, setDirection] = useState<SwapDirection>("from")
  const [fromAmount, setFromAmount] = useState<string>("")
  const [toAmount, setToAmount] = useState<string>("")

  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [history, setHistory] = useState<SwapHistoryItem[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as SwapHistoryItem[]
      if (Array.isArray(parsed)) setHistory(parsed)
    } catch {
      // ignore malformed storage
    }
  }, [])

  const persistHistory = (items: SwapHistoryItem[]) => {
    setHistory(items)
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 10)))
    } catch {
      // ignore
    }
  }

  const tokensHydratedRef = useRef(false)
  useEffect(() => {
    if (tokensHydratedRef.current) return
    if (!tokensQuery.isSuccess) return
    if (tokens.length === 0) return

    const initial = pickInitialTokens(tokens)
    setFromToken(initial.from)
    setToToken(initial.to)
    tokensHydratedRef.current = true
  }, [tokensQuery.isSuccess, tokens])

  const exchangeRate = useMemo(() => {
    if (!fromToken || !toToken) return null
    if (fromToken.price <= 0 || toToken.price <= 0) return null
    return fromToken.price / toToken.price
  }, [fromToken, toToken])

  useEffect(() => {
    if (!fromToken || !toToken || !exchangeRate) {
      if (direction === "from") setToAmount("")
      else setFromAmount("")
      return
    }

    if (direction === "from") {
      if (!isValidPositiveNumberString(fromAmount)) {
        setToAmount("")
        return
      }
      setToAmount(formatAmount(Number(fromAmount) * exchangeRate))
      return
    }

    if (!isValidPositiveNumberString(toAmount)) {
      setFromAmount("")
      return
    }
    setFromAmount(formatAmount(Number(toAmount) / exchangeRate))
  }, [direction, fromAmount, toAmount, fromToken, toToken, exchangeRate])

  const handleFromAmountChange = (amount: string) => {
    setDirection("from")
    setFromAmount(amount)
    setError(null)
    setSuccessMessage(null)
  }

  const handleToAmountChange = (amount: string) => {
    setDirection("to")
    setToAmount(amount)
    setError(null)
    setSuccessMessage(null)
  }

  const handleFromTokenSelect = (token: Token) => {
    setError(null)
    setSuccessMessage(null)
    if (token.currency === toToken?.currency) {
      setToToken(fromToken)
    }
    setFromToken(token)
  }

  const handleToTokenSelect = (token: Token) => {
    setError(null)
    setSuccessMessage(null)
    if (token.currency === fromToken?.currency) {
      setFromToken(toToken)
    }
    setToToken(token)
  }

  const handleSwapCurrencies = () => {
    if (!fromToken || !toToken) return
    setError(null)
    setSuccessMessage(null)
    setDirection("from")

    const prevFromToken = fromToken
    const prevToToken = toToken
    const prevFromAmount = fromAmount
    const prevToAmount = toAmount

    setFromToken(prevToToken)
    setToToken(prevFromToken)
    setFromAmount(prevToAmount)
    setToAmount(prevFromAmount)
  }

  const validateInputs = (): SwapSnapshot | null => {
    if (!fromToken || !toToken) {
      setError("Please select both 'From' and 'To' currencies.")
      return null
    }
    if (fromToken.currency === toToken.currency) {
      setError("'From' and 'To' currencies cannot be the same.")
      return null
    }
    if (!isValidPositiveNumberString(fromAmount)) {
      setError("Please enter a valid amount to swap (must be greater than 0).")
      return null
    }
    if (!isValidPositiveNumberString(toAmount)) {
      setError("Please enter a valid receive amount (must be greater than 0).")
      return null
    }
    setError(null)
    return { fromToken, toToken, fromAmount, toAmount }
  }

  const getSwapSnapshot = () => validateInputs()

  const swapMutation = useMutation({
    mutationFn: async (snapshot: SwapSnapshot) => {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      if (Math.random() <= 0.1) {
        throw new Error("Swap failed. Please try again.")
      }
      return snapshot
    },
    onSuccess: (snapshot) => {
      setSuccessMessage(`Successfully swapped ${snapshot.fromAmount} ${snapshot.fromToken.currency} for ${snapshot.toAmount} ${snapshot.toToken.currency}!`)
      const item: SwapHistoryItem = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        timeMs: Date.now(),
        fromCurrency: snapshot.fromToken.currency,
        toCurrency: snapshot.toToken.currency,
        fromAmount: snapshot.fromAmount,
        toAmount: snapshot.toAmount,
        status: "success",
      }
      persistHistory([item, ...history])
    },
    onError: (e, snapshot) => {
      setError(e instanceof Error ? e.message : "Swap failed. Please try again.")
      const item: SwapHistoryItem = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        timeMs: Date.now(),
        fromCurrency: snapshot?.fromToken.currency ?? fromToken?.currency ?? "?",
        toCurrency: snapshot?.toToken.currency ?? toToken?.currency ?? "?",
        fromAmount: snapshot?.fromAmount ?? fromAmount,
        toAmount: snapshot?.toAmount ?? toAmount,
        status: "failed",
      }
      persistHistory([item, ...history])
    },
  })

  const submitSwap = (snapshot: SwapSnapshot) => {
    setError(null)
    setSuccessMessage(null)
    swapMutation.mutate(snapshot)
  }

  const isSwapping = swapMutation.isPending

  const dismissMessages = () => {
    setError(null)
    setSuccessMessage(null)
  }

  const clearHistory = () => persistHistory([])

  return {
    tokens,
    fromToken,
    toToken,
    direction,
    fromAmount,
    toAmount,
    feeRate: FEE_RATE,
    history,
    error: error ?? (tokensQuery.isError ? "Failed to load token prices. Check your connection or try again later." : null),
    successMessage,
    isLoadingTokens: tokensQuery.isLoading,
    isSwapping,
    exchangeRateText:
      exchangeRate && fromToken && toToken ? exchangeRate.toFixed(DEFAULT_PRECISION) : null,
    canSwapCurrencies: Boolean(fromToken && toToken) && !isSwapping && !tokensQuery.isLoading,
    canSubmitSwap:
      Boolean(fromToken && toToken) &&
      !tokensQuery.isLoading &&
      !isSwapping &&
      isValidPositiveNumberString(fromAmount) &&
      isValidPositiveNumberString(toAmount),
    actions: {
      handleFromAmountChange,
      handleToAmountChange,
      handleFromTokenSelect,
      handleToTokenSelect,
      handleSwapCurrencies,
      getSwapSnapshot,
      submitSwap,
      dismissMessages,
      clearHistory,
    },
  }
}

