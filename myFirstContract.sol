pragma solidity ^0.4.24;

interface Regulator {
    function checkValue(uint amount) returns (bool);
    function loan() returns (bool);
}

contract Bank is Regulator {
    uint private value;

    function deposit(uint amount) {
        value += amount;
    }

    function withdraw(uint amount) {
        if(checkValue(amount)) {
            value -= amount;
        }
    }

    function balance() returns (uint) {
        return value;
    }

    function checkValue(uint amount) returns (bool) {
        return amount <= value;
    }

    function loan() returns (bool) {
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

    // function loan() returns (bool) {
    //     return true;
    // }
}