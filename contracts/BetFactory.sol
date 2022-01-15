// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.11;

import './Bet.sol';
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";

contract BetFactory is KeeperCompatible {
    address private owner = msg.sender;
    Bet[] public bets;
    uint public numberOfBets;
    mapping(uint256 => Bet) public betsMap;

    receive() external payable {}

    function createBet(string memory _symbol, int _line, int _spread, int _maxBetSize, int _multiplier, uint _expiration) public {
        Bet _bet = new Bet(_symbol, _line, _spread, _maxBetSize, _multiplier, _expiration);
        bets.push(_bet);
        betsMap[numberOfBets] = _bet;
        numberOfBets++;
    }

    function getAllBets() public view returns (Bet[] memory) {
        return bets;
    }

    function getBetDetails(uint index) public view returns (string memory, int, int, uint) {
        Bet bet = betsMap[index];
        return bet.getBetDetails();
    }

    function resolveExistingBets() public {
        uint _betsLength = bets.length;
        for (uint8 _i = 0; _i < _betsLength; _i++) {
            Bet currentBet = bets[_i];
            if (block.timestamp > currentBet.expiration()) {
                currentBet.resolveBet();
                removeFromBets(_i);
                numberOfBets--;
                _betsLength--;
                _i--;
            }
        }
    }

    function checkUpkeep(
        bytes calldata /*checkData */
    ) external override view returns (bool upkeepNeeded, bytes memory) {
        return (bets.length > 0, bytes(''));
    }

    function performUpkeep(bytes calldata) external override {
        resolveExistingBets();
    }

    function removeFromBets(uint index) internal {
        bets[index] = bets[bets.length - 1];
        bets.pop();
    }
}
