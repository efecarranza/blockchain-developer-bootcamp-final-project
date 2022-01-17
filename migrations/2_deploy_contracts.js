var BetFactory = artifacts.require("./BetFactory.sol");
var Bet = artifacts.require("./Bet.sol");

module.exports = function(deployer) {
  deployer.deploy(BetFactory);
  deployer.deploy(Bet, "ETH/USD", 3400, 50, 1, 15, 1642270684);
};
