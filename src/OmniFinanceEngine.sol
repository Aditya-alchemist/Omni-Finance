// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
 

 //deployed at 0xfc19e457f20ba3da15ac8fa4718ee284b74059ba
contract OmniFinance is ReentrancyGuard, Ownable {
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

    struct BorrowInfo {
        uint256 borrowedAmount;
        uint256 collateralAmount;
        bool isActive;
        uint256 startTime;
    }

    error AMOUNT_MUST_BE_GREATER_THAN_ZERO();
    error STAKING_DAYS_MUST_BE_GREATER_THAN_ZERO();
    error NO_ACTIVE_STAKE();
    error TRANSACTION_FAILED();
    error COLLATERAL_TRANSFER_FAILED();
    error NOT_ENOUGH_LIQUIDITY();
    error WITHDRAWAL_EXCEEDS_CONTRACT_BALANCE();
    error HEALTH_FACTOR_NOT_BELOW_THRESHOLD();
    error NO_ACTIVE_LOAN();

    mapping(address => LendInfo) public lender;
    mapping(address => StakeInfo) public stakes;
    mapping(address => BorrowInfo) public borrowers;
    address[] public lenderAddresses;
    uint256 public constant HEALTH_FACTOR_THRESHOLD = 8e17; // 0.8
    uint256 public constant LIQUIDATION_PENALTY = 10; // 10%

    uint256 public constant INTEREST_RATE = 5e16; // 5% annual
    uint256 public constant PRECISION = 1e18;
    uint256 public constant LENDER_REWARD_PERCENT = 2;
    uint256 public constant BORROW_LIMIT_PERCENT = 50;
    uint256 public constant SECONDS_IN_A_DAY = 86400;

    AggregatorV3Interface public priceFeedETH;
    AggregatorV3Interface public priceFeedDAI;

    constructor(address _ethPriceFeed, address _daiPriceFeed) Ownable(msg.sender) {
        priceFeedETH = AggregatorV3Interface(_ethPriceFeed);
        priceFeedDAI = AggregatorV3Interface(_daiPriceFeed);
    }

    function stake(uint256 _days) public payable {
        if (msg.value == 0) revert AMOUNT_MUST_BE_GREATER_THAN_ZERO();
        if (_days == 0) revert STAKING_DAYS_MUST_BE_GREATER_THAN_ZERO();

        StakeInfo storage staker = stakes[msg.sender];

        if (staker.amount > 0) {
            staker.amount += msg.value;
            uint256 newEndTime = staker.startTime + (staker.stakingDays * SECONDS_IN_A_DAY);
            uint256 newStakeEndTime = block.timestamp + (_days * SECONDS_IN_A_DAY);

            if (newStakeEndTime > newEndTime) {
                staker.stakingDays = (newStakeEndTime - staker.startTime) / SECONDS_IN_A_DAY;
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
        uint256 elapsedDays = elapsedTime / SECONDS_IN_A_DAY;

        return elapsedDays >= userStake.stakingDays ? 0 : userStake.stakingDays - elapsedDays;
    }

    function getInterest() public view returns (uint256) {
        StakeInfo storage stakeInfo = stakes[msg.sender];
        uint256 principal = stakeInfo.amount;
        uint256 elapsedTime = block.timestamp - stakeInfo.startTime;
        uint256 elapsedDays = elapsedTime / SECONDS_IN_A_DAY;

        uint256 dailyRate = (INTEREST_RATE * PRECISION) / (365 * PRECISION);
        uint256 multiplier = PRECISION;

        for (uint256 i = 0; i < elapsedDays; i++) {
            multiplier = (multiplier * (PRECISION + dailyRate)) / PRECISION;
        }

        return (principal * (multiplier - PRECISION)) / PRECISION;
    }

    function withdrawStake() public nonReentrant {
        StakeInfo memory stakeInfo = stakes[msg.sender];
        uint256 principal = stakeInfo.amount;
        if (principal == 0) revert NO_ACTIVE_STAKE();

        uint256 interest = getInterest();
        uint256 totalAmount;

        if (remainingDays(msg.sender) == 0) {
            totalAmount = principal + interest;
        } else {
            uint256 penalty = (principal * 2) / 100;
            totalAmount = principal  - penalty +interest;
        }

        if (totalAmount > address(this).balance) revert WITHDRAWAL_EXCEEDS_CONTRACT_BALANCE();

        (bool success, ) = payable(msg.sender).call{value: totalAmount}("");
        if (!success) revert TRANSACTION_FAILED();

        delete stakes[msg.sender];
    }

    function lend() public payable {
        if (msg.value == 0) revert AMOUNT_MUST_BE_GREATER_THAN_ZERO();
        
        if (lender[msg.sender].amount == 0) {
            // If this is a new lender, add to the lenderAddresses array
            lenderAddresses.push(msg.sender);
        }
        
        lender[msg.sender].amount += msg.value;
    }

    function borrow(address daiAddress, uint256 collateralAmount) public nonReentrant {
        if (collateralAmount == 0) revert AMOUNT_MUST_BE_GREATER_THAN_ZERO();

        uint256 daiPrice = getLatestPrice(priceFeedDAI);
        uint256 ethPrice = getLatestPrice(priceFeedETH);

        uint256 collateralValueUSD = (collateralAmount * daiPrice) / 1e18;
        uint256 borrowLimitUSD = (collateralValueUSD * BORROW_LIMIT_PERCENT) / 100;
        uint256 borrowAmountETH = (borrowLimitUSD * 1e18) / ethPrice;

        require(borrowAmountETH > 0, "Cannot borrow 0 ETH");

        IERC20 dai = IERC20(daiAddress);
        require(dai.transferFrom(msg.sender, address(this), collateralAmount), "Collateral transfer failed");

        borrowers[msg.sender] = BorrowInfo({
            borrowedAmount: borrowAmountETH,
            collateralAmount: collateralAmount,
            isActive: true,
            startTime: block.timestamp
        });

        for (uint256 i = 0; i < lenderAddresses.length; i++) {
            address lenderAddress = lenderAddresses[i];
            if (lender[lenderAddress].amount >= borrowAmountETH) {
                lender[lenderAddress].amount -= borrowAmountETH;
                lender[lenderAddress].borrowed = true;

                uint256 reward = (borrowAmountETH * LENDER_REWARD_PERCENT) / 100;
                lender[lenderAddress].totalInterestEarned += reward;

                (bool successLender, ) = payable(lenderAddress).call{value: reward}("");
                require(successLender, "Lender reward transfer failed");

                (bool successBorrow, ) = payable(msg.sender).call{value: borrowAmountETH}("");
                require(successBorrow, "ETH transfer failed");

                return;
            }
        }

        revert NOT_ENOUGH_LIQUIDITY();
    }

    function repayDebt(address daiAddress) public payable nonReentrant {
        BorrowInfo storage borrowInfo = borrowers[msg.sender];
        if (!borrowInfo.isActive) revert NO_ACTIVE_LOAN();
        
        uint256 borrowedAmount = borrowInfo.borrowedAmount;
        uint256 collateralAmount = borrowInfo.collateralAmount;
        
        // Calculate 2% fee
        uint256 fee = (borrowedAmount * 2) / 100;
        uint256 totalRepayAmount = borrowedAmount + fee;
        
        require(msg.value >= totalRepayAmount, "Insufficient repayment amount");
        
        // Transfer collateral back to borrower
        IERC20 dai = IERC20(daiAddress);
        require(dai.transfer(msg.sender, collateralAmount), "Collateral return failed");
        
        // If user sent more than required, refund the excess
        if (msg.value > totalRepayAmount) {
            uint256 refundAmount = msg.value - totalRepayAmount;
            (bool refundSuccess, ) = payable(msg.sender).call{value: refundAmount}("");
            require(refundSuccess, "Refund failed");
        }
        
        // Mark the loan as inactive
        borrowInfo.isActive = false;
        borrowInfo.borrowedAmount = 0;
        borrowInfo.collateralAmount = 0;
    }

    function calculateHealthFactor(address borrower) public view returns (uint256) {
        BorrowInfo memory borrowInfo = borrowers[borrower];
        if (!borrowInfo.isActive) return 0;
        
        uint256 daiPrice = getLatestPrice(priceFeedDAI);
        uint256 ethPrice = getLatestPrice(priceFeedETH);
        
        uint256 collateralValueUSD = (borrowInfo.collateralAmount * daiPrice) / 1e18;
        uint256 borrowValueUSD = (borrowInfo.borrowedAmount * ethPrice) / 1e18;
        
        // Health factor = (collateralValueUSD / borrowValueUSD) * 100%
        return (collateralValueUSD * PRECISION) / borrowValueUSD;
    }

    function liquidate(address borrower, address daiAddress) public onlyOwner nonReentrant {
        BorrowInfo storage borrowInfo = borrowers[borrower];
        if (!borrowInfo.isActive) revert NO_ACTIVE_LOAN();
        
        uint256 healthFactor = calculateHealthFactor(borrower);
        if (healthFactor > HEALTH_FACTOR_THRESHOLD) revert HEALTH_FACTOR_NOT_BELOW_THRESHOLD();
        
        uint256 borrowedAmount = borrowInfo.borrowedAmount;
        uint256 collateralAmount = borrowInfo.collateralAmount;
        
        // Calculate liquidation penalty
        uint256 penaltyAmount = (collateralAmount );
        uint256 returnAmount = collateralAmount - penaltyAmount;
        
        // Transfer remaining collateral back to borrower
        IERC20 dai = IERC20(daiAddress);
        require(dai.transfer(borrower, returnAmount), "Collateral return failed");
        
        // Transfer penalty to owner
        require(dai.transfer(owner(), penaltyAmount), "Penalty transfer failed");
        
        // Mark the loan as inactive
        borrowInfo.isActive = false;
        borrowInfo.borrowedAmount = 0;
        borrowInfo.collateralAmount = 0;
        
        emit LiquidationExecuted(borrower, borrowedAmount, collateralAmount, penaltyAmount);
    }

    function withdrawLend() public nonReentrant {
        LendInfo storage lending = lender[msg.sender];
        require(lending.amount > 0, "No active lending");
        require(!lending.borrowed, "Funds are currently borrowed");

        uint256 withdrawalAmount = lending.amount;
        if (withdrawalAmount > address(this).balance) revert WITHDRAWAL_EXCEEDS_CONTRACT_BALANCE();

        (bool success, ) = payable(msg.sender).call{value: withdrawalAmount}("");
        if (!success) revert TRANSACTION_FAILED();

        delete lender[msg.sender];
    }

    function getLatestPrice(AggregatorV3Interface priceFeed) internal view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return uint256(price * 1e10);
    }
    
    event LiquidationExecuted(address indexed borrower, uint256 borrowedAmount, uint256 collateralAmount, uint256 penaltyAmount);
}