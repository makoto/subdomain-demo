const SimpleStorage = artifacts.require("./SimpleStorage.sol");
const ENSContract = artifacts.require('./ENSRegistry.sol');

contract("SimpleStorage", accounts => {
  it("...should store the value 89.", async () => {
    const simpleStorageInstance = await SimpleStorage.deployed();

    // Set value of 89
    await simpleStorageInstance.set(89, { from: accounts[0] });

    // Get stored value
    const storedData = await simpleStorageInstance.get.call();

    assert.equal(storedData, 89, "The value 89 was not stored.");
  });

  it.only("...should set ens domain", async () => {
    var ENS = require('ethereum-ens');    
    var provider = web3.eth.currentProvider;
    provider.sendAsync = provider.send;
    var ens = new ENS(provider, ENSContract.address);
    console.log('owner', await ens.owner('simplestorage.eth'));  
    assert.equal(await ens.resolver('simplestorage.eth').addr(), accounts[0].toLowerCase());
    assert.equal(await ens.resolver('makoto.simplestorage.eth').addr(), accounts[0].toLowerCase());  
  })
});
