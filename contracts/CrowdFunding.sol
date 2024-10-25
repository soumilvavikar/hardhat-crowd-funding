//SPDX-License-Identifier: MIT

pragma solidity ^0.8.27;

import "hardhat/console.sol";
import "./libs/CrowdFundingErrors.sol";
import "./libs/ContributorLib.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title CrowdFunding
 * @author Soumil Vavikar
 * @notice This contract is used to create a CrowdFunding
 * @dev This contract is used to create a CrowdFunding and mint NFTs for the contributors
 */
contract CrowdFunding is ERC721 {
    // Mapping of token id to token URI
    mapping(uint256 => string) private s_tokenIdToUri;
    // Array of contributors to the CrowdFunding
    ContributorLib.Contributor[] public s_contributors;

    // Owner of the contract
    address public immutable i_owner;
    // Counter for the CFNFT tokens
    uint256 private s_tokenCounter;
    // Minimum Contribution
    uint256 public s_minContribution;
    // CrowdFunding Goal
    uint256 public s_crowdFundingGoal;
    // CrowdFunding End Time
    uint256 public s_CrowdFundingEndTime;
    // Total Contributions
    uint256 public s_totalContributions;
    // CrowdFunding Open or Closed
    bool public isOpen;

    // Token URI - Uploaded an image of my bike and converted that into a token URI. Documentation at https://docs.ipfs.tech/concepts/what-is-ipfs/
    // Image file: https://ipfs.io/ipfs/QmXW1JcRvBuzW7v5KkxyWxrsWWtJJiGQNTdCuUceYC2Nw2?filename=bike.png
    // Metadata file: https://ipfs.io/ipfs/QmaiHoe6ThaoehhfoGaVtR3CrBtQ3Y42Tpm4P7z9MJiia4?filename=bike.json
    string private tokenUri = "https://ipfs.io/ipfs/QmXW1JcRvBuzW7v5KkxyWxrsWWtJJiGQNTdCuUceYC2Nw2?filename=bike.png";

    /**
     * Constructor to initialize the CrowdFunding contract
     * @param _goal - Goal of the CrowdFunding
     * @param _duration - Duration of the CrowdFunding
     *
     * @notice - In a real world situation, the NFT and the crowd funding contract would be separate. But to keep this simple, we have clubbed them into one.
     */
    constructor(uint256 _minimumContribution, uint256 _goal, uint256 _duration) ERC721("CrowdFundingNFT", "CFNFT") {
        // Initialize the NFT token counter
        s_tokenCounter = 0;

        // Set the owner of the contract
        i_owner = msg.sender;
        // Set minimum contribution
        s_minContribution = _minimumContribution;
        // Set the goal of the CrowdFunding
        s_crowdFundingGoal = _goal;
        // Set the end time of the CrowdFunding
        s_CrowdFundingEndTime = block.timestamp + _duration;
        // Set the crowd funding state to open
        isOpen = true;

        console.log("CrowdFunding contract deployed by %s", i_owner);
        console.log("Minimum Contribution: %s", s_minContribution);
        console.log("CrowdFunding Goal: %s", s_crowdFundingGoal);
        console.log("CrowdFunding End Time: %s", s_CrowdFundingEndTime);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////// MODIFIERS  //////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * This modifier will check whether the send of the message is the owner of the contract or not
     */
    modifier isOwner() {
        // _; >> before the code here means this modifier will execute after the function logic
        if (msg.sender != i_owner) {
            revert CrowdFundingErrors.CrowdFunding__OnlyOwnerCanWithdraw("Only the owner can withdraw");
        }
        // _; >> after the code here means this modifier will execute before the function logic
        _;
    }

    /**
     * This modifier will check whether the crowd funding is closed or not
     */
    modifier onlyIfCrowdFundingIsClosed() {
        if ((block.timestamp < s_CrowdFundingEndTime) && isOpen) {
            revert CrowdFundingErrors.CrowdFunding__CrowdFundingIsStillOpen("Crowdfunding is still open");
        }
        _;
    }

    /**
     * This modifier will check whether the crowd funding is open or not
     */
    modifier onlyIfCrowdFundingIsOpen() {
        if (!isOpen) {
            revert CrowdFundingErrors.CrowdFunding__CrowdFundingIsClosed("Crowdfunding is closed");
        }

        if (block.timestamp > s_CrowdFundingEndTime) {
            revert CrowdFundingErrors.CrowdFunding__CrowdFundingIsClosed("Crowdfunding is closed");
        }
        _;
    }

    /**
     * This modifier will check whether the crowd funding is still open or not
     */
    modifier insideCrowdFundingDuration() {
        if (block.timestamp > s_CrowdFundingEndTime) {
            revert CrowdFundingErrors.CrowdFunding__CrowdFundingIsClosed("Crowdfunding is closed");
        }
        _;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////// PUBLIC FUNCTIONS  ////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * This function will be used to mint the NFT token based on the token URI
     */
    function mintSv15Nft() public returns (uint256 tokenId) {
        s_tokenIdToUri[s_tokenCounter] = tokenUri;
        _safeMint(msg.sender, s_tokenCounter);
        tokenId = s_tokenCounter++;
        console.log("NFT minted with token ID: %s", tokenId);
    }

    /**
     * This function contains the logic to contribute to the CrowdFunding.
     * @dev It will mint an NFT and add the contributor to the list of contributors
     *
     * @param firstName - First Name of the contributor
     * @param lastName - Last Name of the contributor
     * @param email - Email of the contributor
     */
    function contribute(string memory firstName, string memory lastName, string memory email)
        public
        payable
        onlyIfCrowdFundingIsOpen
    {
        // Check if the contribution is greater than the minimum contribution
        if (msg.value < s_minContribution) {
            revert CrowdFundingErrors.CrowdFunding__ContributionMustBeGreaterThanMinimumContribution(
                "Contribution should be greater than minimum contribution"
            );
        }

        if (
            keccak256(abi.encodePacked(firstName)) == keccak256(abi.encodePacked(""))
                || keccak256(abi.encodePacked(lastName)) == keccak256(abi.encodePacked(""))
                || keccak256(abi.encodePacked(email)) == keccak256(abi.encodePacked(""))
        ) {
            revert CrowdFundingErrors.CrowdFunding__FirstNameLastNameOrEmalIsEmpty(
                "First Name, Last Name and Email are mandatory"
            );
        }
        // Add the contribution to the total contributions
        s_totalContributions += msg.value;

        // Mint an NFT
        uint256 tokenId = mintSv15Nft();
        // Add the contributor to the list of contributors, assign tokenID to the contributor and update their total contributions
        addOrUpdateContributor(firstName, lastName, email, tokenId);
        // Emit the Transfer event
        emit Transfer(msg.sender, address(this), msg.value);

        // Check if the total contributions are greater than or equal to the crowd funding goal
        // If yes, then close the crowd funding
        if (s_totalContributions >= s_crowdFundingGoal) {
            isOpen = false;
        }
    }

    /**
     * This function will be used to withdraw the funds from the contract
     *
     * @notice - This function will only be called by the owner of the contract
     * @notice - This function will only be called if the crowd funding is closed
     * @notice - This function will transfer the funds to the owner of the contract
     */
    function withdraw() public isOwner onlyIfCrowdFundingIsClosed {
        (bool callSuccess,) = payable(i_owner).call{value: address(this).balance}("");

        // Check if the transfer was successful or not
        // If not, revert the transaction
        if (!callSuccess) {
            revert CrowdFundingErrors.CrowdFunding__WithdrawFailed("Withdraw failed.");
        }
    }

    /**
     * This function will be used to update the crowd funding goal
     *
     * @param _newGoal - New goal of the CrowdFunding
     *
     * @notice - This function will only be called by the owner of the contract
     * @notice - This function will only be called if the new goal is greater than the total contributions made till now
     * @notice - This function will only be called if the crowd funding is still inside the funding duration
     */
    function updateCrowdFundingGoal(uint256 _newGoal) public isOwner insideCrowdFundingDuration {
        if (_newGoal <= s_totalContributions) {
            revert CrowdFundingErrors.CrowdFunding__NewGoalShouldBeGreaterThanTotalContributions(
                "New goal should be greater than total contributions made till now."
            );
        }

        s_crowdFundingGoal = _newGoal;
        // if the limit to funding was reached, the contract would have closed the crowd funding. Hence need to open it again
        isOpen = true;
    }

    /**
     * This function will be used to update the minimum contribution
     *
     * @param _newMinimumContribution - New minimum contribution
     *
     * @notice - This function will only be called by the owner of the contract
     * @dev - This function will only be called if the new minimum contribution is greater than 0
     */
    function updateMinimumContribution(uint256 _newMinimumContribution) public isOwner onlyIfCrowdFundingIsOpen {
        if (_newMinimumContribution <= 0) {
            revert CrowdFundingErrors.CrowdFunding__MinimumContributionMustBeGreaterThanZero(
                "Contribution should be greater than minimum contribution"
            );
        }
        s_minContribution = _newMinimumContribution;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////// EXTERNAL FUNCTIONS  //////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * Fallback function to revert the transaction if someone tries to send ether to the contract
     */
    fallback() external payable {
        revert CrowdFundingErrors.CrowdFunding__CallContributeFunction("Call contribute function");
    }

    /**
     * Receive function to revert the transaction if someone tries to send ether to the contract
     */
    receive() external payable {
        revert CrowdFundingErrors.CrowdFunding__CallContributeFunction("Call contribute function");
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////// INTERNAL / PRIVATE FUNCTIONS  //////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * This function will be used to add or update the contributor to the list of contributors
     *
     * @param firstName - First Name of the contributor
     * @param lastName - Last Name of the contributor
     * @param email - Email of the contributor
     * @param tokenId - Token ID of the NFT minted
     *
     * @notice - This function will be called internally by the contribute function
     * @notice - This function will add the contributor if the contributor is not present in the list of contributors
     * @notice - This function will update the total contributions of the contributor if the contributor is already present in the list of contributors
     * @notice - This function will add the token ID to the list of token IDs of the contributor
     */
    function addOrUpdateContributor(
        string memory firstName,
        string memory lastName,
        string memory email,
        uint256 tokenId
    ) internal {
        // Check if the contributor is already present in the list of contributors
        (bool isContributorPresent, int256 existingContributorIndex) = checkIfContributorExists(email);

        // If the contributor is not present, then add the contributor to the list of contributors
        if (!isContributorPresent) {
            ContributorLib.Contributor memory newContributor;
            newContributor.contributorAddress = msg.sender;
            newContributor.firstName = firstName;
            newContributor.lastName = lastName;
            newContributor.email = email;
            newContributor.tokenIds = new uint256[](1);
            newContributor.tokenIds[0] = tokenId;
            newContributor.totalContributions = msg.value;
            // Add the contributor to the list of contributors
            s_contributors.push(newContributor);
            console.log("Contributor added");
        } else {
            console.log("Contributor already exists");
            // Update the total contributions of the contributor
            s_contributors[uint256(existingContributorIndex)].totalContributions += msg.value;
            // Add the token ID to the list of token IDs of the contributor
            s_contributors[uint256(existingContributorIndex)].tokenIds.push(tokenId);
        }
    }

    /**
     * This function will be used to check if the contributor exists in the list of contributors
     *
     * @param email - Email of the contributor
     *
     * @return bool - Whether the contributor exists or not
     * @return int256 - Index of the contributor in the list of contributors
     *
     * @notice - This function will be called internally by the addOrUpdateContributor function
     * @dev - This function will return -1 if the contributor is not present in the list of contributors
     * @dev This function will decide whether the contributor is present or not based on the email of the contributor
     */
    function checkIfContributorExists(string memory email) internal view returns (bool, int256) {
        for (uint256 i = 0; i < s_contributors.length; i++) {
            if (keccak256(abi.encodePacked(s_contributors[i].email)) == keccak256(abi.encodePacked(email))) {
                return (true, int256(i));
            }
        }
        return (false, -1);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////// PUBLIC / VIEW / PURE FUNCTIONS  ////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * This function will be used to get the list of the contributor
     *
     * @return contributor[] - List of the contributors
     *
     * @notice - This function will be called by the owner to get the list of all the contributors.
     */
    function getFunders() public view isOwner returns (ContributorLib.Contributor[] memory) {
        return s_contributors;
    }

    /**
     * This function will be used to get the owner of the contract
     */
    function getOwner() public view returns (address) {
        return i_owner;
    }

    /**
     * This function will be used to get the total funds raised
     */
    function getTotalFundsRaised() public view returns (uint256) {
        return s_totalContributions;
    }

    /**
     * This function will be used to get the total NFTs issued
     *
     * @dev - This function will only be called by the owner of the contract
     */
    function getCountOfNFTsIssued() public view isOwner returns (uint256) {
        return s_tokenCounter;
    }

    /**
     * This function will be used to get the total contribution of the contributor
     *
     * @return uint256 - Total contribution of the contributor
     *
     * @notice - This function will be called by the contributor to get their total contribution
     */
    function getTotalContributionByContributor() public view returns (uint256) {
        uint256 totalContribution = 0;
        for (uint256 i = 0; i < s_contributors.length; i++) {
            if (s_contributors[i].contributorAddress == msg.sender) {
                totalContribution = s_contributors[i].totalContributions;
            }
        }
        return totalContribution;
    }

    /**
     * This function will be called when we deploy the contract on the chain from the TokenModule.js
     */
    function isDeployed() external pure returns (string memory) {
        return "Contract is deployed successfully...";
    }

    /**
     * This function will be used to get the minimum contribution
     */
    function getMinimumContribution() public view returns (uint256) {
        return s_minContribution;
    }

    /**
     * This function will be used to get the crowd funding goal
     */
    function getCrowdFundingGoal() public view returns (uint256) {
        return s_crowdFundingGoal;
    }

    /**
     * This function will be used to get the crowd funding end time
     */
    function getCrowdFundingEndTime() public view returns (uint256) {
        return s_CrowdFundingEndTime;
    }
    
    /**
     * This function will be used to check if the crowd funding is open or not
     */
    function isCrowdFundingOpen() public view returns (bool) {
        return isOpen;
    }

    /**
     * This function will be used to get the token URI of the NFT
     *
     * @param tokenId - Token ID of the NFT
     */
    function getTokenURI(uint256 tokenId) public view returns (string memory) {
        return s_tokenIdToUri[tokenId];
    }
}
