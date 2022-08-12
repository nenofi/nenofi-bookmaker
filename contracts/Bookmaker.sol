// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Import this file to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Bookmaker {
    using SafeMath for uint256;

    mapping(address => mapping(uint152 => uint256)) userBet;
    address public betToken;
    uint256 public totalPot;
    uint256[3] public resultToOdds;
    address public admin;
 
    modifier onlyAdmin(){
        require(msg.sender == admin, "BOOKMAKER: NOT ADMIN");
        _;
    }

    constructor(address _betToken, uint256 _odds1, uint256 _odds2, uint256 _odds3){
        admin = msg.sender;
        betToken = _betToken;
        resultToOdds[0] = _odds1;
        resultToOdds[1] = _odds2;
        resultToOdds[2] = _odds3;
    }

    function bet(address _betToken, uint256 _amount, uint _result) external returns (bool){
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
}