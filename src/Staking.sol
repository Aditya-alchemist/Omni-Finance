// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Staking {

    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
        uint256 stakingDays;
    }

    error AMOUNT_MUST_BE_GREATER_THAN_ZERO();
    error STAKING_DAYS_MUST_BE_GREATER_THAN_ZERO();
    error NO_ACTIVE_STAKE();
    error TRANSACTION_FAILED();

    mapping(address => StakeInfo) public stakes;

    uint256 public interest_rate = 5e16; 
    uint256 public precision = 1e18;

    
    function stake(uint256 _days)  public  payable {
        if (msg.value <= 0) revert AMOUNT_MUST_BE_GREATER_THAN_ZERO();
        if (_days <= 0) revert STAKING_DAYS_MUST_BE_GREATER_THAN_ZERO();

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

        if (elapsedDays >= userStake.stakingDays) {
            return 0;
        } else {
            return userStake.stakingDays - elapsedDays;
        }
    }


    function getInterest() public view returns (uint256) {
        StakeInfo storage Stakeinformation = stakes[msg.sender];
        uint256 principal = Stakeinformation.amount;
        uint256 elapsedTime = block.timestamp - Stakeinformation.startTime;
        uint256 elapsedDays = elapsedTime / 86400;

        uint256 dailyRate = (interest_rate * precision) / (365 * precision);
        uint256 multiplier = precision;

        for (uint256 i = 0; i < elapsedDays; i++) {
            multiplier = (multiplier * (precision + dailyRate)) / precision;
        }

        uint256 totalInterest = (principal * (multiplier - precision)) / precision;
        return totalInterest;
    }

    function Attheendinterestgenrated() public view returns (uint256 totalInterest,uint256 totalAmount) {
        StakeInfo storage Stakeinformation = stakes[msg.sender];
        uint256 principal = Stakeinformation.amount;
      

        uint256 dailyRate = (interest_rate * precision) / (365 * precision);
        uint256 multiplier = precision;

        for (uint256 i = 0; i < Stakeinformation.stakingDays; i++) {
            multiplier = (multiplier * (precision + dailyRate)) / precision;
        }

        uint256 totalInterest = (principal * (multiplier - precision)) / precision;
        uint256 totalAmount = (principal * (multiplier)) / precision;
        return (totalInterest, totalAmount);
        
    }

    
    function withdrawstake() public payable {
        StakeInfo memory stakeclaim = stakes[msg.sender];
        uint256 principal = stakeclaim.amount;
        if (principal <= 0) revert NO_ACTIVE_STAKE();

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
}
