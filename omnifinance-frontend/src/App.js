import React, { useState, useEffect } from "react";
import { ethers , BrowserProvider } from "ethers";
import "./App.css";

const contractAddress = "0xfc19e457f20ba3da15ac8fa4718ee284b74059ba"; // Your deployed contract address
const daiAddress = "0x68194a729C2450ad26072b3D33ADaCbcef39D574"
const abi = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_ethPriceFeed",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_daiPriceFeed",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "AMOUNT_MUST_BE_GREATER_THAN_ZERO",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "COLLATERAL_TRANSFER_FAILED",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "HEALTH_FACTOR_NOT_BELOW_THRESHOLD",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "NOT_ENOUGH_LIQUIDITY",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "NO_ACTIVE_LOAN",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "NO_ACTIVE_STAKE",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "STAKING_DAYS_MUST_BE_GREATER_THAN_ZERO",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "TRANSACTION_FAILED",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "WITHDRAWAL_EXCEEDS_CONTRACT_BALANCE",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "borrower",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "borrowedAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "collateralAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "penaltyAmount",
				"type": "uint256"
			}
		],
		"name": "LiquidationExecuted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "BORROW_LIMIT_PERCENT",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "HEALTH_FACTOR_THRESHOLD",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "INTEREST_RATE",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "LENDER_REWARD_PERCENT",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "LIQUIDATION_PENALTY",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "PRECISION",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "SECONDS_IN_A_DAY",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "daiAddress",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "collateralAmount",
				"type": "uint256"
			}
		],
		"name": "borrow",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "borrowers",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "borrowedAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "collateralAmount",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "startTime",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "borrower",
				"type": "address"
			}
		],
		"name": "calculateHealthFactor",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getInterest",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "lend",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "lender",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "borrowed",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "totalInterestEarned",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "lenderAddresses",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "borrower",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "daiAddress",
				"type": "address"
			}
		],
		"name": "liquidate",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "priceFeedDAI",
		"outputs": [
			{
				"internalType": "contract AggregatorV3Interface",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "priceFeedETH",
		"outputs": [
			{
				"internalType": "contract AggregatorV3Interface",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "remainingDays",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "daiAddress",
				"type": "address"
			}
		],
		"name": "repayDebt",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_days",
				"type": "uint256"
			}
		],
		"name": "stake",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "stakes",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "startTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "stakingDays",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "withdrawLend",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "withdrawStake",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];
