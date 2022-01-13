// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.11;

import './Bet.sol';
import "@chainlink/contracts/src/v0.7/KeeperCompatible.sol";


contract BetFactory is KeeperCompatible {
    address private owner = msg.sender;
    Bet[] public bets;

    function createBet() public {
        Bet bet = new Bet();
        bets.push(bet);
    }

    function checkUpkeep(
        bytes calldata /*checkData */
    ) external override returns (bool upkeepNeeded, bytes memory) {
        upkeepNeeded = true;
    }

    function performUpkeep(bytes calldata) external override {
        return true;
    }
}
