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



