pragma solidity ^0.5.0;

contract DataTypes {
    bool myBool = false;
    
    int8 myInt = -127;
    uint8 myUInt = 255;
    
    string myString;
    uint8[] myStringArr; // uint8[] is equivalent to string
    
    byte myValue;
    bytes1 myValue1; // byte is alias for bytes1
    
    // function myFunc(string s) public {
    // function myFunc(uint8[] s) public {
    // function myFunc(string[] s) public {
        
    // }
    
    // fixed256x8 myFixed = 1;
    // ufixed myFixed = 1;
    
    enum Action {ADD, REMOVE, UPDATE}
    
    Action myAction = Action.ADD;
    
    address payable myAddress;
    
    function assignAddress () public {
        myAddress = msg.sender;
        myAddress.balance;
        myAddress.transfer(10);
    }
    
    uint[] myIntArr = [1,2,3];
    
    function arrFunc() public {
        myIntArr.push(1);
        myIntArr.length;
        myIntArr[0];
    }
    
    uint[10] myFixedArr;

    struct Account {
        uint balance;
        uint dailyLimit;
    }

    Account myAccount;

    function structFunc() public {
        myAccount.balance;
        myAccount.dailyLimit = 100;
    }
}