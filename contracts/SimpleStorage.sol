pragma solidity ^0.4.24;
import "@ensdomains/ens/contracts/ENSRegistry.sol";
import "@ensdomains/ens/contracts/PublicResolver.sol";

contract SimpleStorage {
  uint storedData;
  PublicResolver public resolver;
  ENS public ens;
  bytes32 public rootNode;

  function set(uint x) public {
    storedData = x;
  }

  function get() public view returns (uint) {
    return storedData;
  }

  function setENS(ENS ensAddr, bytes32 _rootNode) public {
    ens = ensAddr;
    rootNode = _rootNode;
    resolver = PublicResolver(ens.resolver(rootNode));
  }

  function register(bytes32 label) public {
    bytes32 node = keccak256(abi.encodePacked(rootNode, label));
    ens.setSubnodeOwner(rootNode, label, this);
    ens.setResolver(node, resolver);
    resolver.setAddr(node, msg.sender);
    ens.setOwner(node, msg.sender);
  }
}