const daiAbi = [{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"symbol","type":"string"},{"internalType":"uint8","name":"decimals","type":"uint8"},{"internalType":"address","name":"owner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"EIP712_REVISION","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"value","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}];

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [daiContract, setDaiContract] = useState(null);
  const [account, setAccount] = useState("");

  const [stakeDays, setStakeDays] = useState(0);
  const [stakeAmount, setStakeAmount] = useState("");
  const [lendAmount, setLendAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [collateralAmount, setCollateralAmount] = useState("");
  const [repayAmount, setRepayAmount] = useState("");

  const [stakedBalance, setStakedBalance] = useState("0");
  const [lendedBalance, setLendedBalance] = useState("0");
  const [borrowedDebt, setBorrowedDebt] = useState("0");
  const [healthFactor, setHealthFactor] = useState("N/A");

  useEffect(() => {
      async function connectWallet() {
          if (window.ethereum) {
              const _provider = new ethers.BrowserProvider(window.ethereum);
              const _signer = await _provider.getSigner();
              const _contract = new ethers.Contract(contractAddress, abi, _signer);
              const _daiContract = new ethers.Contract(daiAddress, daiAbi, _signer);

              setProvider(_provider);
              setSigner(_signer);
              setContract(_contract);
              setDaiContract(_daiContract);

              const accounts = await _provider.send("eth_requestAccounts", []);
              setAccount(accounts[0]);
          } else {
              alert("MetaMask is required to use this dApp.");
          }
      }
      connectWallet();
  }, []);

  // ✅ Approve DAI for borrowing
  const approveDai = async () => {
      try {
          const amount = ethers.parseUnits("1000", 18);
          const tx = await daiContract.connect(signer).approve(contractAddress, amount);
          await tx.wait();
          alert("DAI approved successfully.");
      } catch (error) {
          console.error(error);
          alert("Approval failed: " + error.message);
      }
  };

  // ✅ Stake ETH
  const stake = async () => {
      try {
          const tx = await contract.connect(signer).stake(stakeDays, { value: ethers.parseEther(stakeAmount) });
          await tx.wait();
          alert("Staked successfully!");
      } catch (error) {
          console.error(error);
          alert("Staking failed: " + error.message);
      }
  };

  // ✅ Withdraw Stake
  const withdrawStake = async () => {
      try {
          const tx = await contract.connect(signer).withdrawStake();
          await tx.wait();
          alert("Stake withdrawn!");
      } catch (error) {
          console.error(error);
          alert("Withdrawal failed: " + error.message);
      }
  };

  // ✅ Lend ETH
  const lend = async () => {
      try {
          const tx = await contract.connect(signer).lend({ value: ethers.parseEther(lendAmount) });
          await tx.wait();
          alert("Lent successfully!");
      } catch (error) {
          console.error(error);
          alert("Lending failed: " + error.message);
      }
  };

  // ✅ Withdraw Lending
  const withdrawLend = async () => {
      try {
          const tx = await contract.connect(signer).withdrawLend();
          await tx.wait();
          alert("Lending withdrawn!");
      } catch (error) {
          console.error(error);
          alert("Withdrawal failed: " + error.message);
      }
  };

  // ✅ Deposit DAI as Collateral
  const depositCollateral = async () => {
      try {
          const tx = await contract.connect(signer).depositCollateral(daiAddress, ethers.parseEther(collateralAmount));
          await tx.wait();
          alert("Collateral deposited!");
      } catch (error) {
          console.error(error);
          alert("Deposit failed: " + error.message);
      }
  };

  // ✅ Borrow ETH
  const borrow = async () => {
      try {
          const tx = await contract.connect(signer).borrow(daiAddress, ethers.parseEther(borrowAmount));
          await tx.wait();
          alert("ETH borrowed successfully!");
      } catch (error) {
          console.error(error);
          alert("Borrowing failed: " + error.message);
      }
  };

  // ✅ Repay ETH
  const repayDebt = async () => {
      try {
          const tx = await contract.connect(signer).repayDebt(daiAddress, { value: ethers.parseEther(repayAmount) });
          await tx.wait();
          alert("Debt repaid!");
      } catch (error) {
          console.error(error);
          alert("Repayment failed: " + error.message);
      }
  };

  // ✅ Liquidate Borrower (Requires Borrower's Address)
  const liquidate = async () => {
      try {
          const borrowerAddress = prompt("Enter the borrower's address to liquidate:");
          if (!borrowerAddress) return alert("Borrower address required!");

          const tx = await contract.connect(signer).liquidate(borrowerAddress, daiAddress);
          await tx.wait();
          alert("Borrower liquidated!");
      } catch (error) {
          console.error(error);
          alert("Liquidation failed: " + error.message);
      }
  };

  // ✅ View Health Factor
  const viewHealthFactor = async () => {
      try {
          const health = await contract.getHealthFactor(account);
          setHealthFactor(ethers.formatEther(health));
      } catch (error) {
          console.error(error);
          alert("Failed to fetch health factor!");
      }
  };

  return (
      <div>
          <h1>OmniFinance dApp</h1>
          <p>Connected Account: {account}</p>

          <h2>📊 Dashboard</h2>
          <button onClick={viewHealthFactor}>View Health Factor</button>
          <p>🔹 Health Factor: {healthFactor}</p>

          <h2>🔹 Staking</h2>
          <input type="number" placeholder="Days" onChange={(e) => setStakeDays(e.target.value)} />
          <input type="text" placeholder="ETH Amount" onChange={(e) => setStakeAmount(e.target.value)} />
          <button onClick={stake}>Stake</button>
          <button onClick={withdrawStake}>Withdraw Stake</button>

          <h2>🔹 Lending</h2>
          <input type="text" placeholder="Lend Amount (ETH)" onChange={(e) => setLendAmount(e.target.value)} />
          <button onClick={lend}>Lend</button>
          <button onClick={withdrawLend}>Withdraw Lend</button>

          <h2>🔹 Borrowing</h2>
          <button onClick={approveDai}>Approve DAI</button>
          <input type="text" placeholder="Collateral (DAI)" onChange={(e) => setCollateralAmount(e.target.value)} />
          <button onClick={depositCollateral}>Deposit Collateral</button>
          <input type="text" placeholder="Borrow Amount (ETH)" onChange={(e) => setBorrowAmount(e.target.value)} />
          <button onClick={borrow}>Borrow ETH</button>

          <h2>🔹 Repay</h2>
          <input type="text" placeholder="Repay ETH" onChange={(e) => setRepayAmount(e.target.value)} />
          <button onClick={repayDebt}>Repay</button>

          <h2>🔹 Liquidation</h2>
          <button onClick={liquidate}>Liquidate</button>
      </div>
  );
}

export default App;