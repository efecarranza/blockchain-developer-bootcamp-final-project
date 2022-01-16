import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useWeb3 } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";
import { UnsupportedChainIdError } from "@web3-react/core";
import { ethers } from 'ethers';
import "./App.css";
import BetContract from './contracts/Bet.json';
import BetFactoryContract from './contracts/BetFactory.json';

// Deployed to Kovan: 0x966494b6e7920530c6F093cC37e50488466839DC
// Timestamp already passed: 1642270684

const App = () => {
  const sdk = new ThirdwebSDK("kovan");
  const { connectWallet, address, error, provider } = useWeb3();
  const signer = provider ? provider.getSigner() : undefined;
  const [bets, setBets] = useState([]);

  const contractAddress = "0x11E3ce35E7Da7B135874bFAD00491160880BBa06";
  let betFactoryContract;

  if (signer) {
    betFactoryContract = new ethers.Contract(
      contractAddress,
      BetFactoryContract.abi,
      signer
    );
  }

  const formatDate = (date) => {
    console.log(date);
    return new Date(date*1000).toLocaleDateString("en-US");
  };

  const getBets = useCallback(async () => {
    const allBets = await betFactoryContract.getAllBets();
    const betDetails = await Promise.all(
      allBets.map((element, index) => {
          return betFactoryContract.getBetDetails(index);
      })
    );
    setBets(betDetails);
  }, [provider, betFactoryContract]);

  const viewBet = () => {
    console.log('clicked view bet');
  };

  useEffect(() => {
    if (!signer) {
      return;
    }

    getBets();
  }, [provider]);

  useMemo(() => {
    if (!signer) {
      return;
    }

  }, [provider]);

  if (error instanceof UnsupportedChainIdError ) {
    return (
      <div className="unsupported-network">
        <h2>Please connect to Kovan</h2>
        <p>
          SportsBetX is only available in the Kovan network for now, please switch networks
          in your connected wallet.
        </p>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="landing">
        <h1>SportsBetX</h1>
        <button onClick={() => connectWallet("injected")} className="btn-hero">
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
  <div className="member-page">
    <h1>SportsBetX</h1>
    <div>
      <div style={{ width: "100%" }}>
          <h2>Existing Bets</h2>
          <table className="card">
            <thead>
              <tr className="center-text">
                <th>Symbol</th>
                <th>Line</th>
                <th>Spread</th>
                <th>Expiration</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bets.map((bet, i) => {
                return (
                  <tr key={i}>
                    <td>{bet[0]}</td>
                    <td>{ethers.utils.formatEther(bet[1].toString())}</td>
                    <td>50</td>
                    <td>{formatDate(bet[3].toString())}</td>
                    <td>
                    <button className="room-item" value={bet} onClick={() => viewBet()}>
                      Bet
                    </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
    </div>
  </div>
  );
};

export default App;
