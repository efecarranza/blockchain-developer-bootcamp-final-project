// license
//pragma

/*
* This main contract will be owned by a bookie, which will be in charge of adding the bets. 
* The bets will be "subcontracts" that will selfdestruct at a certain point 
* Utilizes Oracle for data gathering and fulfilling of contract
* Ideally, bets can be placed between two individual addresses, book takes cut.
* Other bets are between book and external user
*
* Got to figure out how to tie this all together when it's DEFI. 
* Do I have a worker checking hourly for closing bets? Where is the worker hosted?
* Where do I store past bets so that my bets that are self destructing are still accesible?
*
*
*
*
*/



interface IDefiBook { 
  // Region Private Methods
  
  function getMaxBetSize() returns (uint) {}; // calculates max bet size vs. book based on current contract holdings
  function payout() {}; // pays out funds after bet closes
  function takeCut() {}; 

  // Region Factory/Subcontracts

  function createNewBet(betType, spread, payout, deadline) void;
  function closeBet(betId); // destructs contract, pays out bets
  function checkUpcomingBets(deadline); // checks active bets expiring before passed data 

}
