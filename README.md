# Crowd Funding Project (Built using Hardhat)

## Contract Functionalities

This project contains a contract for crowd funding which does the following:

**What Data Will the Smart Contract Need to Store?**

The smart contract will maintain the following information:

- Information/details of the people who contributed to the fundraising.
- Mapping of the contributor and amount contributed to the fundraising.
- Funds collected and number of NFTs issued.

We will leverage the solidity data types, struct, and mapping to store the above information.

**Actions Users Can Perform on the Smart Contract**:

There can be two types of users: The crowdfunding / fund-raising owner and the contributor.  Each can perform the following functions:

**Owner**:

- Check the amount of money raised (standard getter function).
- Get the details of contributors (standard getter function).
- Get the count of NFTs issued (standard getter function).

**Contributor**:

- Contribute to the fund-raising (main contract logic, pseudocode below).
- Request/retrieve the token ID for the token assigned after successfully contributing to fundraising (standard getter function to retrieve the information from the mapping).
- Check the amount of money raised (standard getter function).

**Conditions for Executing the Smart Contract**:

For the smart contract to execute, the following conditions should be met:

- The contributor should have sufficient ETH in the account. The Ethereum Virtual Machine checks this before sending the call to the contract.
- The functions would check whether the caller can call the function.

**Event(s) Triggered During Smart Contract Execution**:

The contract will trigger an event on:

- Successful contribution to the crowdfunding / fund-raising.

## Initial Repository Setup

```shell
# Initialize NPM
npm init
# Install hardhat if not done already
npm install --save-dev hardhat
# Initialize the hardhat project (select a valid option)
npx hardhat init
# Install the openzeppelin contract to use ERC721 interface
npm install --save-dev @openzeppelin/contracts
```

## Compiling and Testing the Contract

```shell
# Compile the project
npx hardhat compile
# Run the tests
npx hardhat test
```

### Test Evidence(s) - Unit Testing

Unit testing evidences are documented in the [README_UNIT_TESTING.md](testevidences/README_UNIT_TESTING.md) file.

## Starting the local chain and Deploying the Contract

```shell
# Spin the local chain
npx hardhat node
# Deploy the contract / hardhat project
npx hardhat ignition deploy ignition/modules/CrowdFundingModule.js --network localhost

## NOTES:
### If in the above command, the --network localhost is not passed, then it by default deploys to local network.
### If you need to do multiple deployments of the contract use --deployment-id <unique-deployment-id> along with the command.
```

### Test Evidence(s) - Deployment

Local Chain Start-up and Contract deployment evidences are documented in the [README_EVIDENCES_DEPLOYMENT.md](testevidences/README_EVIDENCES_DEPLOYMENT).

## Testing the Contract Functionality

### Command for End to End Testing via Interactions

```shell
# Run all the functions to test the flow end to end.
npx hardhat run interactions/end-to-end/InteractingWithCrowdFundingContract.js --network localhost
```

The end to end testing test evidences are documented in the [README_E2E_TEST_EVIDENCES.md](testevidences/README_E2E_TEST_EVIDENCES.md).

### Commands for Indvidual Function Testing Based on the User (Owner / Contributor)

```shell
# Test the contribute function
npx hardhat run interactions/individual-actions/Contribute.js --network localhost
# Test the owner interactions like get the total count of NFTs issued, get the list of Contributors, and total funds raised.
npx hardhat run interactions/individual-actions/OwnerInteractions.js --network localhost
# Contribute to the crowd funding to reach the goal (so that withdrawl can be called)
## Withdrawl can be called if crowd funding has closed. And crowd funding closes if the goal is reached or the time has passed.
npx hardhat run interactions/individual-actions/ContributeToReachGoalLimit.js --network localhost
# Test the getter functions
npx hardhat run interactions/individual-actions/GetterInteractions.js --network localhost
# Withdrawl interaction
npx hardhat run interactions/individual-actions/Withdraw.js --network localhost
# Update the Crowd funding goal and minimum contribution
npx hardhat run interactions/individual-actions/OwnerInteractions_UpdateCrowdFunding.js --network localhost
```
