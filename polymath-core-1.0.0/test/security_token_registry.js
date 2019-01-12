import latestTime from './helpers/latestTime';
import { duration, ensureException } from './helpers/utils';
import { takeSnapshot, increaseTime, revertToSnapshot } from './helpers/time';

const TestSTOFactory = artifacts.require('./test/helpers/contracts/TestSTOFactory.sol');
const DummySTO = artifacts.require('./DummySTO.sol');
const ModuleRegistry = artifacts.require('./ModuleRegistry.sol');
const SecurityToken = artifacts.require('./SecurityToken.sol');
const SecurityTokenRegistry = artifacts.require('./SecurityTokenRegistry.sol');
const TickerRegistry = artifacts.require('./TickerRegistry.sol');
const STVersion = artifacts.require('./STVersionProxy001.sol');
const STVersion002 = artifacts.require('./STVersionProxy002.sol');
const GeneralPermissionManagerFactory = artifacts.require('./GeneralPermissionManagerFactory.sol');
const GeneralTransferManagerFactory = artifacts.require('./GeneralTransferManagerFactory.sol');
const GeneralTransferManager = artifacts.require('./GeneralTransferManager');
const GeneralPermissionManager = artifacts.require('./GeneralPermissionManager');
const PolyToken = artifacts.require('./PolyToken.sol');
const PolyTokenFaucet = artifacts.require('./helpers/contracts/PolyTokenFaucet.sol');

const Web3 = require('web3');
const BigNumber = require('bignumber.js');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545")) // Hardcoded development port


