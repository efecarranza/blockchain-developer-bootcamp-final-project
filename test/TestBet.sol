// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.11;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Bet.sol";

contract Test {
    Bet public betContract;

    function beforeEach() public {
        betContract = Bet(DeployedAddresses.Bet());
    }

    function testItPlacesNewBet() public {
        uint8 count = betContract.numberOfBets();
        Assert.isZero(count, "Count should be zero before placing bet.");

        betContract.placeBet('over');

        uint8 newCount = betContract.numberOfBets();
        Assert.equal(1, newCount, "New count should be 1 after bet is placed.");
    }

    function testGetAllUsersBetting() public {
        address[] memory usersBetting = betContract.getAllUsersBetting();
        Assert.equal(1, usersBetting.length, "It should have only one user right now.");
    }
}
