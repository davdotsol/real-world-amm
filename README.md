# Automated Market Maker (AMM)

This repository contains the code for a Real World Automated Market Maker (AMM) implemented with a Solidity smart contract and a ReactJS frontend. The project is deployed on the Sepolia test network.

## Introduction to Automated Market Makers

Automated Market Makers (AMMs) are a type of decentralized exchange (DEX) protocol that relies on a mathematical formula to price assets. Unlike traditional exchanges that use order books, AMMs use liquidity pools to enable trading. Users provide liquidity to these pools by depositing pairs of tokens, and the AMM algorithm determines the price of the tokens based on the ratio of the amounts in the pool.

### How AMMs Work

In an AMM, liquidity providers (LPs) deposit an equal value of two tokens into a liquidity pool. For example, in this project, users can deposit DDS and USD tokens into the AMM contract. Traders can then swap between these tokens using the pool. The price of the tokens is determined by the constant product formula:

\[ x \* y = k \]

Where:

- \( x \) is the amount of token1 (e.g., DDS)
- \( y \) is the amount of token2 (e.g., USD)
- \( k \) is a constant

When a trade occurs, the amounts of the tokens in the pool change, but the product \( k \) remains constant. This ensures that the pool is always balanced.

### Price Calculation

The price of the tokens in the AMM is determined by the ratio of the tokens in the pool. For example, if there are 100 DDS tokens and 200 USD tokens in the pool, the price of 1 DDS in terms of USD would be:

\[ Price of DDS = Amount of USD / Amount of DDS = 200 / 100 = 2 \, USD per DDS \]

Conversely, the price of 1 USD in terms of DDS would be:

\[ Price of USD = Amount of DDS / Amount of USD = 100 / 200 = 0.5 \, DDS per USD \]

## Contracts

### AMM Contract

- **Address:** `0xFe68E9EFB7C7d74C4B3A7Cc431f34FD4C218E3a7`
- **Description:** This contract manages the liquidity pool, facilitates token swaps, and handles deposits and withdrawals.

### DDS Token Contract

- **Address:** `0x09BA71798f59A7d0C788C787e1564B0c8dCa0a8C`
- **Description:** ERC-20 token used as one of the assets in the AMM.

### USD Token Contract

- **Address:** `0x0098d647E057A5256cD2E2b0076B968Ee129aada`
- **Description:** ERC-20 token used as the other asset in the AMM.

## Frontend

The ReactJS frontend is deployed using Vercel and can be accessed at the following URL:

- **URL:** [https://real-world-amm.vercel.app/](https://real-world-amm.vercel.app/)

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- Hardhat
- MetaMask or any Ethereum wallet

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/real-world-amm.git
   cd real-world-amm
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```

### Deployment

1. **Compile the smart contracts:**

   ```bash
   npx hardhat compile
   ```

2. **Deploy the smart contracts:**
   ```bash
    npx hardhat ignition deploy ./ignition/modules/AMM.js --network localhost
   ```
3. **Seed the smart contracts:**
   ```bash
   npx hardhat run scripts/seed.js --network localhost
   ```

### Configuration

Update the frontend configuration with the deployed contract address:

```json
{
"31337": {
 "dds": {
   "address": "0x5FbDB2315678afecb367f032d93F642f64180aa3"
 },
 "usd": {
   "address": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
 },
 "amm": {
   "address": "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
 }
},
"11155111": {
 "dds": {
   "address": "0x09BA71798f59A7d0C788C787e1564B0c8dCa0a8C"
 },
 "usd": {
   "address": "0x0098d647E057A5256cD2E2b0076B968Ee129aada"
 },
 "amm": {
   "address": "0xFe68E9EFB7C7d74C4B3A7Cc431f34FD4C218E3a7"
 }
}
```

### Running the frontend

1. **Start the development server:**
   ```bash
   npm run start
   ```
2. **Open your browser and navigate to:**
   ```
   http://localhost:3000
   ```

## Usage

1. **Connect your Ethereum wallet (e.g., Metamask) to the Sepolia (or local) network.**

2. **Use the frontend to interact with the AMM:**

- Add liquidity
- Swap tokens
- Remove liquidity
- View transactions history on chart
