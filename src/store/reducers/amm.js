import { createSlice } from '@reduxjs/toolkit';

export const amm = createSlice({
  name: 'amm',
  initialState: {
    contract: null,
    shares: 0,
    swaps: [],
  },
  reducers: {
    setContract: (state, action) => {
      state.contract = action.payload;
    },
    setShares: (state, action) => {
      state.shares = action.payload;
    },
    setSwaps: (state, action) => {
      state.swaps = action.payload;
    },
  },
});

export const { setContract, setShares, setSwaps } = amm.actions;
export default amm.reducer;
