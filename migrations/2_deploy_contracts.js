var BetFactory = artifacts.require("./BetFactory.sol");

module.exports = function(deployer) {
  deployer.deploy(BetFactory);
};
