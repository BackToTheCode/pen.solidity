pragma solidity ^0.4.0;

import "ERC20.sol";

contract MyFirstToken is ERC20 {
    string public constant symbol = "MFT";
    string public constant name = "My First Token";
    uint8 public constant decimals = 18;
    uint private constant __totalSupply = 1000;

    function totalSupply() constant returns (uint _totalSupply) {
        _totalSupply = __totalSupply;
    }
}