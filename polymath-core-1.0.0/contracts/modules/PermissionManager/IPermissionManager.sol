pragma solidity ^0.4.21;

import "../../interfaces/IModule.sol";


contract IPermissionManager is IModule {

    function checkPermission(address _delegate, address _module, bytes32 _perm) public view returns(bool);

    function changePermission(address _delegate, address _module, bytes32 _perm, bool _valid) public returns(bool);

    function getDelegateDetails(address _delegate) public view returns(bytes32);

}
