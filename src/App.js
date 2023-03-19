import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import abi from './abi.json';

const NFT_LOTTERY_ADDRESS = "0x6189918cdDaEDe6FebD26d61cEa90e6cB643676e";
const NFT_LOTTERY_ABI = abi;

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [lotteryContract, setLotteryContract] = useState(null);
  const [name, setName] = useState("")
  const [balance, setBalance] = useState("")

  const [admin, isAdmin] = useState(false)

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to use this app.");
      return;
    }

    const newProvider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(newProvider);

    const newSigner = newProvider.getSigner();
    setSigner(newSigner);

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0]);

    const contract = new ethers.Contract(NFT_LOTTERY_ADDRESS, NFT_LOTTERY_ABI, newProvider);
    const withSigner = contract.connect(newSigner);
    setLotteryContract(withSigner);

    const balance = await newSigner.getBalance()
    console.log(balance)
    setBalance(parseFloat(ethers.utils.formatEther(balance)).toFixed(2));

    const address = await newSigner.getAddress();
    console.log(address)
    if (address === "0xBC72198d65075Fdad2CA7B8db79EfF5B51c8B30D") {
      isAdmin(true)
    }

    const { ethereum } = window;
    if(ethereum) {
      const ensProvider = new ethers.providers.InfuraProvider('mainnet');
      const address = await newSigner.getAddress();
      const displayAddress = address?.substr(0, 6) + "...";
      const ens = await ensProvider.lookupAddress(address);
      if (ens !== null) {
        setName(ens)
      } else {
        setName(displayAddress)
      }
    }
  };

  const purchaseTicket = async () => {
    if (!lotteryContract) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      const value = ethers.utils.parseEther("0.01");
      const transaction = await lotteryContract.purchaseTicket({ value });
      await transaction.wait();
      const balance = await signer.getBalance()
      setBalance(parseFloat(ethers.utils.formatEther(balance)).toFixed(2));
      alert("Ticket purchased successfully!");
    } catch (error) {
      console.error("Error purchasing ticket:", error);
    }
  };

  const resetLotto = async () => {
    try {
      const transaction = await lotteryContract.resetLottery("3");
      await transaction.wait();
      alert('lotto reset!')
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>EthLotto</h1>
        {account ? (
          <><p>Welcome {name}</p>
          <p className='balance'>{balance} ETH</p>
          
          {admin && (
            <button className="admin" onClick={resetLotto}>reset</button>
          )}
          
          </>
        ) : (
          <button className='connect' onClick={connectWallet}>Connect</button>
        )}
        <button onClick={purchaseTicket}>Purchase Ticket</button>
      </header>
    </div>
  );
}

export default App;
