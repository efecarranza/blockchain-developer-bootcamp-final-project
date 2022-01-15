import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { ThirdwebWeb3Provider } from '@3rdweb/hooks';

const supportedChainIds = [42];

const connectors = {
  injected: {},
};

ReactDOM.render(
  <React.StrictMode>
    <ThirdwebWeb3Provider
      connectors={connectors}
      supportedChainIds={supportedChainIds}
    >
      <App />
    </ThirdwebWeb3Provider>
  </React.StrictMode>,
  document.getElementById("root")
);