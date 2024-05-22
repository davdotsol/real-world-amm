// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.24;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Manage Pool
// Manage Deposits
// Facilitates Swaps (i.e. Trades)
// Manage Withdraws

contract AMM {
    IERC20 public token1;
    IERC20 public token2;

    uint256 public balance1;
    uint256 public balance2;
    uint256 public K;
    uint256 constant PRECISION = 10 ** 18;

    uint256 public totalShares;
    mapping(address => uint256) public shares;

    constructor(IERC20 _token1, IERC20 _token2) {
        require(address(_token1) != address(0), "Invalid token1 address");
        require(address(_token2) != address(0), "Invalid token2 address");
        token1 = _token1;
        token2 = _token2;
    }

    function addLiquidity(uint256 _amount1, uint256 _amount2) external {
        // Deposit Tokens
        require(
            token1.transferFrom(msg.sender, address(this), _amount1),
            "Failed to transfer token 1"
        );
        require(
            token2.transferFrom(msg.sender, address(this), _amount2),
            "Failed to transfer token 2"
        );

        uint256 share;
        // Issue Shares
        if (totalShares == 0) {
            share = 100 * PRECISION;
        } else {
            uint256 share1 = (totalShares * _amount1) / balance1;
            uint256 share2 = (totalShares * _amount2) / balance2;
            require(
                (share1 / 10 ** 3) == (share2 / 10 ** 3),
                "Must provide equal token amounts"
            );
            share = share1;
        }

        // Manage Pool
        balance1 += _amount1;
        balance2 += _amount2;
        K = balance1 * balance2;

        // Update Shares
        totalShares += share;
        shares[msg.sender] += share;
    }

    // Determine how many token2 tokens must be deposited when depositing liquidity for token1
    function calculateToken2Deposit(
        uint256 _amount1
    ) public view returns (uint256 _amount2) {
        _amount2 = (balance2 * _amount1) / balance1;
    }

    // Determine how many token1 tokens must be deposited when depositing liquidity for token2
    function calculateToken1Deposit(
        uint256 _amount2
    ) public view returns (uint256 _amount1) {
        _amount1 = (balance1 * _amount2) / balance2;
    }
}
