# Changelog
All notable changes to this project will be documented in this file.   

## [Unreleased](https://github.com/PolymathNetwork/polymath-core/compare/npm-publish-2...master)

[__0.3.1__](https://www.npmjs.com/package/polymath-core?activeTab=readme) __06-04-18__

## Added
* Add `emit` keyword to emit the events.    
* Two new variable is added at the time of registeration of ticker. `swarmHash` represents the off-chain data storage location on IPFS and `owner` It reperesent the ethereum address of the owner.       
* `LogRegisterTicker` emits two more variable called `_swarmHash` and `_owner`.   
* Two events are added in `GeneralPermissionManager` contract to facilitate the notifications for the UI end.
          __`LogChangePermission`__ :Emit when permissions to a delegate get changed.    
          __`LogAddPermission`__: Emit when delegate is added in permission manager contract.   
* `getInstructions()` is a public function added into the factories contracts. Use to get the useful instructions about the corresponding factory.   
* `_securityTokenRegistry` is more argument is added in __securityTokenV2__ contract. 

## Changed
* All contracts get migrated from solc version 0.4.18 to 0.4.21. 
* Now symbols get stored in smart contract in uppercase instead of lowercase.    
* Public variable `STRAdress` name in TickerRegistry smart contract changed to `strAddress`.   
* Function `permissions()` name in all module factories get changed to `getPermissions()`.   
* Function `delegateDetails()` name gets changed to `getDelegateDetails()` in GeneralPermissionManager contract.      
* `STVersionProxy_001 & STVersionProxy_002` contract name changed to STVersionProxy001 & STVersionProxy002 respectively.   

***

[__0.3.0__](https://www.npmjs.com/package/polymath-core?activeTab=readme) __02-04-18__

## Added   
* Multiple events are added to `ModuleRegistry` contract to facilitate the Logging of the operations.   
        __`LogModuleUsed`__: Emit when Module get used by a securityToken.    
        __`LogModuleRegistered`__: Emit when a new module gets registered by the polymath for securityToken to use.   
        __`LogModuleVerified`__: Emit when module get verified by the ModuleRegistry owner.   
* ModuleRegistry now know about the SecurityTokenRegistry by using the function `setTokenRegistry` and it only is called by the owner of the ModuleRegistry contract.
* `verifyModule` function added to verify the newly added modules on the polymath platform. It is a type of ownable function.
* `securityTokenRegistry` public variable added to store the address of the SecurityTokenRegistry. And `verified` mapping added to hold the list of verified `moduleFactory` addresses with a bool flag.   
* Now `getSecurityTokenData()` is added to get the securityToken data instead of calling directly the public mapping `securityTokens`.   
* New variable `tokensSold` is added in the __cappedSTO__ contract. It is used to track the amount of securityTokens sold.  
* New moduleFactory called `ExchangeTransferManagerFactory` is added in to the list of the available modules in the Polymath V1 system.   
* **_budget** is a new parameter added in the `addModule`. It signifies the budget of the ongoing module in terms of __POLY__ token.   
* Two new events added into the securityToken contract to facilitate the logging of the operations.   
       __`LogModuleRemoved`__ : Event emit when module get removed from the securityToken.
       __`LogModuleBudgetChanged`__: Emit when module budget get changed.   
* `getModuleData` function added in the securityToken to get the data of the Module with the help of __moduleType__ and the __index of the module__ user want to get.   
* `removeModule` new function added facilitate the removal of the module from the securityToken. It is ownable type function.    
* `changeModuleBudget` function added to change the budget of the module that already been added. It is ownable type function.  

## Changed 
* In early release token symbol in uppercase or in lowercase entertain differently. But for this release both upercase and lowercase symbol name are same.   
* Address of the owner of the securityToken is removed from the strucuture of the `SecurityTokenData`. 
* Mapping `securityTokens` in ISecurityTokenRegistry is now being private instead of public.   
* `expiryLimit` default value get changed to 7 days instead of the 90 days in TickerRegistry.    
* __contact__ variable is replaced by the __tokenName__ variable in `SymbolDetails` structure of TickerRegistry.  
* Token name is now emitted in the `LogRegisterTicker` event corresponds to **_name** variable.    
* Now __checkValidity__ function takes three arguments insted of two, tokenName is the third one.
* __Cap__ is based on the number of securityToken sold instead of the quantity of the fundraised type.  
* __buyTokensWithPoly__ has only one argument called `_investedPoly` only. Beneficiary Address should be its msg.sender.    
* __getRaiseEther()__ function name changed to __getRaisedEther()__.   
* __getRaisePoly()__ function name changed to __getRaisedPoly()__.   
* `LogModuleAdded` emit one more variable called ___budget__.   
* `modules` mapping in the securityToken contract now returns __the array of ModuleData__.    

## Removed 
* `admin` varaible is removed from the TickerRegistry contract.    

***

[__0.2.0__](https://www.npmjs.com/package/polymath-core?activeTab=readme) __26-03-18__

## Added      
* ModuleRegistry contract will provide the list of modules by there types.  
* `SecurityTokenRegistry` is now working on the basis of the proxy version of the securitytoken contract. For that SecurityTokenRegistry has one more variable in the constructor called _STVersionProxy .   
* `setProtocolVersion` new function added in the SecurityTokenRegistry to set the protocol version followed to generate the securityToken. Only be called by the `polymath admin`.   
* `SecurityToken` now have the integration with polyToken. At the time of `addModule()` SecurityToken approve the cost of the module to moduleFactory as the spender.   
* New function `withdrawPoly(uint256 _amount)` is added to withdrawal the unused POLY from the securityToken contract. Called only by the owner of the contract.   
* `checkPermission(address _delegate, address _module, bytes32 _perm)` function is added to check the permissions on the service providers(delegate).
* `STVersionProxy_001.sol` & `STVersionProxy_002.sol` are the two new contract added. Both of those are the proxy contract use to generate the SecurityToken. Both contract constructor takes two variables address of `transferManagerFactory` address of the 
`permissionManagerFactory`.   
* New Module type is added called `PermissionManager`. It has three contracts called GeneralPermissionManagerFactory, GeneralPermissionManager, IPermissionManager. 
* `GeneralPermissionManger` is all about providing the permission to the delegate corresponds to the SecurityToken. Major functionality is added, check, change the permission of the delegate.   
* Two more functions added for each factory type i.e `getDescription()` & `getTitle()`.  
* `CappedSTO` is now Configurable by choosing the type of fundraise. Either POLY or ETH.
* `CappedSTO` takes 3 more constructor arguments fundRaiseType (uint8), the address of the polyToken & address of the fund's receiver.    
* `buyTokensWithPoly(address _beneficiary, uint256 _investedPoly)` new function added in cappedSTO to facilitate the funds raising with the POLY.   
* `verifyInvestment(address _beneficiary, uint256 _fundsAmount)` new function added in ISTO to check whether the investor provides the allowance to the CappedSTO or not.    
* `LogModifyWhitelist` event of GeneralTransferManager emit two more variables. i.e address which added the investor in whitelist(`_addedBy`) and records the timestamp at which modification in whitelist happen(`_dateAdded`).   
* `permissions()` function added in GeneralTransferManager to get all permissions.  
* `PolyToken.sol` contract is added at contracts/helpers/PolyToken.sol. For now, it has no big use.

## Changed 
* ModuleRegistry only holds the module type of modules only not there names or cost anymore.   
* No More ModuleReputation struct for counting the reputation of module. Now `reputation` mapping only contains the list of the addresses those used that module factory.    
* `checkModule()` of ModuleRegistry contract rename to `useModule()` with same function parameters.   
* Event `LogModuleAdded` emit only 5 variables instead of 6. timestamp is no longer be a part of the event.  
* `SecurityTokenRegistrar` now renamed as `SecurityTokenRegistry`.   
* Deployment of the securityToken is now performed by the proxy contracts and call being generated form the SecurityTokenRegistry.
* `TickerRegistrar` renamed as `TickerRegistry`.   
* TickerRegistry is now Ownable contract.
* `setTokenRegistrar` functio of TickerRegistry renamed to `setTokenRegistry`.   
* SecurityToken constructor has one change in the variable. i.e `_moduleRegistry` contract address is replaced by the `_owner` address.   
* Their is no `_perm` parameter in the `addModule()` function of the securityToken contract. Now only 4 parameters left.
* Type of Mudules changed    
      - Permission has a type 1        
      - TransferManager has a type 2    
      - STO has a type 3  
* Location of SecurityToken changed to `contracts/token/SecurityToken.sol`
* GeneralTransferManager takes only 1 variables as constructor argument i.e address of the securityToken.  
* Functions of GeneralTransferManager earlier controlled by the owner only, now those can be controlled by the delegates as well with having proper permissions.   

## Removed
* `getCost()` is removed from the ModuleRegistry contract.
* `SafeMath.sol` contract is replaced by the zeppelin-solidity library contract .  
*  No more `SecurityTokens` and `symbol` information will be directly part of the SecurityTokenRegistry. Those information will accessed by inheriting the `ISecurityTokenRegistry`.   
* Remove the Delegable.sol, AclHelpers.sol, DelegablePorting.sol contracts. Now permission manager factory takes their place . * `delegates` mapping removed from the GeneralTransferManager.  



