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

    event Swap(
        address user,
        address tokenGive,
        uint256 tokenGiveAmount,
        address tokenGet,
        uint256 tokenGetAmount,
        uint256 token1Balance,
        uint256 token2Balance,
        uint256 timestamp
    );

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

    function calculateWidthrawAmount(
        uint256 _share
    ) public view returns (uint256 _amount1, uint256 _amount2) {
        require(_share <= totalShares, "Must be less than total shares");
        _amount1 = (_share * balance1) / totalShares;
        _amount2 = (_share * balance2) / totalShares;
    }

    function removeLiquidity(
        uint256 _share
    ) external returns (uint256 _amount1, uint256 _amount2) {
        require(
            _share <= shares[msg.sender],
            "Cannot withdraw more shares than you have"
        );
        (_amount1, _amount2) = calculateWidthrawAmount(_share);
        shares[msg.sender] -= _share;
        totalShares -= _share;
        balance1 -= _amount1;
        balance2 -= _amount2;
        K = balance1 * balance2;

        token1.transfer(msg.sender, _amount1);
        token2.transfer(msg.sender, _amount2);
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

    function calculateToken1Swap(
        uint256 _amount1
    ) public view returns (uint256 _amount2) {
        require(_amount1 <= balance1, "Swap amount exceeds pool balance");
        uint256 _token1 = balance1 + _amount1;
        uint256 _token2 = K / _token1;
        _amount2 = balance2 - _token2;

        // Don't let pool go to 0
        if (_amount2 == balance2) {
            _amount2--;
        }

        require(_amount2 < balance2, "Swap cannot exceed pool balance");
    }

    function swapToken1(uint256 _amount1) external returns (uint256 _amount2) {
        // Calculate Token 2 amount
        _amount2 = calculateToken1Swap(_amount1);

        // Do Swap
        // 1. Transfer tokens out of user wallet
        token1.transferFrom(msg.sender, address(this), _amount1);
        // 2. Update the token1 balance in the contract
        balance1 += _amount1;
        // 3. Update the token2 balance in the contract
        balance2 -= _amount2;
        // 4. Transfer token2 tokens from contract to user wallet
        token2.transfer(msg.sender, _amount2);

        // Emit an event
        emit Swap(
            msg.sender,
            address(token1),
            _amount1,
            address(token2),
            _amount2,
            balance1,
            balance2,
            block.timestamp
        );
    }

    function calculateToken2Swap(
        uint256 _amount2
    ) public view returns (uint256 _amount1) {
        require(_amount2 <= balance2, "Swap amount exceeds pool balance");
        uint256 _token2 = balance2 + _amount2;
        uint256 _token1 = K / _token2;
        _amount1 = balance1 - _token1;

        // Don't let pool go to 0
        if (_amount1 == balance1) {
            _amount1--;
        }

        require(_amount1 < balance1, "Swap cannot exceed pool balance");
    }

    function swapToken2(uint256 _amount2) external returns (uint256 _amount1) {
        // Calculate Token 2 amount
        _amount1 = calculateToken2Swap(_amount2);

        // Do Swap
        // 1. Transfer tokens out of user wallet
        token2.transferFrom(msg.sender, address(this), _amount2);
        // 2. Update the token2 balance in the contract
        balance2 += _amount2;
        // 3. Update the token1 balance in the contract
        balance1 -= _amount1;
        // 4. Transfer token1 tokens from contract to user wallet
        token1.transfer(msg.sender, _amount1);

        // Emit an event
        emit Swap(
            msg.sender,
            address(token2),
            _amount2,
            address(token1),
            _amount1,
            balance2,
            balance1,
            block.timestamp
        );
    }
}
