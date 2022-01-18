import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { ThirdwebWeb3Provider } from '@3rdweb/hooks';

const supportedChainIds = [42, 1642460893798];

const connectors = {
  injected: {},
};

ReactDOM.render(
    <ThirdwebWeb3Provider
      connectors={connectors}
      supportedChainIds={supportedChainIds}
    >
      <App />
    </ThirdwebWeb3Provider>,
  document.getElementById("root")
);