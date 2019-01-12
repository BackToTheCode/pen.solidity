import latestTime from './helpers/latestTime';
import { duration, ensureException } from './helpers/utils';
import takeSnapshot, { increaseTime, revertToSnapshot } from './helpers/time';

const CappedSTOFactory = artifacts.require('./CappedSTOFactory.sol');
const CappedSTO = artifacts.require('./CappedSTO.sol');
const DummySTOFactory = artifacts.require('./DummySTOFactory.sol');
const ModuleRegistry = artifacts.require('./ModuleRegistry.sol');
const SecurityToken = artifacts.require('./SecurityToken.sol');
const SecurityTokenRegistry = artifacts.require('./SecurityTokenRegistry.sol');
const TickerRegistry = artifacts.require('./TickerRegistry.sol');
const STVersion = artifacts.require('./STVersionProxy001.sol');
const GeneralPermissionManagerFactory = artifacts.require('./GeneralPermissionManagerFactory.sol');
const GeneralTransferManagerFactory = artifacts.require('./GeneralTransferManagerFactory.sol');
const GeneralTransferManager = artifacts.require('./GeneralTransferManager');
const GeneralPermissionManager = artifacts.require('./GeneralPermissionManager');
const PolyToken = artifacts.require('./PolyToken.sol');
const PolyTokenFaucet = artifacts.require('./helpers/contracts/PolyTokenFaucet.sol');

const Web3 = require('web3');
const BigNumber = require('bignumber.js');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545")) // Hardcoded development port


