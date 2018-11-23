pragma solidity ^0.4.24;

interface Regulator {
    function checkValue(uint amount) external returns (bool);
    function loan() external returns (bool);
}

contract Bank is Regulator {
    uint private value;
    address private owner;

    modifier isOwner {
        require(owner == msg.sender);
        _;
    }

    constructor (uint amount) public {
        value = amount;
        owner = msg.sender;
    }

    function deposit(uint amount) public isOwner {
        value += amount;
    }

    function withdraw(uint amount) public isOwner {
        if(checkValue(amount)) {
            value -= amount;
        }
    }

    function balance() public view returns (uint) {
        return value;
    }

    function checkValue(uint amount) public returns (bool) {
        return amount <= value;
    }

    function loan() public returns (bool) {
        return value > 0;
    }


}

contract MyFirstContract is Bank(10) {
    string private name;
    uint private age;
    
    function setName(string newName) public {
        name = newName;
    }
    
    function getName() public view returns (string) {
        return name;
    }
    
    function setAge(uint newAge) public {
        age = newAge;
    }
    
    function getAge() public view returns (uint) {
        return age;
    }

}

contract TestThrows {
    function testAssert() {
        assert(false);
    }

    function testRequire() {
        require(1 == 2);
    }

    function testRevert() {
        // Doesn't charge gas eg once an ICO is over
        revert();
    }

    function testThrow() {
        // Penalises on the gas price - consumes all gas
        throw;
    }
}