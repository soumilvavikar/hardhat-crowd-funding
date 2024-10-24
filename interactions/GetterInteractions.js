require("hardhat");

async function main() {
    // Deployed Contract address here. 
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    // This line will help retrieve the contract (when functions are called, they will be called as if the owner is calling them)
    const crowdFunding = await hre.ethers.getContractAt("CrowdFunding", contractAddress);

    // Get the crowd funding end time
    const endTime = await crowdFunding.getCrowdFundingEndTime();
    console.log("Crowd funding End Time:", endTime);

    // Get the funding goal
    const fundingGoal = await crowdFunding.getCrowdFundingGoal();
    console.log("Funding Goal (ETH):  ", Number(fundingGoal)/Number(1e18));

    // Get the minimum contribution
    const minimiumContribution = await crowdFunding.getMinimumContribution();
    console.log("Minimium Contribution (ETH):  ", Number(minimiumContribution)/Number(1e18));

    // Check if the crowd funding is open
    console.log("Is Crowd Funding Open: ", await crowdFunding.isCrowdFundingOpen());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });