import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Button, Modal, Form, Input, Message, Dropdown } from 'semantic-ui-react';
import { useWeb3 } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";
import { UnsupportedChainIdError } from "@web3-react/core";
import { ethers } from 'ethers';
import BetContract from '../contracts/Bet.json';
import BetFactoryContract from '../contracts/BetFactory.json';

// Timestamp already passed: 1642270684

const Home = () => {
  const sdk = new ThirdwebSDK("kovan");
  const { connectWallet, address, error, provider } = useWeb3();
  const signer = provider ? provider.getSigner() : undefined;
  const [bets, setBets] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [addressToBet, setAddressToBet] = useState('');
  const [overUnder, setOverUnder] = useState('over');
  const [valueToBet, setValueToBet] = useState(0);

  const overUnderOptions = [
    {
      key: 'over',
      text: 'Over',
      value: 'over',
    },
    {
      key: 'under',
      text: 'Under',
      value: 'under',
    },
  ];

  // const contractAddress = "0x11E3ce35E7Da7B135874bFAD00491160880BBa06";
  const contractAddress = "0x7f17d4e3353d397D29717D255083558447c9D9Bc";
  let betFactoryContract;

  if (signer) {
    betFactoryContract = new ethers.Contract(
      contractAddress,
      BetFactoryContract.abi,
      signer
    );
  }

  const onInputValueChange = (e, data) => {
    setValueToBet(data.value);
  }

  const onChange = (e, data) => {
    setOverUnder(data.value);
  }

  const formatDate = (date) => {
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

  const placeBet = async () => {
    try { 
      setLoading(true);
      const betContract = new ethers.Contract(
        addressToBet,
        BetContract.abi,
        signer
      );

      const overrides = {
        value: ethers.utils.parseEther(valueToBet),
      }

      await betContract.placeBet(overUnder, overrides);
      setLoading(false);
    } catch (e) {
      setErrorMessage(e.message);
      setLoading(false);
    }
  };

  const viewBet = (address) => {
    setAddressToBet(address);
    setErrorMessage('');
    setOpen(true);
  };

  useEffect(() => {
    if (!signer) {
      return;
    }

    getBets();
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
    <>
    <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.2/semantic.min.css"/>
    <div className="member-page">
        <h1 style={{ fontSize: "5rem" }}>SportsBetX</h1>
        <div>
          <div style={{ width: "100%" }}>
              <h2 style={{ fontSize: "1.5em" }}>Existing Bets</h2>
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
                        <button className="room-item" value={bet} onClick={() => viewBet(bet[4])}>
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
      <Modal
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
      >
      <Modal.Header>Place Your Bet</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <Form error={!!errorMessage}>
          <Form.Field>
            <label>Place Bet For</label>
            <Input
                label="eth"
                labelPosition="right"
                value={valueToBet}
                onChange={event => setValueToBet(event.target.value)}
            />
            </Form.Field>
            <Form.Field>
              <Dropdown
                placeholder='Select Over/Under'
                fluid
                selection
                onChange={onChange}
                options={overUnderOptions}
              />
            </Form.Field>
            <Message error header="Oops!" content={errorMessage} />
          </Form>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button color='black' onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button
          content="Place"
          labelPosition='right'
          icon='checkmark'
          onClick={() => placeBet()}
          positive
          loading={loading}
        />
      </Modal.Actions>
    </Modal>
    </>
  );
};

export { Home };
