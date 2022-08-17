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
    // mapping(uint256=>uint256) totalPotPerResult;

    uint256 public totalPot;
    uint256 public losersPot;
    uint256[3] public potPerResult;
    uint8 public winner; // 0 to bet for a win, 1 to bet for a draw, 2 to bet for a loss

    address public admin;

    bool public running;
 
    modifier onlyAdmin(){
        require(msg.sender == admin, "BOOKMAKER: NOT ADMIN");
        _;
    }

    constructor(address _betToken){
        admin = msg.sender;
        betToken = _betToken;
        running = true;
    }

    function bet(address _betToken, uint256 _amount, uint _result) external{
        require(running == true, "BOOKMAKER: BET HAS ENDED");
        IERC20(_betToken).transferFrom(msg.sender, address(this), _amount);
        userBet[msg.sender][_result] += _amount;
        potPerResult[_result] += _amount;
        totalPot += _amount;
    }

    function getTotalPot() external view returns (uint256){
        return IERC20(betToken).balanceOf(address(this));
    }

    function setWinner(uint8 _winner) external onlyAdmin{
        require(running == false, "BOOKMAKER: GAME HAS NOT ENDED");
        winner = _winner;
        for(uint i=0; i < potPerResult.length; i++){
            // console.log(potPerResult[i]);
            if(i!=winner){
                losersPot += potPerResult[i];
            }
        }
        // console.log(losersPot);
    }

    function claimWinnings() external {
        require(userBet[msg.sender][winner] >= 0, "BOOKMAKER: USER HAS NOTHING TO CLAIM");
        // console.log(losersPot);
        // console.log(potPerResult[winner]);
        // console.log(100*losersPot/potPerResult[winner]);
        uint256 userWinnings = losersPot * userBet[msg.sender][winner] / potPerResult[winner];
        console.log(userWinnings + userBet[msg.sender][winner]);
        IERC20(betToken).transfer(msg.sender, userWinnings + userBet[msg.sender][winner]);
        // console.log(totalPot);
    }

    function getUserBet(address _address, uint256 _result) external view returns (uint256){
        return userBet[_address][_result];
    }

    function getPotPerResult(uint8 _result) external view returns (uint256){
        return potPerResult[_result];
    }

    function setRunning(bool _running) external onlyAdmin{
        running = _running;
    }
}