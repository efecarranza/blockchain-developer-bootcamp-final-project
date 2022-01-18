import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Button, Modal, Form, Input, Message, Dropdown } from 'semantic-ui-react';
import { useWeb3 } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";
import { UnsupportedChainIdError } from "@web3-react/core";
import { ethers } from 'ethers';
import BetFactoryContract from '../contracts/BetFactory.json';

const Admin = () => {
  const sdk = new ThirdwebSDK("kovan");
  const { connectWallet, address, error, provider } = useWeb3();
  const signer = provider ? provider.getSigner() : undefined;
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [bets, setBets] = useState([]);
  const [open, setOpen] = useState(false);

  const [security, setSecurity] = useState('ETH/USD');
  const [line, setLine] = useState(0);
  const [spread, setSpread] = useState(0);
  const [maxBetSize, setMaxBetSize] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [expiration, setExpiration] = useState(0);

  const securityOptions = [
    {
      key: 'ETH/USD',
      text: 'ETH/USD',
      value: 'ETH/USD',
    }
  ];

  const contractAddress = "0xB1449312bB23Aa518C9Bdab6e6C4379B0290e3cE";
  let betFactoryContract;

  if (signer) {
    betFactoryContract = new ethers.Contract(
      contractAddress,
      BetFactoryContract.abi,
      signer
    );

    betFactoryContract.on("LogBetCreatedFromFactory", (_symbol, _line, _spread) => {
      window.location.href = "/";
    });
  }

  const onChange = (e, data) => {
    setSecurity(data.value);
  }

  const createBet = async () => {
    console.log(security);
    try {
      setLoading(true);
      await betFactoryContract.createBet(security, line, spread, maxBetSize, multiplier, expiration);
      setLoading(false);
    } catch (e) {
      setErrorMessage(e.message);
      setLoading(false);
    }
  };

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
        <h1 style={{ fontSize: "5rem" }}>Admin Site</h1>
        <div>
          <div style={{ width: "100%" }}>
          <button onClick={() => setOpen(true)} className="btn-hero">
            Create Bet
          </button>
              <h2 style={{ fontSize: "1.5em" }}>Existing Bets</h2>
              <table className="card">
                <thead>
                  <tr className="center-text">
                    <th>Symbol</th>
                    <th>Line</th>
                    <th>Spread</th>
                    <th>Expiration</th>
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
            <label>Create Bet Contract</label>
            <Form.Field>
              <Dropdown
                placeholder='Select Security'
                fluid
                selection
                onChange={onChange}
                options={securityOptions}
            />
            </Form.Field>
            <Form.Field>
            <Input
                label="line (in ETH)"
                labelPosition="right"
                value={line}
                onChange={event => setLine(event.target.value)}
            />
            </Form.Field>
            <Form.Field>
            <Input
                label="spread (in ETH)"
                labelPosition="right"
                value={spread}
                onChange={event => setSpread(event.target.value)}
            />
            </Form.Field>
            <Form.Field>
            <Input
                label="max bet size (in ETH)"
                labelPosition="right"
                value={maxBetSize}
                onChange={event => setMaxBetSize(event.target.value)}
            />
            </Form.Field>
            <Form.Field>
            <Input
                label="multiplier"
                labelPosition="right"
                value={multiplier}
                onChange={event => setMultiplier(event.target.value)}
            />
            </Form.Field>
            <Form.Field>
            <Input
                label="expiration (timestamp)"
                labelPosition="right"
                value={expiration}
                onChange={event => setExpiration(event.target.value)}
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
          onClick={() => createBet()}
          positive
          loading={loading}
        />
      </Modal.Actions>
    </Modal>
    </>
  );
};

export { Admin };