// SPDX-License-Identifier: MIT
// Bookmaker2V01

// ███╗░░██╗███████╗███╗░░██╗░█████╗░███████╗██╗
// ████╗░██║██╔════╝████╗░██║██╔══██╗██╔════╝██║
// ██╔██╗██║█████╗░░██╔██╗██║██║░░██║█████╗░░██║
// ██║╚████║██╔══╝░░██║╚████║██║░░██║██╔══╝░░██║
// ██║░╚███║███████╗██║░╚███║╚█████╔╝██║░░░░░██║
// ╚═╝░░╚══╝╚══════╝╚═╝░░╚══╝░╚════╝░╚═╝░░░░░╚═╝

pragma solidity ^0.8.8;

import "./interface/IERC20Permit.sol";

contract Bookmaker2V01 {
    
    address public admin;
    address public betToken;

    mapping(address => mapping(uint8 => uint256)) userBet; //maps address to result to stake. Represents the shares of the stakes if the address wins

    uint256 public totalPot;
    uint256 public losersPot;
    uint256 public fee;
    uint256[2] public potPerResult;
    uint256 public gameStarts;
    uint8 public winner; 

    bool public claimable;
 
    event LogBet(address indexed better, uint256 amount, uint result);
    event LogClaim(address indexed claimer, uint256 amount);
    event logBatchBet(address indexed better, uint256[] amount);

    modifier onlyAdmin(){
        require(msg.sender == admin, "BOOKMAKER: NOT ADMIN");
        _;
    }

    constructor(address _betToken, uint256 _gameStarts){
        admin = msg.sender;
        betToken = _betToken;
        gameStarts = _gameStarts;
        claimable = false;
    }

    function bet(address _betToken, uint256 _amount, uint8 _result) external{
        require(_betToken == betToken, "BOOKMAKER: YOUR TOKEN AREN'T ACCEPTED");
        require(block.timestamp < gameStarts, "BOOKMAKER: BETS ARE NOT ACCEPTED");
        IERC20Permit(_betToken).transferFrom(msg.sender, address(this), _amount);
        userBet[msg.sender][_result] += _amount;
        potPerResult[_result] += _amount;
        totalPot += _amount;

        emit LogBet(msg.sender, _amount, _result);
    }

    function betWithPermit(uint256 _amount, uint256 _deadline, uint8 _result, uint8 v, bytes32 r, bytes32 s) external{
        require(block.timestamp < gameStarts, "BOOKMAKER: BETS ARE NOT ACCEPTED");

        IERC20Permit(betToken).permit(msg.sender, address(this), _amount, _deadline, v, r, s);
        IERC20Permit(betToken).transferFrom(msg.sender, address(this), _amount);
        userBet[msg.sender][_result] += _amount;
        potPerResult[_result] += _amount;
        totalPot += _amount;

        emit LogBet(msg.sender, _amount, _result);

    }

    function batchBet(uint256[] memory _amount) public {
        require(block.timestamp < gameStarts, "BOOKMAKER: BETS ARE NOT ACCEPTED");

        uint256 thisAmount;
        for(uint8 i=0; i < potPerResult.length; i++){
            IERC20Permit(betToken).transferFrom(msg.sender, address(this), _amount[i]);
            userBet[msg.sender][i] += _amount[i];
            potPerResult[i] += _amount[i];
            thisAmount += _amount[i];
        }
        totalPot += thisAmount;

        emit logBatchBet(msg.sender, _amount);
    }

    function getTotalPot() external view returns (uint256){
        return IERC20Permit(betToken).balanceOf(address(this));
    }

    function setWinner(uint8 _winner) external onlyAdmin{
        require(block.timestamp > gameStarts, "BOOKMAKER: GAME HAS NOT STARTED");
        winner = _winner;
        for(uint i=0; i < potPerResult.length; i++){
            if(i!=winner){
                losersPot += potPerResult[i];
            }
        }
        fee = losersPot*5/100;
        losersPot -= fee;
    }

    function claimWinnings() external {
        require(userBet[msg.sender][winner] > 0, "BOOKMAKER: USER HAS NOTHING TO CLAIM");
        require(claimable == true, "BOOKMAKER: STATE IS NOT CLAIMABLE");

        uint256 userWinnings = losersPot * userBet[msg.sender][winner] / potPerResult[winner];
        IERC20Permit(betToken).transfer(msg.sender, userWinnings + userBet[msg.sender][winner]);
        userBet[msg.sender][winner] = 0;

        emit LogClaim(msg.sender, userWinnings);
    }

    function getUserBet(address _address, uint8 _result) external view returns (uint256){
        return userBet[_address][_result];
    }

    function getPotPerResult(uint8 _result) external view returns (uint256){
        return potPerResult[_result];
    }

    function setClaimable(bool _claimable) external onlyAdmin{
        claimable = _claimable;
    }

    function claimFee() external onlyAdmin{
        IERC20Permit(betToken).transfer(admin, fee);
    }

    function emergencyWithdraw(address _token, uint256 _amount) external onlyAdmin{
        IERC20Permit(_token).transfer(admin, _amount);
    }
    
}