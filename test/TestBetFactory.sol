// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.11;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/BetFactory.sol";
import "../contracts/Bet.sol";

contract TestBetFactory {
    BetFactory public betFactory;

    function beforeEach() public {
        betFactory = BetFactory(DeployedAddresses.BetFactory());
    }

    function testItCreatesNewBet() public {
        uint count = betFactory.numberOfBets();
        Assert.isZero(count, "It should be zero");

        betFactory.createBet("ETH/USD", 3400, 50, 1, 15, 1642270684);

        uint newCount = betFactory.numberOfBets();
        Assert.equal(1, newCount, "It should equal one");
    }

    function testItReturnsAllBets() public {
        Bet[] memory bets = betFactory.getAllBets();
        Assert.equal(1, bets.length, "It should return one (created in previous test)");
    }

    function testItReturnsDetailsForIDZero() public {
        (string memory symbol, int line, int spread, uint expiration) = betFactory.getBetDetails(0);

        int expectedLine = 3400 * 10**18;
        int expectedSpread = 50 * 10**18;

        Assert.equal("ETH/USD", symbol, "It should return ETH/USD");
        Assert.equal(expectedLine, line, "It should return 3400 for line");
        Assert.equal(expectedSpread, spread, "It should return 50 for the spread");
        Assert.equal(1642270684, expiration, "It should return 1642270684 for expiration");
    }
}
