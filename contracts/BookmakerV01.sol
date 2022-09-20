// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BookmakerV01 {
    bool public claimable;
    uint8 public winner; // 0 to bet for a win, 1 to bet for a draw, 2 to bet for a loss
    uint64 public gameStarts;

    address public admin;
    address public betToken;

    mapping(address => mapping(uint8 => uint256)) userBet; //maps address to result to stake. Represents the shares of the stakes if the address wins

    uint256 public totalPot;
    uint256 public losersPot;
    uint256 public fee;
    uint256[3] public potPerResult;

    event LogBet(address indexed better, uint256 amount, uint result);
    event LogClaim(address indexed claimer, uint256 amount);

    modifier onlyAdmin(){
        require(msg.sender == admin, "BOOKMAKER: NOT ADMIN");
        _;
    }

    constructor(address _betToken, uint64 _gameStarts){
        admin = msg.sender;
        betToken = _betToken;
        gameStarts = _gameStarts;
        claimable = false;
    }

    function bet(address _betToken, uint256 _amount, uint8 _result) external{
        require(_betToken == betToken, "BOOKMAKER: YOUR TOKEN AREN'T ACCEPTED");
        require(block.timestamp < gameStarts, "BOOKMAKER: BETS ARE NOT ACCEPTED");
        IERC20(_betToken).transferFrom(msg.sender, address(this), _amount);
        userBet[msg.sender][_result] += _amount;
        potPerResult[_result] += _amount;
        totalPot += _amount;

        emit LogBet(msg.sender, _amount, _result);
    }

    function getTotalPot() external view returns (uint256){
        return IERC20(betToken).balanceOf(address(this));
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
        IERC20(betToken).transfer(msg.sender, userWinnings + userBet[msg.sender][winner]);
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
        IERC20(betToken).transfer(admin, fee);
    }

    function emergencyWithdraw(address _token, uint256 _amount) external onlyAdmin{
        IERC20(_token).transfer(admin, _amount);
    }
    
}