import { createSelector } from 'reselect';

const tokens = (state) => state.tokens.contracts;
const swaps = (state) => state.amm.swaps;
export const chartSelector = createSelector(swaps, tokens, (swaps, tokens) => {
  // Build the graph data
  if (!tokens[0] || !tokens[1]) {
    return;
  }

  // Filter swaps by selected tokens
  swaps = swaps.filter(
    (s) =>
      s.args.tokenGet === tokens[0].target ||
      s.args.tokenGet === tokens[1].target
  );
  swaps = swaps.filter(
    (s) =>
      s.args.tokenGive === tokens[0].target ||
      s.args.tokenGive === tokens[1].target
  );

  // Sort swaps by date descending
  swaps = swaps.sort(
    (a, b) => a.args.timestamp.toString() - b.args.timestamp.toString()
  );

  swaps = swaps.map((s) => calculateSwapRate(s));

  const prices = swaps.map((s) => s.rate);

  swaps = swaps.sort(
    (a, b) => b.args.timestamp.toString() - a.args.timestamp.toString()
  );

  return {
    swaps,
    series: [
      {
        name: 'Rate',
        data: prices,
      },
    ],
  };
});

const calculateSwapRate = (swap) => {
  const precision = 100000;
  let rate = swap.args.token2Balance / swap.args.token1Balance;
  rate = Math.round((parseFloat(rate.toString()) * precision) / precision);

  return {
    ...swap,
    rate,
  };
};
