pragma solidity ^0.4.21;

import "./CappedSTO.sol";
import "../../interfaces/IModuleFactory.sol";
import "../../interfaces/IModule.sol";


contract CappedSTOFactory is IModuleFactory {

    function CappedSTOFactory(address _polyAddress) public
      IModuleFactory(_polyAddress)
    {

    }

    function deploy(bytes _data) external returns(address) {
        polyToken.transferFrom(msg.sender, owner, getCost());
        //Check valid bytes - can only call module init function
        CappedSTO cappedSTO = new CappedSTO(msg.sender);
        //Checks that _data is valid (not calling anything it shouldn't)
        require(getSig(_data) == cappedSTO.getInitFunction());
        require(address(cappedSTO).call(_data));
        return address(cappedSTO);
    }

    function getCost() public view returns(uint256) {
        return 0;
    }

    function getType() public view returns(uint8) {
        return 3;
    }

    function getName() public view returns(bytes32) {
        return "CappedSTO";
    }

    function getDescription() public view returns(string) {
        return "Capped STO";
    }

    function getTitle() public view returns(string) {
        return "Capped STO";
    }

    function getInstructions() public view returns(string) {
        return "Initialises a capped STO. Init parameters are _startTime (time STO starts), _endTime (time STO ends), _cap (cap in tokens for STO), _rate (POLY/ETH to token rate), _fundRaiseType (whether you are raising in POLY or ETH), _polyToken (address of POLY token), _fundsReceiver (address which will receive funds)";
    }


}
