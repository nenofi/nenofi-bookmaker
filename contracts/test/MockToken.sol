// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract MockToken is ERC20{

    uint8 public curDecimals;

    constructor(string memory _name, string memory _symbol, uint8 _decimals) ERC20(_name, _symbol){
        curDecimals = _decimals;
    }  

	function decimals() public view override returns (uint8) {
		return curDecimals;
	}

    function mint(address _to, uint256 _amount) external{
        _mint(_to, _amount);
    }

    function burn(address _vault, uint256 _amount) external{
        _burn(_vault, _amount);
    }
}