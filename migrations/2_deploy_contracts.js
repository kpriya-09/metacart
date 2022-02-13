const Color = artifacts.require("Color");
const MemEthereum = artifacts.require("MemEthereum");

module.exports = function(deployer) {
  deployer.deploy(Color);
  deployer.deploy(MemEthereum);
};
