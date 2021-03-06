# Project Idea - October 2021

Create a betting site where one can bet on specific metrics such as: the price of Ethereum at X date, the market cap ranking of a coin at X date, etc.
The funds cannot be withdrawn from the contract so that they are kept to distribute to bettors.
The book can be made and updated by the main entity.

I guess there is a main contract that can be accessed only by the manager, and that creates smaller contracts per bet.

# Project Implementation - December 2021

Simple bet project with contracts to bet on the price of Ethereum at a certain date. Leverages the power of Chainlink to get price feeds and perform bet close automatically. 

The front-end codes lives in the `client/` directory. The smart contracts are in `contracts/` and the tests are in `test/`. It follows the typical Truffle directory structure.
Compared to most common Truffle projects, this one utilizes `ethers.js` which I prefer to `web3.js`.

Ethereum Public Address: `0x59a340f6B6342434196513BEd190dc849541e10A`

# INSTALLATTION

1. From root of directory `npm i`
2. Run `truffle compile` to compile the contracts.
3. Run `ganache-cli` to start a local blockchain (port 8545).
4. From `client/` folder `npm i`
5. Run `npm run start` and front-end will show up on `localhost:3000`.
6. Set up MetaMask to work with localhost.
7. (Optional) Run `truffle test` from the root directory to run tests.

There's a "hidden" `/admin` site to create bets and resolve them, in the real world, it wouldn't work like this but to make it easy to test, I've added it to the main site.

There's also a registered Upkeep: `https://keepers.chain.link/kovan/2198` which checks whether there are outstanding bets and whether there's a need to perform an upkeep and automatically resolve bets.

# Live Site

sportsbetx.netlify.app

# Loom Walkthrough

https://www.loom.com/share/77b99884c8d844f2950f1852ea803824
