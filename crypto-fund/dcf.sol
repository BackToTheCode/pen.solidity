pragma solidity ^0.5.0;

interface dcf {
    // Max number of units in the fund 
    function totalSupply() external view returns (uint _totalSupply);

    // Number of units belonging to particular unit holder
    function balanceOf(address _owner) external view returns (uint balance);

    // Transfer units to another party
    function transfer(address _to, uint _value) external returns (bool success);

    // Transfer units from another party (not necessarily the sender) to a receiving party
    function transferFrom(address _from, address _to, uint _value) external returns (bool success);

    // Approve another address/contract to transfer units on your behalf
    function approve(address _spender, uint _value) external returns (bool success);

    // Check the allowance the amount of units another party has been given agency rights on
    function allowance(address _owner, address _spender) external view returns (uint remaining);

    // Check actual token balance
    function actualTokenBalance(bytes32 _symbol) external returns (uint balance);

    // Check target token balance
    function targetTokenBalance(bytes32 _symbol) external returns (uint balance);

    // Tranfer events to publish logs
    event Transfer(address indexed _from, address indexed _to, uint _value);
    event Approval(address indexed _owner, address indexed _spender, uint _value);


    // Ask whether a token is available for sale and get back the amount, value and price

    // Get the current target fund makeup

    // Get the actual fund makeup
}