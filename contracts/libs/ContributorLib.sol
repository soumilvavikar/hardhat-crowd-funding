//SPDX-License-Identifier: MIT

pragma solidity ^0.8.27;

library ContributorLib {
    struct Contributor {
        address contributorAddress;
        string firstName;
        string lastName;
        string email;
        uint256[] tokenIds;
        uint256 totalContributions;
    }
}
