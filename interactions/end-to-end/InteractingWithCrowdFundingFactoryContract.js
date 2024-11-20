const { bigint } = require("hardhat/internal/core/params/argumentTypes");

require("hardhat");

async function main() {
    // Deployed Contract address here. 
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    // ABI of the contract function - contribute
    // This is found in the deployments folder >> chain-31337 (local network)
    const abi = [
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "crowdFundingAddress",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "creator",
                    "type": "address"
                }
            ],
            "name": "CrowdFundingCreated",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_minimumContribution",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "_goal",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "_duration",
                    "type": "uint256"
                }
            ],
            "name": "createCrowdFunding",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getDeployedCrowdFundings",
            "outputs": [
                {
                    "internalType": "address[]",
                    "name": "",
                    "type": "address[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getDeployedCrowdFundingsCount",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "isDeployed",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "pure",
            "type": "function"
        }
    ];

    // Step 0 - Initial Setup
    const crowdFundingOwner = await hre.ethers.getContractAt("CrowdFundingFactory", contractAddress);

    console.log("********************************************************");
    const minimumContribution = 100;
    const goal = 1000;
    const duration = 1000;
    // Step 1: Create new crowd funding
    const tx = await crowdFundingOwner.createCrowdFunding(minimumContribution, goal, duration);
    const receipt = await tx.wait();
    console.log("Crowd Funding created at: ", receipt);

    const countOfCrowdFundings = await crowdFundingOwner.getDeployedCrowdFundingsCount();
    console.log("Number of crowd fundings: ", countOfCrowdFundings.toString());

    const crowdFundingAdds = await crowdFundingOwner.getDeployedCrowdFundings();
    console.log("Crowd fundings: ", crowdFundingAdds);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
