pragma solidity ^0.4.24;
import "@ensdomains/ens/contracts/ENSRegistry.sol";
import "@ensdomains/ens/contracts/PublicResolver.sol";
import "@ensdomains/ens/contracts/FIFSRegistrar.sol";

contract SimpleStorage {
  uint storedData;
  FIFSRegistrar public registrar;
  PublicResolver public resolver;
  ENS public ens;

  function set(uint x) public {
    storedData = x;
  }

  function get() public view returns (uint) {
    return storedData;
  }

  function getENS() view returns(address){
    return address(ens);
  }

  function setENS(ENS ensAddr, PublicResolver resolverAddr, FIFSRegistrar registrarAddr) public {
    ens = ensAddr;
    resolver = resolverAddr;
    registrar = registrarAddr;
  }

  // register(simplestorage.eth, makoto, makoto.simplestorage.eth)
  function register(bytes32 rootNode, bytes32 label, bytes32 fullAddr) public {
    // registrar.register(label, msg.sender);
    ens.setSubnodeOwner(rootNode, label, this);
    ens.setResolver(fullAddr, resolver);
    resolver.setAddr(fullAddr, msg.sender);
  }
}
