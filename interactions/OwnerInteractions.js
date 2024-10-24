require("hardhat");

async function main() {
    // Deployed Contract address here. 
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    // This line will help retrieve the contract (when functions are called, they will be called as if the owner is calling them)
    const crowdFunding = await hre.ethers.getContractAt("CrowdFunding", contractAddress);

    // Check the total number of NFTs issued
    const nftsIssued = await crowdFunding.getCountOfNFTsIssued();
    console.log("Total NFTs Issued:", nftsIssued);

    // Get the People who have contributed to the crowd funding using the getFunders
    const funders = await crowdFunding.getFunders();
    console.log("List of People who contributed to the crowd funding:  ", funders);

    // Check the balance of the contractAddress
    const fundsRaised = await crowdFunding.getTotalFundsRaised();
    console.log("Total Funds Raised (ETH):  ", Number(fundsRaised)/Number(1e18));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });