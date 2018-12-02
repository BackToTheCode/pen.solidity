pragma solidity ^0.5.0;

library Strings {
    function concat(string memory _base, string memory _value) internal pure returns (string memory) {
        bytes memory _baseBytes = bytes(_base);
        bytes memory _valueBytes = bytes(_value);
        
        string memory _tmpValue = new string(_baseBytes.length + _valueBytes.length);
        bytes memory _newValue = bytes(_tmpValue);
        
        uint i;
        uint j;
        for(i=0;i<_baseBytes.length;i++) {
            _newValue[j++] = _baseBytes[i]; 
        }
        
        for(i=0;i<_baseBytes.length;i++) {
            _newValue[j++] = _valueBytes[i]; 
        }
        
        return string(_newValue);
    }
    
    function strPos(string memory _base, string memory _value) internal returns (int) {
        bytes memory _baseBytes = bytes(_base);
        bytes memory _valueBytes = bytes(_value);
        
        assert(_valueBytes.length == 1);
        
        for (uint i=0; i < _baseBytes.length; i++) {
            if (_baseBytes[i] == _valueBytes[0]) {
                return int(i);
            }
        }
        
        return -1;
    }
}

contract TestStrings {
    
    using Strings for string;
    
    function testConcat(string memory _base) public pure returns (string memory) {
        return _base.concat("suffix");
    }
    
    function needInHayStack(string memory _base) public returns (int) {
        return _base.strPos("t");
    }
}