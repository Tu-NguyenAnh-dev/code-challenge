/** @format */

import { TOKEN_PRICES_URL, TOKEN_ICON_BASE_URL } from "../constants"
import { ApiTokenPriceInfo, Token } from "../types"

export const fetchTokensWithPrices = async (): Promise<Token[]> => {
  const response = await fetch(TOKEN_PRICES_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch token prices: ${response.statusText}`)
  }

  const data: ApiTokenPriceInfo[] = await response.json()

  return data
    .filter((token) => typeof token.price === "number" && token.price > 0 && token.currency)
    .map((tokenInfo) => ({
      currency: tokenInfo.currency,
      price: tokenInfo.price,
      iconUrl: `${TOKEN_ICON_BASE_URL}/${tokenInfo.currency.toUpperCase()}.svg`,
    }))
    .sort((a, b) => a.currency.localeCompare(b.currency))
}
