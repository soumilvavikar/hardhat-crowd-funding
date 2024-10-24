const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
// Here we are building the module using the buildModule command. 
module.exports = buildModule("CrowdFunding", (m) => {
  // Defining the crowdFundingModule contract.
  // The contract takes in three parameters: minContribution, goal, and duration.
  // The minContribution is set to 0.1 ETH, the goal is set to 100 ETH, and the duration is set to 1 days.
  const crowdFundingModule = m.contract("CrowdFunding", [BigInt(ethers.parseEther("0.1")), BigInt(ethers.parseEther("1000")), (1 * 24 * 60 * 60)]);

  // Calling the isDeployed method of the crowdFundingModule contract.
  m.call(crowdFundingModule, "isDeployed", []);

  // Returning the crowdFundingModule.
  return { crowdFundingModule };
});