// ButtonClick.js

import React, { useState } from 'react';
import { ethers } from 'ethers'; // Import ethers library
import MyContractABI from './MyContractABI.js'; // Replace with your actual ABI

const ButtonClick = () => {
  const [buttonClicked, setButtonClicked] = useState(false);

  // Replace with your actual contract address
  const contractAddress = '0x8e6033b0dcd460b28257292690fa0ac0237f4f3d';
  const contractABI = MyContractABI; // Replace with your actual ABI

  // Connect to the Ethereum network
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, contractABI, signer);

  // Function to initiate payment
  const initiatePayment = async () => {
    try {
      // Replace the values with actual parameters
      const totalAmount = [0]; // Replace with your actual value
      const participants = ['0xParticipant1', '0xParticipant2']; // Replace with actual addresses

      // Call the smart contract function
      const transaction = await contract.initiatePayment(totalAmount, participants);

      // Wait for the transaction to be mined
      await transaction.wait();

      // Update the state or perform other actions
      setButtonClicked(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h1>My React Component</h1>
      <button onClick={initiatePayment}>Click me</button>

      {buttonClicked && <p>Button was clicked!</p>}
    </div>
  );
};

export default ButtonClick;
