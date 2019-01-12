pragma solidity ^0.4.21;

/*
  Allows issuers to reserve their token symbols ahead of actually generating their security token.
  SecurityTokenRegistry would reference this contract and ensure that a token symbol exists here and
  only its owner can deploy the token with that symbol.
*/

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./interfaces/ITickerRegistry.sol";
import "./helpers/Util.sol";

/**
 * @title TickerRegistry
 * @dev Contract used to register the security token symbols
 */

contract TickerRegistry is ITickerRegistry, Ownable, Util {

    using SafeMath for uint256;
    // constant variable to check the validity to use the symbol
    // For now it's value is 90 days;
    uint256 public expiryLimit = 7 * 1 days;

    // SecuirtyToken Registry contract address
    address public strAddress;

    // Details of the symbol that get registered with the polymath platform
    struct SymbolDetails {
        address owner;
        uint256 timestamp;
        string tokenName;
        bytes32 swarmHash;
        bool status;
    }

    // Storage of symbols correspond to their details.
    mapping(string => SymbolDetails) registeredSymbols;

    // Emit after the symbol registration
    event LogRegisterTicker(address indexed _owner, string _symbol, string _name, bytes32 _swarmHash, uint256 _timestamp);
    // Emit when the token symbol expiry get changed
    event LogChangeExpiryLimit(uint256 _oldExpiry, uint256 _newExpiry);

    function TickerRegistry() public {

    }

    /**
     * @dev Register the token symbol for its particular owner
            Once the token symbol is registered to its owner then no other issuer can claim
            its ownership. If the symbol expires and its issuer hasn't used it, then someone else can take it.
     * @param _symbol token symbol
     * @param _tokenName Name of the token
     * @param _owner Address of the owner of the token
     * @param _swarmHash Off-chain details of the issuer and token
     */
    function registerTicker(address _owner, string _symbol, string _tokenName, bytes32 _swarmHash) public {
        require(bytes(_symbol).length > 0 && bytes(_symbol).length <= 10);
        string memory symbol = upper(_symbol);
        require(expiryCheck(symbol));
        registeredSymbols[symbol] = SymbolDetails(_owner, now, _tokenName, _swarmHash, false);
        emit LogRegisterTicker (_owner, symbol, _tokenName, _swarmHash, now);
    }

     /**
      * @dev Change the expiry time for the token symbol
      * @param _newExpiry new time period for token symbol expiry
      */
    function changeExpiryLimit(uint256 _newExpiry) public onlyOwner {
        require(_newExpiry >= 1 days);
        uint256 _oldExpiry = expiryLimit;
        expiryLimit = _newExpiry;
        emit LogChangeExpiryLimit(_oldExpiry, _newExpiry);
    }

    /**
     * @dev set the address of the Security Token registry
     * @param _stRegistry contract address of the STR
     * @return bool
     */
    function setTokenRegistry(address _stRegistry) public onlyOwner returns(bool) {
        require(_stRegistry != address(0) && strAddress == address(0));
        strAddress = _stRegistry;
        return true;
    }

    /**
     * @dev Check the validity of the symbol
     * @param _symbol token symbol
     * @param _owner address of the owner
     * @param _tokenName Name of the token
     * @return bool
     */
    function checkValidity(string _symbol, address _owner, string _tokenName) public returns(bool) {
        string memory symbol = upper(_symbol);
        require(msg.sender == strAddress);
        require(registeredSymbols[symbol].status != true);
        require(registeredSymbols[symbol].owner == _owner);
        require(registeredSymbols[symbol].timestamp.add(expiryLimit) >= now);
        registeredSymbols[symbol].tokenName = _tokenName;
        registeredSymbols[symbol].status = true;
        return true;
    }

    /**
     * @dev Returns the owner and timestamp for a given symbol
     * @param _symbol symbol
     */
    function getDetails(string _symbol) public view returns (address, uint256, string, bytes32, bool) {
        string memory symbol = upper(_symbol);
        if (registeredSymbols[symbol].status == true||registeredSymbols[symbol].timestamp.add(expiryLimit) > now) {
            return
            (
                registeredSymbols[symbol].owner,
                registeredSymbols[symbol].timestamp,
                registeredSymbols[symbol].tokenName,
                registeredSymbols[symbol].swarmHash,
                registeredSymbols[symbol].status
            );
        }else
            return (address(0), uint256(0), "", bytes32(0), false);
    }

    /**
     * @dev To re-initialize the token symbol details if symbol validity expires
     * @param _symbol token symbol
     */
    function expiryCheck(string _symbol) internal returns(bool) {
        if (registeredSymbols[_symbol].owner != address(0)) {
            if (now > registeredSymbols[_symbol].timestamp.add(expiryLimit) && registeredSymbols[_symbol].status != true) {
                registeredSymbols[_symbol] = SymbolDetails(address(0), uint256(0), "", bytes32(0), false);
                return true;
            }else
                return false;
        }
        return true;
    }





}
