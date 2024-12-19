import { Request, Response } from "express";
import UserWallet from "../db/model";
import ABI from './../meta.json';
import Web3 from "web3";
import {outcomes} from "./outcomes";
require('dotenv').config();


const OWNERPRIVATEKEY = process.env.OWNERPRIVATEKEY;
const CONTRACTADDRESS = process.env.CONTRACTADDRESS;
const OWNER_ADDRESS = process.env.CONTRACTADDRESS;
const TOTAL_DROPS = 16;
const MULTIPLIERS: {[ key: number ]: number} = {
  0: 16,
  1: 9,
  2: 2,
  3: 1.4,
  4: 1.4,
  5: 1.2,
  6: 1.1,
  7: 1,
  8: 0.5,
  9: 1,
  10: 1.1,
  11: 1.2,
  12: 1.4,
  13: 1.4,
  14: 2,
  15: 9,
  16: 16
}


export const deposit = async (req: Request, res: Response): Promise<any> => {
    try {
      const { walletAddress, depositAmount } = req.body;
      console.log("Entering deposit function", walletAddress, depositAmount);
  
      // Parse the amount as a number
      const parsedAmount = parseFloat(depositAmount); // Ensure 'amount' is converted to a number
      if (isNaN(parsedAmount)) {
        return res.status(400).json({ message: "Invalid amount provided" });
      }
  
      let user = await UserWallet.findOne({ walletAddress });
  
      if (!user) {
        // Create a new user with the given wallet address and deposited balance
        user = new UserWallet({ walletAddress, depositedBalance: parsedAmount });
        await user.save();
      } else {
        // Add the amount to the existing deposited balance and round to 3 decimal places
        user.depositedBalance = parseFloat(
          (user.depositedBalance + parsedAmount).toFixed(3)
        );
      }
  
      await user.save();
  
      res.status(200).json({
        message: "Deposit successful",
        depositedBalance: user.depositedBalance,
      });
    } catch (error) {
      console.error("Error in deposit function:", error);
      res.status(500).json({ message: "Something went wrong" });
    }
  };
  


export const withdraw = async (req: Request, res: Response): Promise<any> => {
    const { walletAddress, withdrawAmount } = req.body;
    console.log("got ca",process.env.CONTRACTADDRESS);
   
  
    // Validate request fields
    if (!walletAddress || !withdrawAmount) {
      return res.status(400).json({ message: "Invalid request data" });
    }
  
    try {
      const user = await UserWallet.findOne({ walletAddress });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const parsedWithdrawAmount = parseFloat(withdrawAmount);
  
      if (isNaN(parsedWithdrawAmount) || parsedWithdrawAmount <= 0) {
        return res.status(400).json({ message: "Invalid withdrawal amount" });
      }
  
      if (parsedWithdrawAmount > user.depositedBalance) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
  
      // Initialize Web3 and contract
      const web3 = new Web3("https://polygon-amoy.infura.io/v3/b1e4988ad2a04edca068e6605402af2e");
      console.log("im here", process.env.CONTRACTADDRESS);
      const contract = new web3.eth.Contract(ABI.abi, process.env.CONTRACTADDRESS);
  
      // Retrieve and log the owner address from the contract
      const contractOwner: string = await contract.methods.owner().call();
      console.log("Contract owner from smart contract:", contractOwner);
  
      // Derive the owner address from the private key
      const derivedOwner = web3.eth.accounts.privateKeyToAccount(OWNERPRIVATEKEY!).address;
      console.log("Owner derived from private key:", derivedOwner);
      console.log("OWNERPRIVATEKEY:", OWNERPRIVATEKEY);

  
      // Interact with the smart contract to transfer the reward
      const transaction = contract.methods.sendReward(walletAddress, web3.utils.toWei(withdrawAmount.toString(), "ether"));
  
      // Estimate gas and set gas price
      const gasEstimate = await transaction.estimateGas({ from: derivedOwner });
      const gasPrice = await web3.eth.getGasPrice(); // Fetch current gas price
  
      // Prepare transaction object
      const txObject = {
        to: CONTRACTADDRESS,
        data: transaction.encodeABI(),
        gas: gasEstimate,
        gasPrice, // Use fetched gas price
        from: derivedOwner,
      };
  
      // Sign the transaction
      const signedTx = await web3.eth.accounts.signTransaction(txObject, OWNERPRIVATEKEY!);
  
      // Send the signed transaction
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction || "");
  
      // On success, update the user's balance
      user.depositedBalance = parseFloat((user.depositedBalance - parsedWithdrawAmount).toFixed(3));
      await user.save();
  
      console.log("Transaction receipt:", receipt);
  
      res.status(200).json({
        message: "Withdrawal successful. Funds will be sent to your wallet within 24 hours.",
        transactionHash: receipt.transactionHash,
        updatedBalance: user.depositedBalance,
      });
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      res.status(500).json({ message: "Something went wrong during the withdrawal process" });
    }
  };

