// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "./CrowdFunding.sol";

/**
 * @title CrowdFundingFactory
 * @author Soumil Vavikar
 * @notice Factory contract to create new CrowdFunding contracts
 */
contract CrowdFundingFactory {
    // Array to store addresses of deployed CrowdFunding contracts
    address[] private deployedCrowdFundings;

    // Event emitted when a new CrowdFunding contract is created
    event CrowdFundingCreated(address crowdFundingAddress, address creator);

    /**
     * @dev Creates a new CrowdFunding contract
     * @param _minimumContribution Minimum contribution amount
     * @param _goal Funding goal
     * @param _duration Duration of the crowdfunding in seconds
     */
    function createCrowdFunding(uint256 _minimumContribution, uint256 _goal, uint256 _duration) external {
        // Deploy a new CrowdFunding contract
        address newCrowdFunding = address(new CrowdFunding(_minimumContribution, _goal, _duration));
        // Add the address to the array of deployed contracts
        deployedCrowdFundings.push(newCrowdFunding);
        // Emit an event
        emit CrowdFundingCreated(newCrowdFunding, msg.sender);
    }

    /**
     * @dev Returns the number of deployed CrowdFunding contracts
     * @return uint256 Number of deployed contracts
     */
    function getDeployedCrowdFundingsCount() external view returns (uint256) {
        return deployedCrowdFundings.length;
    }

    /**
     * @dev Returns an array of all deployed CrowdFunding contract addresses
     * @return address[] Array of deployed contract addresses
     */
    function getDeployedCrowdFundings() public view returns (address[] memory) {
        return deployedCrowdFundings;
    }

    /**
     * This function will be called when we deploy the contract on the chain from the TokenModule.js
     */
    function isDeployed() external pure returns (string memory) {
        return "Crowd Funding Factory Contract is deployed successfully...";
    }
}
