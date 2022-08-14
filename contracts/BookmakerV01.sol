// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

// Import this file to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BookmakerV01 {
    using SafeMath for uint256;

    address public betToken;

    mapping(address => mapping(uint256 => uint256)) userBet; //maps address to result to stake. Represents the shares of the stakes if the address wins
    mapping(uint256=>uint256) totalPotPerResult;

    uint256 public totalPot;
    uint256[3] public resultToOdds;
    uint8 public winner; // 0 to bet for a win, 1 to bet for a draw, 2 to bet for a loss

    address public admin;
 
    modifier onlyAdmin(){
        require(msg.sender == admin, "BOOKMAKER: NOT ADMIN");
        _;
    }

    constructor(address _betToken){
        admin = msg.sender;
        betToken = _betToken;

    }

    function bet(address _betToken, uint256 _amount, uint _result) external returns (bool){
        IERC20(_betToken).transferFrom(msg.sender, address(this), _amount);
        userBet[msg.sender][_result] += _amount;
        totalPotPerResult[_result] += _amount;
        return true;
    }

    function oddsHomeWinning() external view returns (uint256){
        return resultToOdds[0];

    }

    function oddsDraw() external view returns (uint256){
        return resultToOdds[1];

    }

    function oddsHomeLosing() external view returns (uint256){
        return resultToOdds[2];
    }

    function getUserBet(address _address, uint256 _result) external view returns (uint256){
        return userBet[_address][_result];
    }

    function getTotalPot() external view returns (uint256){
        return IERC20(betToken).balanceOf(address(this));
    }

    function setWinner(uint8 _winner) external onlyAdmin{
        winner = _winner;
    }
}