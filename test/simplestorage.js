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
    const newuser = accounts[1];
    const anotheruser = accounts[2];
    const ensi = await ENSContract.deployed();
    const username = 'makoto';
    const domain = 'simplestorage';
    const fulldomain = `${domain}.${tld}`;

    // Set the ownership of the domain to your dapp contract
    await ensi.setOwner(namehash.hash(fulldomain), simpleStorageInstance.address, {from: owner});

    // Instantiate ENS with locally deployed ENS contract on ganache
    const ens = new ENS(provider, ENSContract.address);
    // Make sure that you have ownership of the fulldomain which was set at deployment.
    assert.equal(await ens.resolver(fulldomain).addr(), owner.toLowerCase());

    // Set ens address and fulldomain
    await simpleStorageInstance.setENS(ensi.address, namehash.hash(fulldomain));
    await simpleStorageInstance.register(web3.utils.sha3(username), {from:newuser});

    // Make sure that the eth address is set into the suddomain with the same ownership so that the user can control.
    assert.equal(await ens.resolver(`${username}.${fulldomain}`).addr(), newuser.toLowerCase());
    assert.equal(await ens.owner(`${username}.${fulldomain}`), newuser.toLowerCase());

    // Make sure that you cannot take the same username
    try {
      await simpleStorageInstance.register(web3.utils.sha3(username), {from:anotheruser}).catch(()=>{});
    } catch (err) {
      assert(err.reason === 'the user name taken');
    }
    assert.notEqual(await ens.resolver(`${username}.${fulldomain}`).addr(), anotheruser.toLowerCase());
    assert.notEqual(await ens.owner(`${username}.${fulldomain}`), anotheruser.toLowerCase());
  })
});
