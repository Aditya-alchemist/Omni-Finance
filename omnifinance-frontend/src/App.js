// App.js
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

// Update with your contract ABI and address
const contractAddress = "0xeacc4b2AcFADC31050690DEb11E6c3b652505Df1";
const daiAddress = "0x..."; // DAI contract address
const contractABI = [
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
    "name": "NO_ACTIVE_LOAN",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NO_ACTIVE_STAKE",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NOT_ENOUGH_LIQUIDITY",
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
    "name": "withdrawLend",
    "outputs": [],
    "stateMutability": "nonpayable",
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
    "inputs": [],
    "name": "withdrawStake",
    "outputs": [],
    "stateMutability": "nonpayable",
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
  }
];


function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [stakeDays, setStakeDays] = useState(0);
  const [collateralAmount, setCollateralAmount] = useState(0);
  const [repayAmount, setRepayAmount] = useState(0);

  // State for user positions
  const [userStake, setUserStake] = useState({});
  const [userLoan, setUserLoan] = useState({});
  const [lenderInfo, setLenderInfo] = useState({});

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
      
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0] || '');
        refreshData();
      });
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }
    
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    setAccount(accounts[0]);
    setSigner(signer);
    setContract(new ethers.Contract(contractAddress, contractABI, signer));
  };

  // Add these functions to your App component

const handleWithdrawStake = async () => {
  try {
    const tx = await contract.withdrawStake();
    await tx.wait();
    refreshData();
  } catch (error) {
    console.error('Withdraw stake failed:', error);
  }
};

const handleWithdrawLend = async () => {
  try {
    const tx = await contract.withdrawLend();
    await tx.wait();
    refreshData();
  } catch (error) {
    console.error('Withdraw lend failed:', error);
  }
};

const handleRepay = async () => {
  try {
    const tx = await contract.repayDebt(daiAddress, { 
      value: ethers.parseEther(repayAmount.toString())
    });
    await tx.wait();
    refreshData();
  } catch (error) {
    console.error('Repayment failed:', error);
  }
};

// Add these functions inside the component, typically after the handleBorrow function

  const refreshData = async () => {
    if (!contract || !account) return;
    
    try {
      const stake = await contract.stakes(account);
      const loan = await contract.borrowers(account);
      const lender = await contract.lender(account);
      
      setUserStake(stake);
      setUserLoan(loan);
      setLenderInfo(lender);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    refreshData();
  }, [contract, account]);

  // Stake Functions
  const handleStake = async (e) => {
    e.preventDefault();
    const ethAmount = e.target.ethAmount.value;
    if (!ethAmount || stakeDays <= 0) return;
    
    try {
      const tx = await contract.stake(stakeDays, { 
        value: ethers.parseEther(ethAmount)
      });
      await tx.wait();
      refreshData();
    } catch (error) {
      console.error('Staking failed:', error);
    }
  };

  // Lend Functions
  // Update the handleLend function with proper error decoding
const handleLend = async (e) => {
  e.preventDefault();
  const ethAmount = e.target.ethAmount.value;
  if (!ethAmount || Number(ethAmount) <= 0) {
    alert('Please enter a valid ETH amount');
    return;
  }

  try {
    const tx = await contract.lend({
      value: ethers.parseEther(ethAmount)
    });
    await tx.wait();
    refreshData();
  } catch (error) {
    console.error('Lending failed:', error);
    
    // Add custom error decoding
    if (error.data) {
      const decodedError = contract.interface.parseError(error.data);
      alert(`Lending failed: ${decodedError?.args.reason || decodedError?.name}`);
    } else {
      alert('Lending failed: ' + (error.reason || error.message));
    }
  }
};

  // Borrow Functions
  const handleBorrow = async () => {
    if (!collateralAmount) return;
    
    try {
      const daiContract = new ethers.Contract(daiAddress, [
        'function approve(address,uint256)'
      ], signer);
      
      const txApprove = await daiContract.approve(
        contractAddress, 
        ethers.parseUnits(collateralAmount.toString(), 18)
      );
      await txApprove.wait();
      
      const txBorrow = await contract.borrow(
        daiAddress, 
        ethers.parseUnits(collateralAmount.toString(), 18)
      );
      await txBorrow.wait();
      refreshData();
    } catch (error) {
      console.error('Borrow failed:', error);
    }
  };

  return (
    <div className="App">
      <header>
        <h1>OmniFinance</h1>
        {!account ? (
          <button onClick={connectWallet}>Connect Wallet</button>
        ) : (
          <div className="wallet-info">
            <span>Connected: {account.slice(0, 6)}...{account.slice(-4)}</span>
          </div>
        )}
      </header>

      <div className="sections-container">
        {/* Stake Section */}
        <section className="card">
          <h2>Staking</h2>
          <form onSubmit={handleStake}>
            <input
              type="number"
              name="ethAmount"
              placeholder="ETH amount"
              step="0.01"
              required
            />
            <input
              type="number"
              value={stakeDays}
              onChange={(e) => setStakeDays(e.target.value)}
              placeholder="Days"
              required
            />
            <button type="submit">Stake</button>
          </form>
          
          {userStake.amount > 0 && (
            <div className="user-info">
              <h3>Your Stake</h3>
              <p>Staked: {ethers.formatEther(userStake.amount)} ETH</p>
              <p>Remaining Days: {userStake.stakingDays - (
                Math.floor((Date.now()/1000 - userStake.startTime) / 86400)
              )}</p>
              <button onClick={handleWithdrawStake}>Withdraw</button>
            </div>
          )}
        </section>

        {/* Lend Section */}
        <section className="card">
          <h2>Lending</h2>
          <form onSubmit={handleLend}>
            <input
              type="number"
              name="ethAmount"
              placeholder="ETH amount"
              step="0.01"
              required
            />
            <button type="submit">Lend</button>
          </form>
          
          {lenderInfo.amount > 0 && (
            <div className="user-info">
              <h3>Your Lending</h3>
              <p>Deposited: {ethers.formatEther(lenderInfo.amount)} ETH</p>
              <p>Earnings: {ethers.formatEther(lenderInfo.totalInterestEarned)} ETH</p>
              <button 
                onClick={handleWithdrawLend}
                disabled={lenderInfo.borrowed}
              >
                Withdraw
              </button>
            </div>
          )}
        </section>

        {/* Borrow Section */}
        <section className="card">
          <h2>Borrowing</h2>
          <div className="input-group">
            <input
              type="number"
              value={collateralAmount}
              onChange={(e) => setCollateralAmount(e.target.value)}
              placeholder="DAI collateral"
            />
            <button onClick={handleBorrow}>Borrow</button>
          </div>
          
          {userLoan.isActive && (
            <div className="user-info">
              <h3>Your Loan</h3>
              <p>Borrowed: {ethers.formatEther(userLoan.borrowedAmount)} ETH</p>
              <p>Collateral: {ethers.formatUnits(userLoan.collateralAmount, 18)} DAI</p>
              <div className="input-group">
                <input
                  type="number"
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  placeholder="ETH to repay"
                />
                <button onClick={handleRepay}>Repay</button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;