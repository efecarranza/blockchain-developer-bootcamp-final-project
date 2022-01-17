// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.11;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/// @title Bet factory contract.
/// @author Fermin Carranza
/// @notice Bet contract. Only ETH/USD currently supported.
contract Bet {
    /// Events - Publicize events to listeners.
    event LogUserPlacedBet(address _address, SideOfBet _side);
    event LogUserCancelledBet(address _address, SideOfBet _side);
    event LogPayoutToUser(address _payout, uint _amount);

    enum SideOfBet { OVER, UNDER, NONE }

    /// Chainlink price feed
    AggregatorV3Interface internal priceFeed;

    /// Structure that represents a placed bet by a user.
    struct PlacedBet {
        address bettor;
        SideOfBet side;
        uint betSize;
        bool isBetting;
    }

    /// Storage variables.
    address payable public owner = payable(msg.sender);
    bool public isLive = true;
    string public symbol;
    int public line;
    int public spread;
    int public maxBetSize;
    uint public expiration;
    int public payoutMultiplier; // Divide by 10 for float
    mapping (address => PlacedBet) public betsByUser;
    uint8 public numberOfBets = 0;
    uint public contractBalance;
    address[] public usersBetting;

    constructor(string memory _symbol, int _line, int _spread, int _maxBetSize, int _multiplier, uint _expiration) {
        symbol = _symbol;
        line = _line * 10**18;
        spread = _spread * 10**18;
        maxBetSize = _maxBetSize * 10**18;
        payoutMultiplier = _multiplier;
        expiration = _expiration;
        priceFeed = AggregatorV3Interface(0x9326BFA02ADD2366b30bacB125260Af641031331);
        // Rinkeby: 0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
        // Kovan:0x9326BFA02ADD2366b30bacB125260Af641031331
    }

    /// @notice Cancel an existing bet.
    /// @dev Only one bet per user currently supported.
    function cancelBet() public {
        require(betsByUser[msg.sender].isBetting == true, "User has no bet to cancel.");
        PlacedBet storage existingBet = betsByUser[msg.sender];
        uint valueToReturn = existingBet.betSize;

        require(contractBalance >= valueToReturn, "You are trying to withdraw too much Ether.");
        existingBet.isBetting = false;
        existingBet.betSize = 0;
        existingBet.side = SideOfBet.NONE;

        numberOfBets -= 1;
        contractBalance -= valueToReturn;
        removeFromUsersBetting(msg.sender);

        (bool sent,) = existingBet.bettor.call{value: valueToReturn}("");
        require(sent, "Failed to return Ether");

        emit LogUserPlacedBet(msg.sender, existingBet.side);
    }
    
    /// @notice Place a new bet.
    /// @dev Only one bet per user currently supported.
    /// @param _side The side to take on the bet (over/under).
    function placeBet(string memory _side) public payable {
        require(msg.sender != owner, "Creator cannot place bet.");
        require(betsByUser[msg.sender].isBetting == false, "User already has placed a bet.");
        SideOfBet sideTaken = getSideOfBetFromString(_side);
        usersBetting.push(msg.sender);
        PlacedBet memory newBet = PlacedBet({
            bettor: msg.sender,
            side: sideTaken,
            betSize: msg.value,
            isBetting: true
        });

        betsByUser[msg.sender] = newBet;
        numberOfBets += 1;
        contractBalance += msg.value;

        emit LogUserPlacedBet(msg.sender, sideTaken);
    }

    /// @notice List all users currently betting on this contract.
    /// @return Returns an array of addresses.
    function getAllUsersBetting() public view returns (address[] memory) {
        return usersBetting;
    }

    /// @notice Returns bet's details.
    /// @return Array containing: symbol, line, spread and expiration of bet.
    function getBetDetails() public view returns (string memory, int, int, uint) {
        return (symbol, line, spread, expiration);
    }

    /// @notice Utility method to return the enum value for side of bet taken.
    /// @dev Internal only.
    /// @return sideOfBet Side of bet taken.
    function getSideOfBetFromString(string memory _side) internal pure returns (SideOfBet sideOfBet) {
        if (keccak256(abi.encodePacked((_side))) == keccak256(abi.encodePacked(("over")))) {
            return SideOfBet.OVER;
        } else if (keccak256(abi.encodePacked((_side))) == keccak256(abi.encodePacked(("under")))) {
            return SideOfBet.UNDER;
        }

        require(false, "Side of bet must be either: 'over' or 'under'.");
    }

    /// @notice Returns current price of security (currently only supports ETH/USD).
    /// @dev Chainlink price feed.
    /// @return int Returns integer value of security price.
    function getCurrentPrice() public view returns (int) {
        (, int price, , , ) = priceFeed.latestRoundData();
        return price;
        // return 3500; // Test number
    }

    /// @notice Send funds to parent contract and self destruct.
    function kill(uint _outstandingBets) public {
        require(_outstandingBets == 0, "Contract still has unresolved bets");
        (bool success, ) = owner.call{value: contractBalance}("");
        require(success, "Failed to send Ether");
        selfdestruct(owner);
    }

    /// @notice Resolves an outstanding bet contract at expiration. If winner, send corresponding funds.
    function resolveBet() public {
        require(msg.sender == owner, "Only contract owner can resolve bet.");
        int currentPrice = getCurrentPrice() * (10**10);
        SideOfBet winningSide = SideOfBet.NONE;

        if (currentPrice > line + spread) {
            winningSide = SideOfBet.OVER;
        } else if (currentPrice < line - spread) {
            winningSide = SideOfBet.UNDER;
        }

        uint outstandingBets = numberOfBets;
        for (uint8 i = 0; i < numberOfBets; i++) {
            address userAddress = usersBetting[i];
            PlacedBet storage bet = betsByUser[userAddress];
            if (bet.isBetting && bet.side == winningSide) {
                payout(userAddress, bet.betSize);
            }

            outstandingBets--;
        }

        kill(outstandingBets);
    }

    /// @notice Send funds to winners of bet.
    function payout(address _bettor, uint _betSize) internal {
        uint toWithdraw = uint(_betSize) * uint(payoutMultiplier) / 10;
        require(contractBalance >= toWithdraw, "Insufficient funds to withdraw.");

        contractBalance -= toWithdraw;
        (bool success, ) = _bettor.call{value: toWithdraw}("");
        string memory failMessage = string(
            abi.encodePacked("Failed to send Ether to bet winner with address: ", _bettor)
        );
        require(success, failMessage);

        emit LogPayoutToUser(_bettor, toWithdraw);
    }

    /// @notice Removes a user from current bettors if user cancels.
    /// @dev Convenience method to remove from array.
    function removeFromUsersBetting(address _address) internal {
        uint256 index;
        for (uint i = 0; i < usersBetting.length; i++) {
            if (usersBetting[i] == _address) {
                index = i;
            }
        }
        usersBetting[index] = usersBetting[usersBetting.length - 1];
        usersBetting.pop();
    }
}