contract('ModuleRegistry', accounts => {


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
    let toTime = latestTime() + duration.days(15);

    let ID_snap;
    let message = "Transaction Should fail!";
    // Contract Instance Declaration
    let I_GeneralPermissionManagerFactory;
    let I_GeneralTransferManagerFactory;
    let I_GeneralPermissionManager;
    let I_GeneralTransferManager;
    let I_ModuleRegistry;
    let I_TickerRegistry;
    let I_SecurityTokenRegistry;
    let I_CappedSTOFactory;
    let I_STVersion;
    let I_SecurityToken;
    let I_CappedSTO;
    let I_PolyToken;
    let I_PolyFaucet;
    let I_DummySTOFactory;

    // SecurityToken Details (Launched ST on the behalf of the issuer)
    const swarmHash = "afdandjvvadkva";
    const name = "Demo Token";
    const symbol = "DET";
    const tokenDetails = "This is equity type of issuance";
    const decimals = 18;

    // Module key
    const permissionManagerKey = 1;
    const transferManagerKey = 2;
    const stoKey = 3;
    const budget = 0;

    // delagate details
    const delegateDetails = "I am delegate ..";
    const TM_Perm = 'FLAGS';

    // Capped STO details
    let startTime;
    let endTime;
    const cap = new BigNumber(10000).times(new BigNumber(10).pow(18));
    const rate = 1000;
    const fundRaiseType = 0;
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
            type: 'uint256',
            name: '_rate'
        },{
            type: 'uint8',
            name: '_fundRaiseType',
        },{
            type: 'address',
            name: '_polyToken'
        },{
            type: 'address',
            name: '_fundsReceiver'
        }
        ]
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

        // Step 0: Deploy the Polytoken Contract
        I_PolyToken = await PolyToken.new();

        // STEP 1: Deploy the ModuleRegistry

        I_ModuleRegistry = await ModuleRegistry.new({from:account_polymath});

        assert.notEqual(
            I_ModuleRegistry.address.valueOf(),
            "0x0000000000000000000000000000000000000000",
            "ModuleRegistry contract was not deployed"
        );

        // Step 6: Deploy the TickerRegistry

        I_TickerRegistry = await TickerRegistry.new({ from: account_polymath });

        assert.notEqual(
            I_TickerRegistry.address.valueOf(),
            "0x0000000000000000000000000000000000000000",
            "TickerRegistry contract was not deployed",
        );

        // Step 7: Deploy the STversionProxy contract

        // Step 9: Deploy the token Faucet
        I_PolyFaucet = await PolyTokenFaucet.new();

    });

    describe("Test case of the module registry", async() => {

        it("Should verify the ownership of the module registry", async () => {
            let _owner = await I_ModuleRegistry.owner.call();
            assert.equal(_owner, account_polymath, "Unauthenticated user deployed the contract");
        });

        it("Should successfully deployed the Module Fatories", async () => {

            I_GeneralTransferManagerFactory = await GeneralTransferManagerFactory.new(I_PolyToken.address, {from:account_polymath});

            assert.notEqual(
                I_GeneralTransferManagerFactory.address.valueOf(),
                "0x0000000000000000000000000000000000000000",
                "GeneralTransferManagerFactory contract was not deployed"
            );


            I_GeneralPermissionManagerFactory = await GeneralPermissionManagerFactory.new(I_PolyToken.address, {from:account_polymath});

            assert.notEqual(
                I_GeneralPermissionManagerFactory.address.valueOf(),
                "0x0000000000000000000000000000000000000000",
                "GeneralDelegateManagerFactory contract was not deployed"
            );


            I_CappedSTOFactory = await CappedSTOFactory.new(I_PolyToken.address, { from: account_polymath });

            assert.notEqual(
                I_CappedSTOFactory.address.valueOf(),
                "0x0000000000000000000000000000000000000000",
                "CappedSTOFactory contract was not deployed"
            );

            I_DummySTOFactory = await DummySTOFactory.new(I_PolyToken.address, { from: account_temp });

            assert.notEqual(
                I_DummySTOFactory.address.valueOf(),
                "0x0000000000000000000000000000000000000000",
                "GeneralTransferManagerFactory contract was not deployed"
            );
        });
    });

    describe("Test cases of register module", async() => {

        it("Should succssfully registered the module", async() => {
            let tx = await I_ModuleRegistry.registerModule(I_GeneralTransferManagerFactory.address, { from: account_polymath });

            assert.equal(
                tx.logs[0].args._moduleFactory,
                I_GeneralTransferManagerFactory.address,
                "GeneralTransferManagerFactory is not registerd successfully"
            );

            assert.equal(tx.logs[0].args._owner, account_polymath);

            tx = await I_ModuleRegistry.registerModule(I_GeneralPermissionManagerFactory.address, { from: account_polymath });

            assert.equal(
                tx.logs[0].args._moduleFactory,
                I_GeneralPermissionManagerFactory.address,
                "GeneralPermissionManagerFactory is not registerd successfully"
            );

            assert.equal(tx.logs[0].args._owner, account_polymath);

            tx = await I_ModuleRegistry.registerModule(I_CappedSTOFactory.address, { from: account_polymath });

            assert.equal(
                tx.logs[0].args._moduleFactory,
                I_CappedSTOFactory.address,
                "CappedSTOFactory is not registerd successfully"
            );

            assert.equal(tx.logs[0].args._owner, account_polymath);

        });

        it("Should fail in registering the same module again", async() => {
            let errorThrown = false;
            try {
                await I_ModuleRegistry.registerModule(I_GeneralPermissionManagerFactory.address, { from: account_polymath });
            } catch(error) {
                console.log(`Tx get failed. Already Registered Module factory`);
                errorThrown = true;
                ensureException(error);
            }
            assert.ok(errorThrown, message);
        });
    });

    describe("Test cases for verify module", async() => {

        it("Should fail in calling the verify module. Because msg.sender should be account_polymath", async () => {
            let errorThrown = false;
            try {
                await I_ModuleRegistry.verifyModule(I_GeneralPermissionManagerFactory.address, true, { from: account_temp });
            } catch(error) {
                console.log(`Tx get failed. Because msg.sender should be account_polymath`);
                errorThrown = true;
                ensureException(error);
            }
            assert.ok(errorThrown, message);
        });

        it("Should successfully verify the module -- true", async() => {
           let tx = await I_ModuleRegistry.verifyModule(I_GeneralPermissionManagerFactory.address, true, { from: account_polymath });
           assert.equal(
                tx.logs[0].args._moduleFactory,
                I_GeneralPermissionManagerFactory.address,
                "Failed in verifying the module"
            );
            assert.equal(
                tx.logs[0].args._verified,
                true,
                "Failed in verifying the module"
            );
        });

        it("Should successfully verify the module -- false", async() => {
            let tx = await I_ModuleRegistry.verifyModule(I_CappedSTOFactory.address, false, { from: account_polymath });
            assert.equal(
                 tx.logs[0].args._moduleFactory,
                 I_CappedSTOFactory.address,
                 "Failed in verifying the module"
             );
             assert.equal(
                 tx.logs[0].args._verified,
                 false,
                 "Failed in verifying the module"
             );
         });

         it("Should fail in verifying the module. Because the module is not registered", async() => {
            let errorThrown = false;
            try {
                await I_ModuleRegistry.verifyModule(I_DummySTOFactory.address, true, { from: account_polymath });
            } catch(error) {
                console.log(`Tx get failed. Because the module is not registered`);
                errorThrown = true;
                ensureException(error);
            }
            assert.ok(errorThrown, message);
         });
    });

    describe("Deploy the security token registry contract", async() => {

        it("Should successfully deploy the STR", async() => {
            let tx = await I_ModuleRegistry.verifyModule(I_GeneralTransferManagerFactory.address, true, { from: account_polymath });
           assert.equal(
                tx.logs[0].args._moduleFactory,
                I_GeneralTransferManagerFactory.address,
                "Failed in verifying the module"
            );
            assert.equal(
                tx.logs[0].args._verified,
                true,
                "Failed in verifying the module"
            );

            I_STVersion = await STVersion.new(I_GeneralTransferManagerFactory.address, I_GeneralPermissionManagerFactory.address, {from : account_polymath });

            assert.notEqual(
                I_STVersion.address.valueOf(),
                "0x0000000000000000000000000000000000000000",
                "STVersion contract was not deployed",
            );

            // Deploy the SecurityTokenRegistry

            I_SecurityTokenRegistry = await SecurityTokenRegistry.new(
                I_PolyToken.address,
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

            // Set the STR in TickerRegistry
            await I_TickerRegistry.setTokenRegistry(I_SecurityTokenRegistry.address, {from: account_polymath});
        });
    })

    describe("Test cases for the setTokenRegistry", async() => {

        it("Should fail in set the securityTokenRegistry. Because msg.sender is not the owner", async() => {
            let errorThrown = false;
            try {
                await I_ModuleRegistry.setTokenRegistry(I_SecurityTokenRegistry.address, { from: account_temp });
            } catch(error) {
                console.log(`Tx get failed. Because msg.sender should be account_polymath`);
                errorThrown = true;
                ensureException(error);
            }
            assert.ok(errorThrown, message);
        });

        it("Should successfully set the STR address", async() => {
            await I_ModuleRegistry.setTokenRegistry(I_SecurityTokenRegistry.address, { from: account_polymath });
            assert.equal(
                (await I_ModuleRegistry.securityTokenRegistry.call()),
                I_SecurityTokenRegistry.address,
                "Failed in setting the address of the securityTokenRegistry"
            );
        });
    });

    describe("Launch of SecurityToken", async() => {

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
    });

    describe("test cases for useModule", async() => {

        it("Sholud fail in adding module. Because module is un-verified", async() => {
            startTime = latestTime() + duration.seconds(5000);
            endTime = startTime + duration.days(30);
            let bytesSTO = web3.eth.abi.encodeFunctionCall(functionSignature, [startTime, endTime, cap, rate, fundRaiseType, I_PolyToken.address, account_fundsReceiver]);
            let errorThrown = false;
            try {
                const tx = await I_SecurityToken.addModule(I_CappedSTOFactory.address, bytesSTO, 0, 0, true, { from: token_owner, gas: 5000000 });
            } catch(error) {
                errorThrown = true;
                console.log(`Tx get failed. Because module is un-verified`);
                ensureException(error);
            }
            assert.ok(errorThrown, message);
        });

        it("Should successfully add the CappedSTO module. Because module is deployed by the owner of ST", async() => {
            I_CappedSTOFactory = await CappedSTOFactory.new(I_PolyToken.address, { from: token_owner });

            assert.notEqual(
                I_CappedSTOFactory.address.valueOf(),
                "0x0000000000000000000000000000000000000000",
                "CappedSTOFactory contract was not deployed"
            );

            let tx = await I_ModuleRegistry.registerModule(I_CappedSTOFactory.address, { from: token_owner });

            assert.equal(
                tx.logs[0].args._moduleFactory,
                I_CappedSTOFactory.address,
                "CappedSTOFactory is not registerd successfully"
            );

            assert.equal(tx.logs[0].args._owner, token_owner);

            startTime = latestTime() + duration.seconds(5000);
            endTime = startTime + duration.days(30);
            let bytesSTO = web3.eth.abi.encodeFunctionCall(functionSignature, [startTime, endTime, cap, rate, fundRaiseType, I_PolyToken.address, account_fundsReceiver]);

            tx = await I_SecurityToken.addModule(I_CappedSTOFactory.address, bytesSTO, 0, 0, true, { from: token_owner, gas: 5000000 });

            assert.equal(tx.logs[3].args._type, stoKey, "CappedSTO doesn't get deployed");
            assert.equal(
                web3.utils.toAscii(tx.logs[3].args._name)
                .replace(/\u0000/g, ''),
                "CappedSTO",
                "CappedSTOFactory module was not added"
            );
        });
    });

  });
