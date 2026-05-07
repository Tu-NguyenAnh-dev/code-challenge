/** @format */

import React, { useState, useRef, useMemo, useEffect } from "react"
import { Token } from "../types"
import { ChevronDown, Search } from "lucide-react"
import { useOutsideClick } from "../hooks/useOutsideClick"

interface TokenSelectorProps {
  tokens: Token[]
  selectedToken: Token | null
  onSelectToken: (token: Token) => void
  disabled?: boolean
}

const TokenImage: React.FC<{ token: Token; sizeClass?: string }> = ({ token, sizeClass = "w-6 h-6" }) => {
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    setImgError(false)
  }, [token.iconUrl])

  if (imgError || !token.iconUrl) {
    return (
      <div className={`${sizeClass} bg-slate-200 rounded-full flex items-center justify-center text-slate-700 text-xs font-semibold`}>
        {token.currency.substring(0, 2).toUpperCase()}
      </div>
    )
  }

  return <img src={token.iconUrl} alt={token.currency} className={`${sizeClass} rounded-full`} onError={() => setImgError(true)} />
}

export const TokenSelector: React.FC<TokenSelectorProps> = ({ tokens, selectedToken, onSelectToken, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  useOutsideClick(dropdownRef, () => {
    if (isOpen) {
      setIsOpen(false)
      setSearchTerm("")
    }
  })

  const filteredTokens = useMemo(() => {
    if (!searchTerm) return tokens
    return tokens.filter((token) => token.currency.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [tokens, searchTerm])

  const handleTokenSelect = (token: Token) => {
    onSelectToken(token)
    setIsOpen(false)
    setSearchTerm("")
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 transition-colors ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {selectedToken ? (
          <div className="flex items-center space-x-2">
            <TokenImage token={selectedToken} />
            <span>{selectedToken.currency}</span>
          </div>
        ) : (
          <span className="text-slate-500">Select Token</span>
        )}
        <ChevronDown className={`w-5 h-5 text-slate-500 transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          <div className="p-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search token..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 pl-8 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200 placeholder-slate-400"
              />
              <Search className="absolute w-4 h-4 text-slate-400 top-1/2 left-2.5 transform -translate-y-1/2" />
            </div>
          </div>
          <ul className="py-1">
            {filteredTokens.length > 0 ? (
              filteredTokens.map((token) => (
                <li
                  key={token.currency}
                  onClick={() => handleTokenSelect(token)}
                  className="flex items-center px-3 py-2 text-sm text-slate-900 hover:bg-slate-50 cursor-pointer space-x-2"
                >
                  <TokenImage token={token} />
                  <span>{token.currency}</span>
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-sm text-center text-slate-500">No tokens found.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
