// App.js

import { useState, useEffect } from 'react'
import './App.css'
import Web3 from 'web3';
import EscrowContract from '../build/contracts/EscrowContract.json';

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [contract, setContract] = useState(null);
  const [freelancerAddress, setFreelancerAddress] = useState("");
  const [amount, setAmount] = useState(0);

  async function initializeContract() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(accounts[0]);
        const web3 = new Web3(window.ethereum);
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = EscrowContract.networks[networkId];
        
        if (deployedNetwork) {
          const instance = new web3.eth.Contract(
            EscrowContract.abi,
            deployedNetwork.address
          );
          setContract(instance);
        } else {
          console.error("Contract not deployed to the current network");
        }
      } catch (error) {
        console.log('Error Connecting');
      }
    } else {
      alert('Meta mask not found');
    }
  }

  useEffect(() => {

    initializeContract();
  }, []);  // Run the effect only once when the component mounts

  async function deposit() {
    if (contract) {
      try {
        await contract.methods.deposit().send({ from: walletAddress, value: Web3.utils.toWei(amount.toString(), 'ether') });
      } catch (error) {
        console.error(error);
      }
    }
  }

  async function release() {
    if (contract) {
      try {
        await contract.methods.releaseToPayee().send({ from: walletAddress });
      } catch (error) {
        console.error(error);
      }
    }
  }

  async function withdraw() {
    if (contract) {
      try {
        await contract.methods.withdraw().send({ from: walletAddress });
      } catch (error) {
        console.error(error);
      }
    }
  }

  return (
    <>
      <div className="card">
        <button onClick={initializeContract}>
          Connect Wallet
        </button>
        <h3>Wallet Address: <span><h4>{walletAddress}</h4></span></h3>

        <div>
          <label>Freelancer Address:</label>
          <input type="text" value={freelancerAddress} onChange={(e) => setFreelancerAddress(e.target.value)} />
        </div>
        <div>
          <label>Amount (ETH):</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <button onClick={deposit}>
          Deposit to Escrow
        </button>
        <button onClick={release}>
          Release from Escrow
        </button>
        <button onClick={withdraw}>
          Withdraw from Escrow
        </button>
      </div>
    </>
  )
}

export default App
