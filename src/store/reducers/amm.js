import { createSlice } from '@reduxjs/toolkit';

export const amm = createSlice({
  name: 'amm',
  initialState: {
    contract: null,
    shares: 0,
    swaps: [],
    swapping: {
      isSwapping: false,
      isSuccess: false,
      txHash: null,
    },
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
    swapRequest: (state, action) => {
      state.swapping.isSwapping = true;
      state.swapping.isSuccess = false;
      state.swapping.txHash = null;
    },
    swapSuccess: (state, action) => {
      state.swapping.isSwapping = false;
      state.swapping.isSuccess = true;
      state.swapping.txHash = action.payload;
    },
    swapFailure: (state, action) => {
      state.swapping.isSwapping = false;
      state.swapping.isSuccess = false;
      state.swapping.txHash = null;
    },
  },
});

export const { setContract, setShares, swapRequest, swapSuccess, swapFailure } =
  amm.actions;
export default amm.reducer;
