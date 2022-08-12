// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

// Import this file to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Bookmaker {
    using SafeMath for uint256;

    mapping(address => mapping(uint256 => uint256)) userBet;
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
        IERC20(_betToken).transferFrom(msg.sender, address(this), _amount);
        userBet[msg.sender][_result] += _amount;
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

    function getUserBet(uint256 _result) external view returns (uint256){
        return userBet[msg.sender][_result];
    }
}