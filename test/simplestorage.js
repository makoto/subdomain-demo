const SimpleStorage = artifacts.require("./SimpleStorage.sol");
const ENSContract = artifacts.require('./ENSRegistry.sol');
const RegistrarContract = artifacts.require('./FIFSRegistrar.sol');
const ResolverContract = artifacts.require('./PublicResolver.sol');
var namehash = require('eth-ens-namehash');

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
    var ENS = require('ethereum-ens');    
    var provider = web3.eth.currentProvider;
    provider.sendAsync = provider.send;
    var tld = 'eth';
    var owner = accounts[0];
    var new_user = accounts[1];
    var ensi = await ENSContract.deployed();
    var registrari = await RegistrarContract.deployed();
    var resolveri = await ResolverContract.deployed();

    // await ensi.setSubnodeOwner(namehash.hash(tld), web3.utils.sha3('simplestorage'), registrari.address, {from: owner});
    await ensi.setSubnodeOwner(namehash.hash(tld), web3.utils.sha3('simplestorage'), simpleStorageInstance.address, {from: owner});

    var ens = new ENS(provider, ENSContract.address);
    console.log('owner', await ens.owner('simplestorage.eth'));  
    assert.equal(await ens.resolver('simplestorage.eth').addr(), accounts[0].toLowerCase());

    // setENS(ENS ensAddr, PublicResolver resolverAddr, FIFSRegistrar registrarAddr) public {
    // register(bytes32 label, bytes32 fullAddr) public {
    await simpleStorageInstance.setENS(ensi.address, resolveri.address, registrari.address);
    console.log('ens      ', await simpleStorageInstance.ens())
    console.log('resolver ', await simpleStorageInstance.resolver())
    console.log('registrar', await simpleStorageInstance.registrar())
    console.log('register', namehash.hash('simplestorage.eth'), web3.utils.sha3('makoto'), namehash.hash('makoto.simplestorage.eth'));

    await simpleStorageInstance.register(
      namehash.hash('simplestorage.eth'),
      web3.utils.sha3('makoto'),
      namehash.hash('makoto.simplestorage.eth'),
      {from:new_user}
    );
    assert.equal(await ens.resolver('makoto.simplestorage.eth').addr(), new_user.toLowerCase());
  })
});
