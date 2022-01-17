I'm using the following patterns in my contracts:

1. Oracles: Utilizes Chainlink oracles to get data from outside the blockchain. I'm using the price feed to return the price of a security.
2. Factory Pattern: Create contracts from a base contract.
3. Inter-Contract Exectuion: with parent contract, calling/creating "child" contracts created by the factory.
4. Inheritance: Uses Chainlink keepers and extends the KeeperCompatible contract.
