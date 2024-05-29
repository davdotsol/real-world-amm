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
    depositing: {
      isDepositing: false,
      isSuccess: false,
      txHash: null,
    },
    withdrawing: {
      isWithdrawing: false,
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
    depositRequest: (state, action) => {
      state.depositing.isDepositing = true;
      state.depositing.isSuccess = false;
      state.depositing.txHash = null;
    },
    depositSuccess: (state, action) => {
      state.depositing.isDepositing = false;
      state.depositing.isSuccess = true;
      state.depositing.txHash = action.payload;
    },
    depositFailure: (state, action) => {
      state.depositing.isDepositing = false;
      state.depositing.isSuccess = false;
      state.depositing.txHash = null;
    },
    withdrawRequest: (state, action) => {
      state.withdrawing.isWithdrawing = true;
      state.withdrawing.isSuccess = false;
      state.withdrawing.txHash = null;
    },
    withdrawSuccess: (state, action) => {
      state.withdrawing.isWithdrawing = false;
      state.withdrawing.isSuccess = true;
      state.withdrawing.txHash = action.payload;
    },
    withdrawFailure: (state, action) => {
      state.withdrawing.isWithdrawing = false;
      state.withdrawing.isSuccess = false;
      state.withdrawing.txHash = null;
    },
  },
});

export const {
  setContract,
  setShares,
  swapRequest,
  swapSuccess,
  swapFailure,
  depositRequest,
  depositSuccess,
  depositFailure,
  withdrawRequest,
  withdrawSuccess,
  withdrawFailure,
} = amm.actions;
export default amm.reducer;
