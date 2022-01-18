// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.11;

import './Bet.sol';
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";

/// @title Bet factory contract.
/// @author Fermin Carranza
/// @notice Basic contract to create bets. Only ETH/USD currently supported.
/// @dev Chainlink Keeper not currently working. Not production ready.
contract BetFactory is KeeperCompatible {
    /*
    / Events - Publicize events to external listeners.
    */
    event LogBetCreatedFromFactory(string symbol, int line, int spread);

    /// Storage variables
    address private owner = msg.sender;
    Bet[] public bets;
    uint public numberOfBets;
    mapping(uint256 => Bet) public betsMap;

    /// Receive Ether function.
    receive() external payable {}

    /// @notice Create a new bet for users to participate in. (Only ETH/USD currently supported)
    /// @param _symbol Ticker symbol of the security to bet on.
    /// @param _line The price at which contract settles at expiration.
    /// @param _spread Spread price can move from line.
    /// @param _maxBetSize The maximum amount a user can bet (in ETH).
    /// @param _multiplier The payout multiplier for winning bets.
    /// @param _expiration The expiration date of the bet.
    function createBet(string memory _symbol, int _line, int _spread, int _maxBetSize, int _multiplier, uint _expiration) public {
        Bet _bet = new Bet(_symbol, _line, _spread, _maxBetSize, _multiplier, _expiration);
        bets.push(_bet);
        betsMap[numberOfBets] = _bet;
        numberOfBets++;

        emit LogBetCreatedFromFactory(_symbol, _line, _spread);
    }

    /// @return Returns all outstanding bets.
    function getAllBets() public view returns (Bet[] memory) {
        return bets;
    }

    /// @notice Returns a specific bet's details.
    /// @param index The ID of the bet.
    /// @return Array containing: symbol, line, spread and expiration of bet.
    function getBetDetails(uint index) public view returns (string memory, int, int, uint, address) {
        Bet bet = betsMap[index];
        return bet.getBetDetails();
    }

    /// @notice Resolves outstanding bets if current time is greater than expiration.
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

    /// @notice Resolves a bet by ID
    /// @dev Used to resolve a bet and bypass the Chainlink Keeper
    function resolveBet(uint index) public {
        Bet currentBet = bets[index];
        removeFromBets(index);
        numberOfBets--;
        (bool success, ) = address(currentBet).call(abi.encodeWithSignature("resolveBet()"));
        require(success, "It failed to resolve bet.");
    }

    /// @notice Chainlink function to check if outside data should make it into the contract.
    /// @dev Currently not working.
    function checkUpkeep(
        bytes calldata /*checkData */
    ) external override view returns (bool upkeepNeeded, bytes memory) {
        return (bets.length > 0, bytes(''));
    }

    /// @notice Method to run if Chainlink determines the contract needs to perform an action.
    function performUpkeep(bytes calldata) external override {
        resolveExistingBets();
    }

    /// @notice Removes old bet from current bets array.
    /// @param index The ID of the bet to remove.
    /// @dev Utility method to remove old bet from current bets array.
    function removeFromBets(uint index) internal {
        bets[index] = bets[bets.length - 1];
        bets.pop();
    }
}
