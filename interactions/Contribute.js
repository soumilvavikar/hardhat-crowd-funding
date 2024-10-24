const { bigint } = require("hardhat/internal/core/params/argumentTypes");

require("hardhat");

async function main() {
    // Account that is used by ignition to deploy the contract
    const addressToContributeFrom = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";
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

    // Contribute to the crowd funding
    const contribution = ethers.parseEther("5");
    // Assuming you have already connected to the network and obtained the contract ABI

    // Create a signer
    const signer = await hre.ethers.getSigner(addressToContributeFrom);

    // Create the contract instance with the signer
    const crowdFundingContract = new ethers.Contract(contractAddress, abi, signer);

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

    // Check the balance of the contractAddress
    const totalContributionsMade = BigInt(await crowdFundingContract.getTotalContributionByContributor());
    console.log("Total Contributions Made (ETH):  ",Number(totalContributionsMade)/Number(1e18));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });