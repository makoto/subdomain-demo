var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var ENS = artifacts.require('@ensdomains/ens/ENSRegistry.sol');
var PublicResolver = artifacts.require('@ensdomains/ens/PublicResolver.sol');
var ReverseRegistrar = artifacts.require('@ensdomains/ens/ReverseRegistrar.sol');
var FIFSRegistrar = artifacts.require('@ensdomains/ens/FIFSRegistrar.sol');

var namehash = require('eth-ens-namehash');

module.exports = async function(deployer) {
  var tld = 'eth';
  var domain = 'simplestorage';
  var accounts = await web3.eth.getAccounts();
  var owner = accounts[0];
  await deployer.deploy(SimpleStorage);
  var simpleStorage = await SimpleStorage.deployed();
  var root = web3.utils.asciiToHex(0);

  await deployer.deploy(ENS);
  var ens = await ENS.deployed();
  await deployer.deploy(PublicResolver, ENS.address);
  await deployer.deploy(ReverseRegistrar, ENS.address, PublicResolver.address);
  await deployer.deploy(FIFSRegistrar, ENS.address, root);
  var resolver = await PublicResolver.deployed();
  var registrar = await FIFSRegistrar.deployed();
  console.log("resolver", resolver.address)
  console.log("registrar", registrar.address)
  console.log(1)
  await ens.setSubnodeOwner(root, web3.utils.sha3(tld), owner, {from: owner});
  console.log(2)
  await ens.setSubnodeOwner(namehash.hash(tld), web3.utils.sha3('simplestorage'), owner, {from: owner});
  console.log(3)
  // await ens.setSubnodeOwner(namehash.hash('simplestorage.eth'), web3.utils.sha3('makoto'), owner, {from: owner});
  await ens.setResolver(root, resolver.address, {from: owner});
  console.log(4)
  await ens.setResolver(namehash.hash(tld), resolver.address, {from: owner});
  console.log(5)
  await ens.setResolver(namehash.hash('simplestorage.eth'), resolver.address, {from: owner});
  console.log(6)
  // await ens.setResolver(namehash.hash('makoto.simplestorage.eth'), resolver.address, {from: owner});
  await resolver.setAddr(namehash.hash(tld), owner, {from: owner});
  console.log(7)
  await resolver.setAddr(namehash.hash('simplestorage.eth'), owner, {from: owner});
  // await resolver.setAddr(namehash.hash('makoto.simplestorage.eth'), owner, {from: owner});

  console.log('ens owner for root', await ens.owner(root));
  console.log('ens owner for eth', await ens.owner(namehash.hash(tld)));
  console.log('ens owner for simplestorage', await ens.owner(namehash.hash('simplestorage.eth')));
  console.log('ens resolver for root', await ens.resolver(root));
  console.log('ens resolver for eth', await ens.resolver(namehash.hash(tld)));
  console.log('ens resolver for simplestorage', await ens.resolver(namehash.hash('simplestorage.eth')));
  var EthereumENS = require('ethereum-ens');
  var provider = web3.eth.currentProvider;
  provider.sendAsync = provider.send;
  var ethereumEns = new EthereumENS(provider, ENS.address);
  var ensOwner = await ethereumEns.owner(tld);
  console.log('1.1', ensOwner);
  var storageOwner = await ethereumEns.owner('simplestorage.eth');
  console.log('1.2', storageOwner);
  console.log('1.3', await ethereumEns.resolver('eth').addr());
  console.log('1.4', await ethereumEns.resolver('simplestorage.eth').addr());

  await ens.setSubnodeOwner(root, web3.utils.sha3('reverse'), owner, {from: owner});
  await ens.setSubnodeOwner(namehash.hash('reverse'), web3.utils.sha3('addr'), ReverseRegistrar.address, {from: owner});
};

