# WalletPage Refactor Review

## 1. Missing Type Definition for `blockchain`

* **Problem**: The original `WalletBalance` interface does not include the `blockchain` property, even though it is accessed throughout the component.

```typescript
interface WalletBalance {
  currency: string
  amount: number
}
```

```typescript
balance.blockchain
```

This causes TypeScript inconsistencies and potential runtime issues.

* **Solution**: Add the missing `blockchain` field to the interface.

```typescript
interface WalletBalance {
  blockchain: string
  currency: string
  amount: number
}
```

---

## 2. Using `any` Type in `getPriority`

* **Problem**: The `getPriority` function uses `any`.

```typescript
const getPriority = (blockchain: any): number => {
```

Using `any` removes TypeScript type safety and increases runtime risks.

* **Solution**: Replace `any` with `string`.

```typescript
const getPriority = (blockchain: string): number => {
```

---

## 3. Recreating `getPriority` on Every Render

* **Problem**: The `getPriority` function is declared inside the component, causing it to be recreated on every render.

```typescript
const getPriority = (...) => {
```

* **Impact**:

  * unnecessary function allocation
  * reduced readability
  * harder to maintain

* **Solution**: Move the function outside the component and use a constant lookup map.

```typescript
const PRIORITY_MAP: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
}
```

---

## 4. Incorrect `useMemo` Dependencies

* **Problem**: The `useMemo` dependency array includes `prices`.

```typescript
}, [balances, prices])
```

However, the filtering and sorting logic only depends on `balances`.

* **Impact**:

  * unnecessary recomputation
  * extra renders
  * reduced performance

* **Solution**: Remove `prices` from the dependency array.

```typescript
}, [balances])
```

---

## 5. Undefined Variable in Filter Logic

* **Problem**: `lhsPriority` is used inside the filter callback but is never defined.

```typescript
if (lhsPriority > -99)
```

This is a runtime/compile-time bug.

* **Solution**: Replace it with the correct variable.

```typescript
const balancePriority = getPriority(balance.blockchain)
```

---

## 6. Incorrect Filtering Logic

* **Problem**:

```typescript
if (balance.amount <= 0) {
  return true
}
```

This keeps balances with `0` or negative values.

* **Impact**:

  * incorrect business behavior
  * invalid wallet rows rendered

* **Solution**:

```typescript
balance.amount > 0 &&
getPriority(balance.blockchain) > -99
```

This ensures:

* only valid balances are displayed
* invalid blockchain priorities are excluded

---

## 7. Multiple Iterations and Unnecessary Intermediate Arrays

* **Problem**: The original implementation performs multiple passes over the same dataset:

```txt
balances
  -> filter()
  -> sort()
  -> map() for formattedBalances
  -> map() again for rows
```

Additionally, `formattedBalances` is created but never used.

* **Impact**:

  * unnecessary memory allocation
  * extra CPU usage
  * dead code

* **Solution**: Consolidate transformations into a single optimized flow and use the formatted data directly.

---

## 8. Array Mutation via `sort()`

* **Problem**: JavaScript `sort()` mutates the original array.

```typescript
balances.sort(...)
```

* **Impact**:

  * potential side effects
  * violates React immutability principles

* **Solution**: Clone the array before sorting.

```typescript
[...balances].sort(...)
```

---

## 9. Missing Comparator Fallback

* **Problem**: The original comparator does not return `0` when priorities are equal.

```typescript
if (leftPriority > rightPriority) {
  return -1
} else if (rightPriority > leftPriority) {
  return 1
}
```

This creates unstable sorting behavior.

* **Solution**: Use a numeric comparator.

```typescript
getPriority(b.blockchain) -
getPriority(a.blockchain)
```

---

## 10. Incorrect Type Usage in `rows`

* **Problem**:

```typescript
sortedBalances.map((balance: FormattedWalletBalance)
```

`sortedBalances` does not contain the `formatted` property.

* **Impact**:

  * incorrect typing
  * inconsistent data flow

* **Solution**: Use `formattedBalances` when rendering rows.

---

## 11. Using Array Index as React Key

* **Problem**:

```tsx
key={index}
```

Using array index as key in a dynamically sorted list is a React anti-pattern.

* **Impact**:

  * unstable reconciliation
  * incorrect component reuse
  * unnecessary re-renders

* **Solution**:

```tsx
key={`${balance.blockchain}-${balance.currency}`}
```

This provides a stable and unique identifier.

---

## 12. Missing Null Safety

* **Problem**:

```typescript
prices[balance.currency] * balance.amount
```

If the price is undefined, the result becomes `NaN`.

* **Solution**:

```typescript
(prices[balance.currency] ?? 0) * balance.amount
```

This guarantees a safe fallback value.

---

## 13. Inconsistent Formatting Precision

* **Problem**:

```typescript
formatted: balance.amount.toFixed(),
```

`toFixed()` without arguments defaults to zero decimal places.

* **Impact**:

  * inconsistent UI formatting
  * loss of decimal precision

* **Solution**:

```typescript
formatted: balance.amount.toFixed(2),
```

This ensures consistent currency formatting.

---

## 14. Unnecessary Empty Interface

* **Problem**:

```typescript
interface Props extends BoxProps {}
```

The interface does not add any additional properties.

* **Solution**: Use `BoxProps` directly or keep the interface only if future extension is expected.

---

# Final Improvements

The refactor improves:

* Type safety
* Rendering stability
* Performance
* Maintainability
* Readability
* Data consistency
* React reconciliation behavior

Additionally, it removes:

* dead code
* unstable rendering behavior
* unnecessary recomputation
* mutation risks
* TypeScript inconsistencies
