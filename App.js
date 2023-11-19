import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import TokenConverter from "./contracts/TokenConverter.json";
import PaymentRequest from "./contracts/PaymentRequest.json";
import ButtonClick from "./component/ButtonClick";
import contractABI from "./component/MyContractABI";
import Layout.js from "./component/Layout.js";

const App = () => {
  const [provider, setProvider] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [metamaskConnected, setMetamaskConnected] = useState(false);
  const [tokenConverter, setTokenConverter] = useState(null);
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [ethToUsdPrice, setEthToUsdPrice] = useState(null);
  const [initiatorAddress, setInitiatorAddress] = useState('');
  const [splitMode, setSplitMode] = useState('');
  const [showAmounts, setShowAmounts] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedToken, setSelectedToken] = useState('');
  const [customPayments, setCustomPayments] = useState([{ address: '', amount: 0 }]);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const initEthers = async () => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (newAccounts) => {
        setAccounts(newAccounts);
      });

      window.ethereum.on('chainChanged', (chainId) => {
        console.log("Chain changed:", chainId);
      });
    }

    if (window.ethereum) {
      const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(ethProvider);

      const accs = await ethProvider.listAccounts();
      setAccounts(accs);
      setMetamaskConnected(true);

      if (accs.length > 0) {
        setInitiatorAddress(accs[0]);
      }

      const tokenConverterContract = new ethers.Contract(
        "0xa1be020d062fecb618e9b38bdd2f39a3626f5df5",
        TokenConverter.abi,
        ethProvider.getSigner()
      );
      setTokenConverter(tokenConverterContract);

      const paymentRequestContract = new ethers.Contract(
        "0xc9e6e3f8ae85ce4c1a73b58d5a02c2349598bb77",
        PaymentRequest.abi,
        ethProvider.getSigner()
      );
      setPaymentRequest(paymentRequestContract);

      const ethToUsd = await tokenConverterContract.getETHToUSDPrice();
      setEthToUsdPrice(ethToUsd);
    } else {
      console.log("No Ethereum browser extension detected, install MetaMask.");
    }
  };


const handlePay = async () => {
  try {
    const transaction = {
      to: paymentRequest.address, // Address of the PaymentRequest contract
      value: ethers.utils.parseEther(paymentAmount.toString()), // Convert ETH to Wei
    };

    const signer = provider.getSigner();
    const signedTransaction = await signer.sendTransaction(transaction);

    // You may want to refresh the UI or show a success message
    console.log("Paid successful", signedTransaction);

    // Call the PaymentRequest contract function to handle the payment on the backend
    await paymentRequest.pay(paymentAmount, { value: transaction.value });

    // You can add additional logic here based on the payment status from the backend
  } catch (error) {
    // Handle the error (e.g., display an error message)
    console.error("Paid failed", error);
  }
};



  useEffect(() => {
    initEthers();
  }, []);

  return (
    <div>
      <h4>ETH to USD Price: {ethToUsdPrice !== null ? ethToUsdPrice.toString() : 'Loading...'}</h4>

      {metamaskConnected && (
        <div>
          <p>Connected Account: {accounts.length > 0 ? accounts[0] : "No account connected"}</p>

          <h2>initiate to Pay the bill</h2>
          <label>
            Payment Amount (ETH):
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
          </label>
          <button onClick={handlePay}>Pay</button>
        </div>
      )}

      {/* Add your additional React component UI elements */}
    </div>
  );
};

export default App;
