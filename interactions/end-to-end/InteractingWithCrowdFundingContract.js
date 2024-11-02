const { bigint } = require("hardhat/internal/core/params/argumentTypes");

require("hardhat");

async function main() {
    // Account that is used by ignition to deploy the contract
    const addressToContributeFrom = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";
    // Account that is used by ignition to deploy the contract
    const addressToContributeFrom2 = "0x976EA74026E726554dB657fA54763abd0C3a0aa9";
    // Deployed Contract address here. 
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    // ABI of the contract function - contribute
    // This is found in the deployments folder >> chain-31337 (local network) >> CrowdFunding.json
    const abi = [{
        "inputs": [
            {
                "internalType": "string",
                "name": "firstName",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "lastName",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "email",
                "type": "string"
            }
        ],
        "name": "contribute",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getTotalContributionByContributor",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }];

    // Step 0 - Initial Setup
    // Create a signer
    const signer = await hre.ethers.getSigner(addressToContributeFrom);
    const signer2 = await hre.ethers.getSigner(addressToContributeFrom2);
    // Create the contract instance with the signer
    const crowdFundingContract = new ethers.Contract(contractAddress, abi, signer);
    const crowdFundingContract2 = new ethers.Contract(contractAddress, abi, signer2);
    // Create the contract instance considering the owner as the signer
    // This line will help retrieve the contract (when functions are called, they will be called as if the owner is calling them)
    const crowdFundingOwnerContract = await hre.ethers.getContractAt("CrowdFunding", contractAddress);

    console.log("********************************************************");
    // Step 1: Contribute to the crowd funding
    await contributeToCrowdFunding(crowdFundingContract);
    // Step 1.1: Check the total contributions made by the contributor
    await checkContributionsMade(crowdFundingContract);
    // Step 2: Testing standard getter functions
    await testStandardGetterFunctions(crowdFundingOwnerContract);
    // Step 3: Make a big contribution to reach funding goal
    await contributeToReachFundingGoalLimit(crowdFundingContract2);
    // Step 3.1: Check the total contributions made by the contributor
    await checkContributionsMade(crowdFundingContract2);
    // Step 4: Test Withdraw - Withdraw the funds from the crowd funding
    await withdrawFunds(crowdFundingOwnerContract);
    // Step 5: Update the funding goal, minimum contribution, and crowd funding end time
    await updateFundingGoalAndMinimumContribution(crowdFundingOwnerContract);
    await updateCrowdFundingEndTime(crowdFundingOwnerContract);
    // Step 5.1: Testing standard getter functions
    await testStandardGetterFunctions(crowdFundingOwnerContract);
    // Step 6: Test Owner Functions
    await testOwnerFunctions(crowdFundingOwnerContract);
    // Step 7: Close the crowd funding
    await crowdFundingOwnerContract.closeCrowdFunding();
    console.log("Is Crowd funding open: ", await crowdFundingOwnerContract.isCrowdFundingOpen());
    console.log("********************************************************");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// This function will contribute to the crowd funding
async function contributeToCrowdFunding(crowdFundingContract) {
    console.log("********************************************************");
    console.log("Contributing to the crowd funding");
    console.log("********************************************************");
    // Contribute to the crowd funding
    const contribution = ethers.parseEther("5");
    // Now you can call the contribute function
    try {
        const tx = await crowdFundingContract.contribute(
            "Soumil", "Vavikar", "soumilvavikar@student.purdueglobal.edu",
            {
                value: contribution
            });
        console.log("Contributed to the crowd funding. Transaction Hash: ", tx.hash);
    } catch (error) {
        console.error("Error:", error.message);
    }
    console.log("********************************************************");
}

// This function will check the total contributions made by the contributor
async function checkContributionsMade(crowdFundingContract) {
    console.log("********************************************************");
    console.log("Checking the total contributions made by the contributor");
    console.log("********************************************************");
    // Check the balance of the contractAddress
    const totalContributionsMade = BigInt(await crowdFundingContract.getTotalContributionByContributor());
    console.log("Total Contributions Made (ETH):  ", Number(totalContributionsMade) / Number(1e18));
    console.log("********************************************************");
}

// This function will test the standard getter functions
async function testStandardGetterFunctions(crowdFunding) {
    console.log("********************************************************");
    console.log("Testing standard getter functions");
    console.log("********************************************************");
    // Get the crowd funding end time
    const endTime = await crowdFunding.getCrowdFundingEndTime();
    console.log("Crowd funding End Time:", endTime);

    // Get the funding goal
    const fundingGoal = await crowdFunding.getCrowdFundingGoal();
    console.log("Funding Goal (ETH):  ", Number(fundingGoal) / Number(1e18));

    // Get the minimum contribution
    const minimiumContribution = await crowdFunding.getMinimumContribution();
    console.log("Minimium Contribution (ETH):  ", Number(minimiumContribution) / Number(1e18));

    // Get the NFT URI for the tokenId
    const tokenUri = await crowdFunding.getTokenURI(0);
    console.log("Token URI for tokenId = 0: ", tokenUri);

    // Check if the crowd funding is open
    console.log("Is Crowd Funding Open: ", await crowdFunding.isCrowdFundingOpen());
    console.log("********************************************************");
}

// This function will contribute to reach the funding goal limit
async function contributeToReachFundingGoalLimit(crowdFundingContract) {
    console.log("********************************************************");
    console.log("Contributing to reach the funding goal");
    console.log("********************************************************");
    // Contribute to the crowd funding
    const contribution = ethers.parseEther("1000");
    // Now you can call the contribute function
    try {
        const tx = await crowdFundingContract.contribute(
            "Someone", "Else", "someoneelse@student.purdueglobal.edu",
            {
                value: contribution
            });
        console.log("Contributed to the crowd funding. Transaction Hash: ", tx.hash);
    } catch (error) {
        console.error("Error:", error.message);
    }
    console.log("********************************************************");
}

// This function will update the funding goal and minimum contribution
async function updateFundingGoalAndMinimumContribution(crowdFunding) {
    console.log("********************************************************");
    console.log("Updating the funding goal and minimum contribution");
    console.log("********************************************************");
    // Get the funding goal
    const fundingGoal = await crowdFunding.getCrowdFundingGoal();
    console.log("Funding Goal (ETH):  ", Number(fundingGoal) / Number(1e18));

    // Update the funding goal
    await crowdFunding.updateCrowdFundingGoal(BigInt(ethers.parseEther("10000")));

    // Get the funding goal
    const fundingGoalAfterUpdate = await crowdFunding.getCrowdFundingGoal();
    console.log("Funding Goal (ETH) after Update:  ", Number(fundingGoalAfterUpdate) / Number(1e18));

    // Get the minimum contribution
    const minimiumContribution = await crowdFunding.getMinimumContribution();
    console.log("Minimium Contribution (ETH):  ", Number(minimiumContribution) / Number(1e18));

    await crowdFunding.updateMinimumContribution(BigInt(ethers.parseEther("0.2")));

    // Get the minimum contribution
    const minimiumContributionAfterUpdate = await crowdFunding.getMinimumContribution();
    console.log("Minimium Contribution (ETH) after Update:  ", Number(minimiumContributionAfterUpdate) / Number(1e18));
    console.log("********************************************************");
}

// This function will withdraw the funds from the crowd funding
async function withdrawFunds(crowdFunding) {
    console.log("********************************************************");
    console.log("Withdrawing the funds from the crowd funding");
    console.log("********************************************************");
    // Check the balance of the contractAddress before withdrawl
    const fundsRaised = await crowdFunding.getTotalFundsRaised();
    // This should be zero after the withdraw has happened.
    console.log("Total Funds (ETH) in the crowd funding (pre-withdrawl):  ", Number(fundsRaised) / Number(1e18));

    console.log("Withdrawing the funds from the crowd funding");
    // Withdraw the funds from the crowd funding
    await crowdFunding.withdraw();
    console.log("Funds have been withdrawn from the crowd funding");

    // Check the balance of the contractAddress after withdrawl
    const fundsRaisedAfterWithdraw = await crowdFunding.getTotalFundsRaised();
    // This should be zero after the withdraw has happened.
    console.log("Total Funds (ETH) in the funding (post withdrawl):  ", Number(fundsRaisedAfterWithdraw) / Number(1e18));
    console.log("********************************************************");
}

// This function will test the owner functions
async function testOwnerFunctions(crowdFunding) {
    console.log("********************************************************");
    console.log("Testing owner functions");
    console.log("********************************************************");
    // Check the total number of NFTs issued
    const nftsIssued = await crowdFunding.getCountOfNFTsIssued();
    console.log("Total NFTs Issued:", Number(nftsIssued));

    // Get the People who have contributed to the crowd funding using the getFunders
    const funders = await crowdFunding.getFunders();
    console.log("List of People who contributed to the crowd funding:  ", funders);

    // Check the balance of the contractAddress
    const fundsRaised = await crowdFunding.getTotalFundsRaised();
    console.log("Total Funds Raised (ETH):  ", Number(fundsRaised) / Number(1e18));
    console.log("********************************************************");
}

// This function will update the crowd funding end time
async function updateCrowdFundingEndTime(crowdFunding) {
    console.log("********************************************************");
    console.log("Updating the crowd funding end time");
    console.log("********************************************************");
    // Get the crowd funding end time
    const endTime = await crowdFunding.getCrowdFundingEndTime();
    console.log("Crowd funding End Time:", endTime);

    const currentTime = Math.ceil(Date.now() / 1000);
    const newEndTime = currentTime + (100 * 24 * 60 * 60); // 100 day from now
    // Update the crowd funding end time
    await crowdFunding.updateCrowdFundingEndTime(BigInt(newEndTime));

    // Get the crowd funding end time
    const endTimeAfterUpdate = await crowdFunding.getCrowdFundingEndTime();
    console.log("Crowd funding End Time after Update:", endTimeAfterUpdate);
    console.log("********************************************************");
}