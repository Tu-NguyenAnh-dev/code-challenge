const PRIORITY_MAP: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

interface WalletBalance {
  blockchain: string;
  currency: string;
  amount: number;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

interface Props extends BoxProps {}

const getPriority = (blockchain: string): number => {
  return PRIORITY_MAP[blockchain] ?? -99;
};

const WalletPage: React.FC<Props> = ({ children, ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const formattedBalances = useMemo<FormattedWalletBalance[]>(() => {
    return balances
      .filter((balance) => {
        return (
          getPriority(balance.blockchain) > -99 &&
          balance.amount > 0
        );
      })
      .sort((a, b) => {
        return (
          getPriority(b.blockchain) -
          getPriority(a.blockchain)
        );
      })
      .map((balance) => ({
        ...balance,
        formatted: balance.amount.toFixed(2),
      }));
  }, [balances]);

  return (
    <div {...rest}>
      {formattedBalances.map((balance) => {
        const usdValue =
          (prices[balance.currency] ?? 0) * balance.amount;

        return (
          <WalletRow
            className={classes.row}
            key={`${balance.blockchain}-${balance.currency}`}
            amount={balance.amount}
            usdValue={usdValue}
            formattedAmount={balance.formatted}
          />
        );
      })}
    </div>
  );
};