//   app.post("/update-balance",

  export const updateBalance = async (req: Request, res: Response): Promise<any> => {
    const { walletAddress, updatedBetAmount, bonusUsed, betAmount } = req.body;
    console.log(walletAddress, updatedBetAmount, bonusUsed, betAmount,"walletAddress, updatedBetAmount, bonusUsed, betAmount");
  
    // Validate fields
    if (!walletAddress || !updatedBetAmount || typeof bonusUsed === 'undefined' || !betAmount) {
      return res.status(400).json({ message: "Missing required fields in the request body." });
    }
  
    // Validate that updatedBetAmount and betAmount are positive numbers
    const parsedBetAmount = parseFloat(betAmount);
    const parsedUpdatedAmount = parseFloat(updatedBetAmount);
  
    if (isNaN(parsedBetAmount) || parsedBetAmount <= 0 || isNaN(parsedUpdatedAmount) || parsedUpdatedAmount < 0) {
      return res.status(400).json({ message: "Invalid amounts. Bet and winnings should be positive numbers." });
    }
  
    try {
      // Find the user wallet by walletAddress
      const user = await UserWallet.findOne({ walletAddress });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Deduct the bet amount from the user's balances
      if (user.bonus >= bonusUsed && bonusUsed > 0) {
        user.bonus -= bonusUsed;
      } else if (user.depositedBalance >= parsedBetAmount) {
        user.depositedBalance -= parsedBetAmount;
      } else {
        return res.status(400).json({ message: "Insufficient balance or bonus to place the bet." });
      }
  
      // Add winnings (if any) to the user's deposited balance
      user.depositedBalance += parsedUpdatedAmount;
  
      // Ensure balances are not negative (as a safeguard)
      if (user.bonus < 0) user.bonus = 0;
      if (user.depositedBalance < 0) user.depositedBalance = 0;
  
      // Save the updated user data
      await user.save();
  
      console.log("Updated balances:", {
        depositedBalance: user.depositedBalance,
        bonus: user.bonus,
      });
  
      // Return the updated balance to the client
      res.status(200).json({
        message: "Balances updated successfully",
        depositedBalance: user.depositedBalance,
        bonus: user.bonus,
      });
    } catch (error) {
      console.error("Error updating balance:", error);
      res.status(500).json({ message: "Something went wrong" });
    }
  };
  

//   app.get("/balance/:walletAddress", 
  export const getBalance = async (req : Request, res: Response): Promise<any> => {
    try {
    const { walletAddress } = req.params;
  
      // Find the user by wallet address
      const user = await UserWallet.findOne({ walletAddress });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Return the user's depositedBalance
      res.status(200).json({
        walletAddress: user.walletAddress,
        depositedBalance: user.depositedBalance,
        bonus: user.bonus,
      });
    res.status(200).json({walletAddress: "got this"});
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  };
  

  export const game = async (req : Request, res: Response) => {
    let outcome = 0;
    const pattern = [];
    for (let i = 0; i < TOTAL_DROPS; i++) {
      if (Math.random() > 0.5) {
        pattern.push("R");
        outcome++;
      } else {
        pattern.push("L");
      }
    }
  
    const multiplier = MULTIPLIERS[outcome];
    const possibleOutcomes = outcomes[outcome];
  
    res.send({
      point: possibleOutcomes[Math.floor(Math.random() * possibleOutcomes.length || 0)],
      multiplier,
      pattern,
    });
  };


  