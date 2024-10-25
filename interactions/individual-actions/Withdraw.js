require("hardhat");

async function main() {
    // Deployed Contract address here. 
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    // This line will help retrieve the contract (when functions are called, they will be called as if the owner is calling them)
    const crowdFunding = await hre.ethers.getContractAt("CrowdFunding", contractAddress);

    // Check the balance of the contractAddress before withdrawl
    const fundsRaised = await crowdFunding.getTotalFundsRaised();
    // This should be zero after the withdraw has happened.
    console.log("Total Funds (ETH) in the crowd funding (pre-withdrawl):  ", Number(fundsRaised)/Number(1e18));

    console.log("Withdrawing the funds from the crowd funding");
    // Withdraw the funds from the crowd funding
    await crowdFunding.withdraw();
    console.log("Funds have been withdrawn from the crowd funding");

    // Check the balance of the contractAddress after withdrawl
    const fundsRaisedAfterWithdraw = await crowdFunding.getTotalFundsRaised();
    // This should be zero after the withdraw has happened.
    console.log("Total Funds (ETH) in the funding (post withdrawl):  ", Number(fundsRaisedAfterWithdraw)/Number(1e18));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });