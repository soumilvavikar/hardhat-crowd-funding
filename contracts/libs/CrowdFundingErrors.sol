//SPDX-License-Identifier: MIT

pragma solidity ^0.8.27;

library CrowdFundingErrors {
    error CrowdFunding__ContributionMustBeGreaterThanMinimumContribution(string message);
    error CrowdFunding__FirstNameLastNameOrEmalIsEmpty(string message);
    error CrowdFunding__CrowdFundingIsClosed(string message);
    error CrowdFunding__CrowdFundingIsStillOpen(string message);
    error CrowdFunding__OnlyOwnerCanWithdraw(string message);
    error CrowdFunding__WithdrawFailed(string message);
    error CrowdFunding__CallContributeFunction(string message);
    error CrowdFunding__NewGoalShouldBeGreaterThanTotalContributions(string message);
    error CrowdFunding__MinimumContributionMustBeGreaterThanZero(string message);
    error CrowdFunding__NewEndTimeShouldBeGreaterThanCurrentTime(string message);
}