contract('SecurityTokenRegistry', accounts => {


    // Accounts Variable declaration
    let account_polymath;
    let account_investor1;
    let account_issuer;
    let token_owner;
    let account_investor2;
    let account_fundsReceiver;
    let account_delegate;
    let account_temp;

    let balanceOfReceiver;
    // investor Details
    let fromTime = latestTime();
    let toTime = latestTime() + duration.days(100);

    let ID_snap;
    const message = "Transaction Should Fail!!";

    // Contract Instance Declaration
    let I_GeneralPermissionManagerFactory;
    let I_GeneralTransferManagerFactory;
    let I_GeneralPermissionManager;
    let I_GeneralTransferManager;
    let I_ModuleRegistry;
    let I_TickerRegistry;
    let I_SecurityTokenRegistry;
    let I_TestSTOFactory;
    let I_STVersion;
    let I_SecurityToken;
    let I_DummySTO;
    let I_PolyFaucet;
    let I_STVersion002;
    let I_SecurityToken002;
    let I_STVersion003;
    // SecurityToken Details (Launched ST on the behalf of the issuer)
    const swarmHash = "dagwrgwgvwergwrvwrg";
    const name = "Demo Token";
    const symbol = "DET";
    const tokenDetails = "This is equity type of issuance";
    const decimals = 18;

    //Security Token Detials (Version 2)
    const swarmHash2 = "dagwrgwgvwergwrvwrg";
    const name2 = "Demo2 Token";
    const symbol2 = "DET2";
    const tokenDetails2 = "This is equity type of issuance";

    // Module key
    const permissionManagerKey = 1;
    const transferManagerKey = 2;
    const stoKey = 3;
    const budget = 0;

     // Capped STO details
     const cap = new BigNumber(10000).times(new BigNumber(10).pow(18));
     const someString = "Hello string";
     const functionSignature = {
         name: 'configure',
         type: 'function',
         inputs: [{
             type: 'uint256',
             name: '_startTime'
         },{
             type: 'uint256',
             name: '_endTime'
         },{
             type: 'uint256',
             name: '_cap'
         },{
             type: 'string',
             name: '_someString'
         }]
     };

    before(async() => {
        // Accounts setup
        account_polymath = accounts[0];
        account_issuer = accounts[1];
        account_investor1 = accounts[9];
        account_investor2 = accounts[6];
        account_fundsReceiver = accounts[4];
        account_delegate = accounts[5];
        account_temp = accounts[8];
        token_owner = account_issuer;

        // ----------- POLYMATH NETWORK Configuration ------------

        // Step 0: Deploy the token Faucet
        I_PolyFaucet = await PolyTokenFaucet.new();
        
        // STEP 1: Deploy the ModuleRegistry

        I_ModuleRegistry = await ModuleRegistry.new({ from: account_polymath });

        assert.notEqual(
            I_ModuleRegistry.address.valueOf(),
            "0x0000000000000000000000000000000000000000",
            "ModuleRegistry contract was not deployed"
        );

        // STEP 2: Deploy the GeneralTransferManagerFactory

        I_GeneralTransferManagerFactory = await GeneralTransferManagerFactory.new(I_PolyFaucet.address, { from: account_polymath });

        assert.notEqual(
            I_GeneralTransferManagerFactory.address.valueOf(),
            "0x0000000000000000000000000000000000000000",
            "GeneralTransferManagerFactory contract was not deployed"
        );

        // STEP 3: Deploy the GeneralDelegateManagerFactory

        I_GeneralPermissionManagerFactory = await GeneralPermissionManagerFactory.new(I_PolyFaucet.address, { from: account_polymath });

        assert.notEqual(
            I_GeneralPermissionManagerFactory.address.valueOf(),
            "0x0000000000000000000000000000000000000000",
            "GeneralDelegateManagerFactory contract was not deployed"
        );


        // STEP 4: Register the Modules with the ModuleRegistry contract

        // (A) :  Register the GeneralTransferManagerFactory
        await I_ModuleRegistry.registerModule(I_GeneralTransferManagerFactory.address, { from: account_polymath });
        await I_ModuleRegistry.verifyModule(I_GeneralTransferManagerFactory.address, true, { from: account_polymath });

        // (B) :  Register the GeneralDelegateManagerFactory
        await I_ModuleRegistry.registerModule(I_GeneralPermissionManagerFactory.address, { from: account_polymath });
        await I_ModuleRegistry.verifyModule(I_GeneralPermissionManagerFactory.address, true, { from: account_polymath });

        // Step 5: Deploy the TickerRegistry

        I_TickerRegistry = await TickerRegistry.new({ from: account_polymath });

        assert.notEqual(
            I_TickerRegistry.address.valueOf(),
            "0x0000000000000000000000000000000000000000",
            "TickerRegistry contract was not deployed",
        );

        // Step 6: Deploy the STversionProxy contract

        I_STVersion = await STVersion.new(I_GeneralTransferManagerFactory.address, I_GeneralPermissionManagerFactory.address, {from : account_polymath });

        assert.notEqual(
            I_STVersion.address.valueOf(),
            "0x0000000000000000000000000000000000000000",
            "STVersion contract was not deployed",
        );

        // STEP 8: Deploy the CappedSTOFactory

        I_TestSTOFactory = await TestSTOFactory.new(I_PolyFaucet.address, { from: token_owner });
        
        assert.notEqual(
            I_TestSTOFactory.address.valueOf(),
            "0x0000000000000000000000000000000000000000",
            "TestSTOFactory contract was not deployed"
        );

        // (C) : Register the STOFactory
        await I_ModuleRegistry.registerModule(I_TestSTOFactory.address, { from: token_owner });

        // Step 9: Deploy the SecurityTokenRegistry

        I_SecurityTokenRegistry = await SecurityTokenRegistry.new(
            I_PolyFaucet.address,
            I_ModuleRegistry.address,
            I_TickerRegistry.address,
            I_STVersion.address,
            {
                from: account_polymath
            });

        assert.notEqual(
            I_SecurityTokenRegistry.address.valueOf(),
            "0x0000000000000000000000000000000000000000",
            "SecurityTokenRegistry contract was not deployed",
        );

        // Step 8: Set the STR in TickerRegistry
        await I_TickerRegistry.setTokenRegistry(I_SecurityTokenRegistry.address, {from: account_polymath});
        await I_ModuleRegistry.setTokenRegistry(I_SecurityTokenRegistry.address, {from: account_polymath});



        // Printing all the contract addresses
        console.log(`\nPolymath Network Smart Contracts Deployed:\n
            ModuleRegistry: ${I_ModuleRegistry.address}\n
            GeneralTransferManagerFactory: ${I_GeneralTransferManagerFactory.address}\n
            GeneralPermissionManagerFactory: ${I_GeneralPermissionManagerFactory.address}\n
            TestSTOFactory: ${I_TestSTOFactory.address}\n
            TickerRegistry: ${I_TickerRegistry.address}\n
            STVersionProxy_001: ${I_STVersion.address}\n
            SecurityTokenRegistry: ${I_SecurityTokenRegistry.address}\n
        `);
    });

    describe("Generate the SecurityToken", async() => {

        it("Should register the ticker before the generation of the security token", async () => {
            let tx = await I_TickerRegistry.registerTicker(token_owner, symbol, name, swarmHash, { from : token_owner });
            assert.equal(tx.logs[0].args._owner, token_owner);
            assert.equal(tx.logs[0].args._symbol, symbol);
        });

        it("Should generate the new security token with the same symbol as registered above", async () => {
            let tx = await I_SecurityTokenRegistry.generateSecurityToken(name, symbol, decimals, tokenDetails, { from: token_owner });

            // Verify the successful generation of the security token
            assert.equal(tx.logs[1].args._ticker, symbol, "SecurityToken doesn't get deployed");

            I_SecurityToken = SecurityToken.at(tx.logs[1].args._securityTokenAddress);

            const LogAddModule = await I_SecurityToken.allEvents();
            const log = await new Promise(function(resolve, reject) {
                LogAddModule.watch(function(error, log){ resolve(log);});
            });

            // Verify that GeneralPermissionManager module get added successfully or not
            assert.equal(log.args._type.toNumber(), permissionManagerKey);
            assert.equal(
                web3.utils.toAscii(log.args._name)
                .replace(/\u0000/g, ''),
                "GeneralPermissionManager"
            );
            LogAddModule.stopWatching();
        });

        it("Should deploy the st vesrion 2", async() => {
            // Step 7: Deploy the STversionProxy contract

            I_STVersion002 = await STVersion002.new(I_GeneralTransferManagerFactory.address, I_GeneralPermissionManagerFactory.address, {from : account_polymath });

            assert.notEqual(
                I_STVersion002.address.valueOf(),
                "0x0000000000000000000000000000000000000000",
                "STVersion002 contract was not deployed",
            );
            await I_SecurityTokenRegistry.setProtocolVersion(I_STVersion002.address, "0.2.0", { from: account_polymath });

            assert.equal(
                web3.utils.toAscii(await I_SecurityTokenRegistry.protocolVersion.call())
                .replace(/\u0000/g, ''),
                "0.2.0"
            );
        });

        it("Should register the ticker before the generation of the security token", async () => {
            let tx = await I_TickerRegistry.registerTicker(token_owner, symbol2, name2, swarmHash, { from : token_owner });
            assert.equal(tx.logs[0].args._owner, token_owner);
            assert.equal(tx.logs[0].args._symbol, symbol2);
        });

        it("Should generate the new security token with version 2", async() => {
            let tx = await I_SecurityTokenRegistry.generateSecurityToken(name2, symbol2, decimals, tokenDetails, { from: token_owner });

            // Verify the successful generation of the security token
            assert.equal(tx.logs[1].args._ticker, symbol2, "SecurityToken doesn't get deployed");

            I_SecurityToken002 = SecurityToken.at(tx.logs[1].args._securityTokenAddress);

            const LogAddModule = await I_SecurityToken002.allEvents();
            const log = await new Promise(function(resolve, reject) {
                LogAddModule.watch(function(error, log){ resolve(log);});
            });

            // Verify that GeneralPermissionManager module get added successfully or not
            assert.equal(log.args._type.toNumber(), permissionManagerKey);
            assert.equal(
                web3.utils.toAscii(log.args._name)
                .replace(/\u0000/g, ''),
                "GeneralPermissionManager"
            );
            LogAddModule.stopWatching();
        });

        it("Should deploy the st vesrion 3", async() => {
            // Step 7: Deploy the STversionProxy contract

            I_STVersion003 = await STVersion002.new(I_GeneralTransferManagerFactory.address, I_GeneralPermissionManagerFactory.address, {from : account_polymath });

            assert.notEqual(
                I_STVersion003.address.valueOf(),
                "0x0000000000000000000000000000000000000000",
                "STVersion002 contract was not deployed",
            );
            await I_SecurityTokenRegistry.setProtocolVersion(I_STVersion003.address, "0.3.0", { from: account_polymath });

            assert.equal(
                web3.utils.toAscii(await I_SecurityTokenRegistry.protocolVersion.call())
                .replace(/\u0000/g, ''),
                "0.3.0"
            );
        });

        it("Should register the ticker before the generation of the security token", async () => {
            let tx = await I_TickerRegistry.registerTicker(token_owner, "DET3", name2, swarmHash, { from : token_owner });
            assert.equal(tx.logs[0].args._owner, token_owner);
            assert.equal(tx.logs[0].args._symbol, "DET3");
        });

        it("Should generate the new security token with version 3", async() => {
            let tx = await I_SecurityTokenRegistry.generateSecurityToken(name2, "DET3", decimals, tokenDetails, { from: token_owner });

            // Verify the successful generation of the security token
            assert.equal(tx.logs[1].args._ticker, "DET3", "SecurityToken doesn't get deployed");

            I_SecurityToken002 = SecurityToken.at(tx.logs[1].args._securityTokenAddress);

            const LogAddModule = await I_SecurityToken002.allEvents();
            const log = await new Promise(function(resolve, reject) {
                LogAddModule.watch(function(error, log){ resolve(log);});
            });

            // Verify that GeneralPermissionManager module get added successfully or not
            assert.equal(log.args._type.toNumber(), permissionManagerKey);
            assert.equal(
                web3.utils.toAscii(log.args._name)
                .replace(/\u0000/g, ''),
                "GeneralPermissionManager"
            );
            LogAddModule.stopWatching();
        });

        it("Should intialize the auto attached modules", async () => {
            let moduleData = await I_SecurityToken.modules(transferManagerKey, 0);
            I_GeneralTransferManager = GeneralTransferManager.at(moduleData[1]);

            assert.notEqual(
             I_GeneralTransferManager.address.valueOf(),
             "0x0000000000000000000000000000000000000000",
             "GeneralTransferManager contract was not deployed",
            );

            moduleData = await I_SecurityToken.modules(permissionManagerKey, 0);
            I_GeneralPermissionManager = GeneralPermissionManager.at(moduleData[1]);

            assert.notEqual(
             I_GeneralPermissionManager.address.valueOf(),
             "0x0000000000000000000000000000000000000000",
             "GeneralDelegateManager contract was not deployed",
            );
         });

         it("Should failed in attaching the STO factory with the security token -- because securityToken doesn't have sufficient balance", async () => {
            let bytesSTO = web3.eth.abi.encodeFunctionCall(
                functionSignature,
                [
                    (latestTime() + duration.seconds(500)),
                    (latestTime() + duration.days(30)),
                    cap,
                    someString,
                ]);

            let errorThrown = false;

            try {
                const tx = await I_SecurityToken.addModule(
                    I_TestSTOFactory.address,
                    bytesSTO,
                    (1000 * Math.pow(10, 18)),
                    (1000 * Math.pow(10, 18)),
                    true,
                    {
                        from: token_owner,
                        gas: 2500000
                    });
            } catch(error) {
                console.log(`Tx. get failed. Becuase securityToken doesn't have sufficient POLY to pay`);
                errorThrown = true;
            }
            assert.ok(errorThrown, message);
        });

        it("Should successfully attach the STO factory with the security token", async () => {
            let bytesSTO = web3.eth.abi.encodeFunctionCall(
                functionSignature,
                [
                    (latestTime() + duration.seconds(500)),
                    (latestTime() + duration.days(30)),
                    cap,
                    someString,
                ]);
            
            await I_PolyFaucet.getTokens((1000 * Math.pow(10, 18)), I_SecurityToken.address);

            const tx = await I_SecurityToken.addModule(
                I_TestSTOFactory.address,
                bytesSTO,
                (1000 * Math.pow(10, 18)),
                (1000 * Math.pow(10, 18)),
                true,
                {
                    from: token_owner,
                    gas: 2500000
                });
    
            assert.equal(tx.logs[3].args._type, stoKey, "TestSTO doesn't get deployed");
            assert.equal(
                web3.utils.toAscii(tx.logs[3].args._name)
                .replace(/\u0000/g, ''),
                "TestSTO",
                "TestSTOFactory module was not added"
            );

            I_DummySTO = DummySTO.at(tx.logs[3].args._module);
        });

    });



});
