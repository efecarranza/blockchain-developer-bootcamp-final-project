// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.11;

import './Bet.sol';
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";


contract BetFactory is KeeperCompatible {
    address private owner = msg.sender;
    Bet[] public bets;

    receive() external payable {}

    function createBet(string memory _symbol, uint _line, uint _spread, uint _maxBetSize, uint _multiplier) public {
        Bet bet = new Bet(_symbol, _line, _spread, _maxBetSize, _multiplier);
        bets.push(bet);
    }

    function checkIfBetsHaveExpired() public {
        for (uint8 i = 0; i < bets.length; i++) {
            Bet currentBet = bets[i];
            if (block.timestamp > currentBet.expiration()) {
                currentBet.resolveBet();
            }
        }
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
