  
![Omni-Finance](https://forkast.news/wp-content/uploads/2022/11/Forkast-Opinion-Images-14-1260x710.png)
---

# **OmniFinance**  

OmniFinance is a **decentralized finance (DeFi) protocol** that enables users to **stake, lend, and borrow funds securely**. Built on **Ethereum**, it features a **staking system**, a **lending-borrowing system**, and a **liquidation mechanism** for risk management. The contract integrates **Chainlink price feeds** to determine real-time asset valuations and ensures secure, dynamic APY calculations.  

---

## 🚀 **Features**  

### 🔹 **Staking System**  
- Users can **stake ETH** for a specified period.  
- Interest is compounded **daily** using a precision-based APY calculation.  
- Users can withdraw their stake along with interest earned.  
- **Early withdrawal penalty** of **2%** on the staked amount.  

#### 📌 Staking Formula  
The final staked amount, including interest, is calculated using:  

```
A = P * (1 + r / n) ^ (n * t)
```
Where:  
- `A` = Final stake amount (including interest)  
- `P` = Initial stake amount  
- `r` = Annual interest rate (e.g., 5%)  
- `n` = Compounding frequency per year (daily = 365)  
- `t` = Time staked (in years)  

---

### 🔹 **Lending System**  
- Users can **lend ETH** and earn rewards when their funds are borrowed.  
- Lenders receive **2% interest rewards** when their funds are borrowed.  
- Lenders can withdraw their funds if they are **not currently borrowed**.  

---

### 🔹 **Borrowing System**  
- Users can **borrow ETH using DAI as collateral**.  
- Borrow limit is **50% of the collateral's USD value**, secured via Chainlink price feeds.  
- Borrowers pay a **2% fee** on borrowed ETH when repaying.  
- Loans remain active until repaid in full.  

#### 📌 Borrow Limit Formula  
```
Max Borrow = Collateral (USD) * 0.5
```
Where:  
- `Collateral (USD)` = Collateral Amount * Chainlink Price (DAI/USD)  
- `Borrow Limit` = 50% of collateral’s USD value  

---

### 🔹 **Liquidation Mechanism**  
- A borrower's **health factor** is calculated using the **collateral-to-debt ratio**.  
- If the health factor **falls below 0.8**, they can be **liquidated** by the contract owner.  
- **Liquidation penalty:** A portion of the collateral is **claimed by the owner** upon liquidation.  
- Remaining collateral is returned to the borrower.  

#### 📌 Health Factor Formula  
```
Health Factor = (Collateral Value (USD) * LTV) / Debt Value (USD)
```
Where:  
- `LTV (Loan-to-Value)` = 1.25 (i.e., 1 / 0.8 threshold)  
- `Collateral Value (USD)` = Collateral Amount * Chainlink Price (DAI/USD)  
- `Debt Value (USD)` = Borrowed ETH * Chainlink Price (ETH/USD)  

📌 **If Health Factor < 0.8, liquidation is triggered.**  

#### 📌 Liquidation Formula  
```
Liquidation Penalty = Collateral * 0.10
```
Where:  
- **10% of collateral is claimed** by the contract owner.  
- Remaining collateral is refunded to the borrower.  

---

## 📜 **Smart Contract Details**  

### ✅ **Contract Address**  
📍 **Deployed on Sepolia:** `0xfc19e457f20ba3da15ac8fa4718ee284b74059ba`  

### ✅ **Key Constants**  
| Parameter  | Value  | Description  |
|------------|--------|--------------|
| `INTEREST_RATE`  | `5% annual`  | Staking interest rate (compounded daily).  |
| `LENDER_REWARD_PERCENT`  | `2%`  | Reward for lenders when their funds are borrowed.  |
| `BORROW_LIMIT_PERCENT`  | `50%`  | Maximum borrowing power based on collateral.  |
| `HEALTH_FACTOR_THRESHOLD`  | `0.8`  | Borrowers are **liquidated** below this threshold.  |
| `LIQUIDATION_PENALTY`  | `10%`  | % of collateral taken by the owner upon liquidation.  |

---

## 🛠 **Installation & Setup**  

### 📌 **Prerequisites**  
Ensure you have:  
- **Node.js** & **NPM** installed  
- **Hardhat** (for local development)  
- **Foundry** (for Solidity testing)  

### 📌 **Clone the Repository**  
```sh
git clone https://github.com/yourusername/OmniFinance.git
cd OmniFinance
```

### 📌 **Install Dependencies**  
```sh
npm install
```

### 📌 **Compile the Contract**  
```sh
forge build
```

### 📌 **Deploy to Sepolia**  
Create a `.env` file and set your **PRIVATE_KEY** & **ALCHEMY_API_URL**.  
Then, deploy using:  
```sh
forge script scripts/deploy.s.sol --rpc-url $RPC_URL --private-key $PRIVATE_KEY
```

---

## ⚡ **Usage**  

### ✅ **Stake ETH**  
```solidity
function stake(uint256 _days) public payable;
```
- Users deposit **ETH** and specify staking duration.  
- Interest is compounded daily and withdrawable after the staking period.  

### ✅ **Withdraw Stake + Interest**  
```solidity
function withdrawStake() public;
```
- Users **claim their stake** along with accumulated interest.  
- **Penalty applied** for early withdrawals.  

### ✅ **Lend ETH**  
```solidity
function lend() public payable;
```
- Users **lend ETH** to the protocol.  
- Earn **2% interest** when funds are borrowed.  

### ✅ **Withdraw Lending**  
```solidity
function withdrawLend() public;
```
- **Withdraw funds** if they are **not actively borrowed**.  

### ✅ **Borrow ETH (Using DAI as Collateral)**  
```solidity
function borrow(address daiAddress, uint256 collateralAmount) public;
```
- Users deposit **DAI collateral** to borrow ETH.  
- **Borrow limit** = 50% of collateral’s USD value.  
- **Chainlink price feeds** determine exchange rates.  

### ✅ **Repay Borrowed ETH**  
```solidity
function repayDebt(address daiAddress) public payable;
```
- Borrowers **repay ETH** with a **2% fee**.  
- Their **DAI collateral** is refunded.  

### ✅ **Liquidate Risky Borrowers**  
```solidity
function liquidate(address borrower, address daiAddress) public onlyOwner;
```
- If a borrower's **health factor < 0.8**, they are **liquidated**.  
- Owner **claims a portion of collateral**, rest is refunded.  

---

## 🔍 **Security Measures**  
- **Reentrancy protection** using `ReentrancyGuard`.  
- **OnlyOwner modifier** to restrict critical functions.  
- **Health factor monitoring** to prevent bad debts.  

---

## 🏗 **Future Improvements**  
- 🟢 Integrate **Aave WETH Gateway** for ETH deposits  
- 🟢 Support **multi-asset lending** (USDC, USDT)  
- 🟢 Implement **auto-liquidation bots** for security  

---

## 👨‍💻 **Author**  
**[Aditya kumar Mishra]** – Blockchain Developer  
🔗 [GitHub](https://github.com/Aditya-alchemist) | 🔗 [Twitter](https://twitter.com/adityaalchemist)  

---

## 📜 **License**  
**MIT License** – Free to use, modify, and distribute.  

---

### 🔥 OmniFinance: **Decentralized Lending & Staking for Secure Yield Generation!** 🚀  

---

This version ensures the formulas are correctly displayed in your **GitHub README** without LaTeX formatting issues. 🚀
