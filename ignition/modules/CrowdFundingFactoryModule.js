const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
// Here we are building the module using the buildModule command. 
module.exports = buildModule("CrowdFundingFactory", (m) => {
  // Defining the crowdFundingFactoryModule contract.
  const crowdFundingFactoryModule = m.contract("CrowdFundingFactory", []);

  // Calling the isDeployed method of the crowdFundingModule contract.
  m.call(crowdFundingFactoryModule, "isDeployed", []);

  // Returning the crowdFundingModule.
  return { crowdFundingFactoryModule };
});