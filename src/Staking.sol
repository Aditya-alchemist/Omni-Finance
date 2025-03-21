// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract OmniFinance {
    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
        uint256 stakingDays;
    }

    struct LendInfo {
        uint256 amount;
        bool borrowed;
        uint256 totalInterestEarned;
    }

    error AMOUNT_MUST_BE_GREATER_THAN_ZERO();
    error STAKING_DAYS_MUST_BE_GREATER_THAN_ZERO();
    error NO_ACTIVE_STAKE();
    error TRANSACTION_FAILED();
    error COLLATERAL_TRANSFER_FAILED();

    mapping(address => LendInfo) public lender;
    mapping(address => StakeInfo) public stakes;

    uint256 public interest_rate = 5e16;
    uint256 public precision = 1e18;

    function stake(uint256 _days) public payable {
        if (msg.value == 0) revert AMOUNT_MUST_BE_GREATER_THAN_ZERO();
        if (_days == 0) revert STAKING_DAYS_MUST_BE_GREATER_THAN_ZERO();

        StakeInfo storage staker = stakes[msg.sender];

        if (staker.amount > 0) {
            staker.amount += msg.value;
            uint256 newEndTime = staker.startTime + (staker.stakingDays * 86400);
            uint256 newStakeEndTime = block.timestamp + (_days * 86400);

            if (newStakeEndTime > newEndTime) {
                staker.stakingDays = (newStakeEndTime - staker.startTime) / 86400;
            }
        } else {
            staker.amount = msg.value;
            staker.stakingDays = _days;
            staker.startTime = block.timestamp;
        }
    }

    function remainingDays(address _user) public view returns (uint256) {
        StakeInfo memory userStake = stakes[_user];
        require(userStake.amount > 0, "No active stake");

        uint256 elapsedTime = block.timestamp - userStake.startTime;
        uint256 elapsedDays = elapsedTime / 86400;

        return elapsedDays >= userStake.stakingDays ? 0 : userStake.stakingDays - elapsedDays;
    }

    function getInterest() public view returns (uint256) {
        StakeInfo storage stakeInfo = stakes[msg.sender];
        uint256 principal = stakeInfo.amount;
        uint256 elapsedTime = block.timestamp - stakeInfo.startTime;
        uint256 elapsedDays = elapsedTime / 86400;

        uint256 dailyRate = (interest_rate * precision) / (365 * precision);
        uint256 multiplier = precision;

        for (uint256 i = 0; i < elapsedDays; i++) {
            multiplier = (multiplier * (precision + dailyRate)) / precision;
        }

        return (principal * (multiplier - precision)) / precision;
    }

    function Attheendinterestgenerated() public view returns (uint256 totalInterest, uint256 totalAmount) {
        StakeInfo storage stakeInfo = stakes[msg.sender];
        uint256 principal = stakeInfo.amount;

        uint256 dailyRate = (interest_rate * precision) / (365 * precision);
        uint256 multiplier = precision;

        for (uint256 i = 0; i < stakeInfo.stakingDays; i++) {
            multiplier = (multiplier * (precision + dailyRate)) / precision;
        }

        totalInterest = (principal * (multiplier - precision)) / precision;
        totalAmount = (principal * multiplier) / precision;
    }

    function withdrawStake() public {
        StakeInfo memory stakeInfo = stakes[msg.sender];
        uint256 principal = stakeInfo.amount;
        if (principal == 0) revert NO_ACTIVE_STAKE();

        uint256 interest = getInterest();
        uint256 totalAmount;

        if (remainingDays(msg.sender) == 0) {
            totalAmount = principal + interest;
        } else {
            uint256 penalty = (principal * 5) / 100;
            totalAmount = principal - penalty;
        }

        (bool success, ) = payable(msg.sender).call{value: totalAmount}("");
        if (!success) revert TRANSACTION_FAILED();

        delete stakes[msg.sender];
    }

    function lend() public payable {
        if (msg.value == 0) revert AMOUNT_MUST_BE_GREATER_THAN_ZERO();

        LendInfo storage lending = lender[msg.sender];
        lending.amount += msg.value;
    }

    function depositcollateralandgeteth(address dai,uint256 collateralamount,uint256 getcollateral) public payable {
        depositCollateral(dai, collateralamount);
    }

    function depositCollateral(address daiAddress, uint256 _amount) public {
        if (_amount == 0) revert AMOUNT_MUST_BE_GREATER_THAN_ZERO();

        IERC20 dai = IERC20(daiAddress);

        bool success = dai.transferFrom(msg.sender, address(this), _amount);
        if (!success) revert COLLATERAL_TRANSFER_FAILED();

        
    }
}
