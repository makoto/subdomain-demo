const SimpleStorage = artifacts.require("./SimpleStorage.sol");
const ENSContract = artifacts.require('./ENSRegistry.sol');
const ENS = require('ethereum-ens');
const namehash = require('eth-ens-namehash');

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
    const simpleStorageInstance = await SimpleStorage.deployed();
    const provider = web3.eth.currentProvider;
    provider.sendAsync = provider.send;
    const tld = 'eth';
    const owner = accounts[0];
    const new_user = accounts[1];
    const ensi = await ENSContract.deployed();
    const username = 'makoto';
    const domain = 'simplestorage';
    const fulldomain = `${domain}.${tld}`;

    // Set the ownership of the domain to your dapp contract
    await ensi.setOwner(namehash.hash(fulldomain), simpleStorageInstance.address, {from: owner});

    // Instantiate ENS with locally deployed ENS contract on ganache
    const ens = new ENS(provider, ENSContract.address);

    assert.equal(await ens.resolver(fulldomain).addr(), owner.toLowerCase());

    await simpleStorageInstance.setENS(ensi.address, namehash.hash(fulldomain));
    await simpleStorageInstance.register(web3.utils.sha3(username), {from:new_user});

    assert.equal(await ens.resolver(`${username}.${fulldomain}`).addr(), new_user.toLowerCase());
    assert.equal(await ens.owner(`${username}.${fulldomain}`), new_user.toLowerCase());
  })
});
