import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [selectedBag, setSelectedBag] = useState("");
  const [notification, setNotification] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const bags = [
    { name: "Chanel", price: 20000 },
    { name: "Dior", price: 50000 },
    { name: "LV", price: 60000 },
    { name: "Zara", price: 30000 },
    { name: "Hermes", price: 25000 },
    { name: "Fendi", price: 15000 },
  ];

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(100000);
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(20000);
      await tx.wait();
      getBalance();
    }
  };

  const getAll = async () => {
    if (atm && balance !== undefined) {
      // Withdraw entire balance
      let tx = await atm.withdraw(balance);
      await tx.wait();
      getBalance();
    }
  };

  const buyBag = async () => {
    if (atm) {
      const bag = bags.find((b) => b.name === selectedBag);
      if (!bag) {
        alert("Please select a valid bag.");
        return;
      }

      if (balance < bag.price) {
        alert("Insufficient balance.");
        return;
      }

      try {
        let tx = await atm.withdraw(bag.price);
        setNotification(`Successfully bought ${bag.name} for ${bag.price} ETH. Transaction hash: ${tx.hash}`);
        await tx.wait();
        getBalance();
      } catch (error) {
        console.error("Error occurred while buying bag:", error);
        setNotification(`Failed to buy ${bag.name}. Please try again.`);
      }
    }
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Click this for proceed.</button>;
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <button onClick={deposit}>Deposit 100000 ETH</button>
        <button onClick={withdraw}>Withdraw 20000 ETH</button>
        <button onClick={getAll}>Collect all the ETH</button>
        <div>
          <select value={selectedBag} onChange={(e) => setSelectedBag(e.target.value)}>
            <option value="">Select a bag</option>
            {bags.map((bag) => (
              <option key={bag.name} value={bag.name}>
                {bag.name} - {bag.price} ETH
              </option>
            ))}
          </select>
          <button onClick={buyBag}>Buy Bag</button>
        </div>
        {notification && <p>{notification}</p>}
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header><h1>UpLift Bag!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          background-color: #f0f8ff;
          padding: 20px;
          border-radius: 10px;
        }
        header {
          background-color: #ff69b4;
          color: white;
          padding: 10px;
          border-radius: 10px;
        }
        p {
          margin: 10px 0;
        }
      `}</style>
    </main>
  );
}
