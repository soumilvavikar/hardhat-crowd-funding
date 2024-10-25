require("hardhat");

async function main() {
    // Deployed Contract address here. 
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    // This line will help retrieve the contract (when functions are called, they will be called as if the owner is calling them)
    const crowdFunding = await hre.ethers.getContractAt("CrowdFunding", contractAddress);

    // Get the funding goal
    const fundingGoal = await crowdFunding.getCrowdFundingGoal();
    console.log("Funding Goal (ETH):  ", Number(fundingGoal)/Number(1e18));

    // Update the funding goal
    await crowdFunding.updateCrowdFundingGoal(BigInt(ethers.parseEther("10000")));

    // Get the funding goal
    const fundingGoalAfterUpdate = await crowdFunding.getCrowdFundingGoal();
    console.log("Funding Goal (ETH) after Update:  ", Number(fundingGoalAfterUpdate)/Number(1e18));

    // Get the minimum contribution
    const minimiumContribution = await crowdFunding.getMinimumContribution();
    console.log("Minimium Contribution (ETH):  ", Number(minimiumContribution)/Number(1e18));

    await crowdFunding.updateMinimumContribution(BigInt(ethers.parseEther("0.2")));

    // Get the minimum contribution
    const minimiumContributionAfterUpdate = await crowdFunding.getMinimumContribution();
    console.log("Minimium Contribution (ETH) after Update:  ", Number(minimiumContributionAfterUpdate)/Number(1e18));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });