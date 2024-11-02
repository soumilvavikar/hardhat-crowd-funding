const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * CrowdFunding contract test suite
 * 
 * @author Soumil Vavikar
 * @notice Test suite for the CrowdFunding contract
 */
describe("CrowdFunding", function () {
    let crowdFunding;
    let owner;
    let addr1;
    let addr2;
    let addrs;

    // Constants to be used for the firstName, lastName, and email
    const firstName = "Tadej";
    const lastName = "Pogačar";
    const email = "tadej.poga@gmail.com"

    // Constants to be used for the minimum contribution, goal, and duration
    const minContribution = BigInt(ethers.parseEther("0.1"));
    const goal = BigInt(ethers.parseEther("1000"));
    const duration = 7 * 24 * 60 * 60; // 7 days

    /**
     * beforeEach hook to deploy the CrowdFunding contract
     */
    beforeEach(async function () {
        [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();
        const CrowdFunding = await ethers.getContractFactory("CrowdFunding");
        crowdFunding = await CrowdFunding.deploy(minContribution, goal, duration);
        await crowdFunding.waitForDeployment();
    });

    /**
     * Test cases for the deployment of the CrowdFunding contract
     */
    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await crowdFunding.getOwner()).to.equal(owner.address);
        });

        it("Should set the correct minimum contribution", async function () {
            expect(await crowdFunding.s_minContribution()).to.equal(minContribution);
        });

        it("Should set the correct crowdfunding goal", async function () {
            expect(await crowdFunding.s_crowdFundingGoal()).to.equal(goal);
        });

        it("Should set the correct end time", async function () {
            const endTime = await crowdFunding.s_CrowdFundingEndTime();
            expect(endTime).to.be.closeTo(
                (await time.latest()) + duration,
                60 // Allow 60 seconds tolerance
            );
        });

        it("Should initialize as open", async function () {
            expect(await crowdFunding.isOpen()).to.be.true;
        });
    });

    /**
     * Test cases for the input validation in the CrowdFunding contract
     */
    describe("Input Validation", function () {
        it("Should reject contributions with empty firstName", async function () {
            await expect(crowdFunding.connect(addr1).contribute("", lastName, email, { value: minContribution }))
                .to.be.revertedWithCustomError(crowdFunding, "CrowdFunding__FirstNameLastNameOrEmalIsEmpty")
                .withArgs("First Name, Last Name and Email are mandatory");
        });

        it("Should reject contributions with empty lastName", async function () {
            await expect(crowdFunding.connect(addr1).contribute(firstName, "", email, { value: minContribution }))
                .to.be.revertedWithCustomError(crowdFunding, "CrowdFunding__FirstNameLastNameOrEmalIsEmpty")
                .withArgs("First Name, Last Name and Email are mandatory");
        });

        it("Should reject contributions with empty email", async function () {
            await expect(crowdFunding.connect(addr1).contribute(firstName, lastName, "", { value: minContribution }))
                .to.be.revertedWithCustomError(crowdFunding, "CrowdFunding__FirstNameLastNameOrEmalIsEmpty")
                .withArgs("First Name, Last Name and Email are mandatory");
        });

        it("Should accept contributions with all fields filled", async function () {
            await expect(crowdFunding.connect(addr1).contribute(firstName, lastName, email, { value: minContribution }))
                .to.emit(crowdFunding, "Transfer");
        });

        it("Should reject contributions with all fields empty", async function () {
            await expect(crowdFunding.connect(addr1).contribute("", "", "", { value: minContribution }))
                .to.be.revertedWithCustomError(crowdFunding, "CrowdFunding__FirstNameLastNameOrEmalIsEmpty")
                .withArgs("First Name, Last Name and Email are mandatory");
        });

        it("Should allow valid contributions", async function () {
            await expect(crowdFunding.connect(addr1).contribute(firstName, lastName, email, { value: minContribution }))
                .to.emit(crowdFunding, "Transfer");
        });

        it("Should reject contributions below minimum", async function () {
            await expect(crowdFunding.connect(addr1).contribute(firstName, lastName, email, { value: 0 }))
                .to.be.revertedWithCustomError(crowdFunding, "CrowdFunding__ContributionMustBeGreaterThanMinimumContribution");
        });
    });

    /**
     * Test cases for the contributions to the CrowdFunding contract
     */
    describe("Contributions", function () {
        it("Should update total contributions", async function () {
            await crowdFunding.connect(addr1).contribute(firstName, lastName, email, { value: minContribution });
            expect(await crowdFunding.s_totalContributions()).to.equal(minContribution);
        });

        it("Should mint NFT for contributor", async function () {
            await crowdFunding.connect(addr1).contribute(firstName, lastName, email, { value: minContribution });
            expect(await crowdFunding.balanceOf(addr1.address)).to.equal(1);
        });

        it("Should close crowdfunding when goal is reached", async function () {
            await crowdFunding.connect(addr1).contribute(firstName, lastName, email, { value: goal });
            expect(await crowdFunding.isOpen()).to.be.false;
        });

        it("Should reject contributions when crowdfunding is closed", async function () {
            await time.increase(duration + 1);
            await expect(crowdFunding.connect(addr1).contribute(firstName, lastName, email, { value: minContribution }))
                .to.be.revertedWithCustomError(crowdFunding, "CrowdFunding__CrowdFundingIsClosed");
        });

        it("Should return tokenUri for the passed tokenId", async function () {
            await crowdFunding.connect(addr1).contribute(firstName, lastName, email, { value: minContribution });
            const tokenId = await crowdFunding.getTokenURI(0);
            expect(tokenId).to.equal(`https://ipfs.io/ipfs/QmXW1JcRvBuzW7v5KkxyWxrsWWtJJiGQNTdCuUceYC2Nw2?filename=bike.png`);
        });
    });

    /**
     * Test cases for the withdrawals from the CrowdFunding contract
     */
    describe("Withdrawals", function () {
        it("Should allow owner to withdraw after crowdfunding ends", async function () {
            await crowdFunding.connect(addr1).contribute(firstName, lastName, email, { value: minContribution });
            await time.increase(duration + 1);
            await expect(crowdFunding.withdraw()).to.changeEtherBalance(owner, minContribution);
        });

        it("Should not allow non-owners to withdraw", async function () {
            await expect(crowdFunding.connect(addr1).withdraw())
                .to.be.revertedWithCustomError(crowdFunding, "CrowdFunding__OnlyOwnerOperation");
        });

        it("Should not allow withdrawal before crowdfunding ends", async function () {
            await expect(crowdFunding.withdraw())
                .to.be.revertedWithCustomError(crowdFunding, "CrowdFunding__CrowdFundingIsStillOpen");
        });
    });

    /**
     * Test cases for the contributor management in the CrowdFunding contract
     */
    describe("Contributor Management", function () {
        it("Should add new contributor", async function () {
            await crowdFunding.connect(addr1).contribute(firstName, lastName, email, { value: minContribution });
            const contributors = await crowdFunding.getFunders();
            expect(contributors.length).to.equal(1);
            expect(contributors[0].email).to.equal(email);
        });

        it("Should update existing contributor", async function () {
            await crowdFunding.connect(addr1).contribute(firstName, lastName, email, { value: minContribution });
            await crowdFunding.connect(addr1).contribute(firstName, lastName, email, { value: minContribution });
            const contributors = await crowdFunding.getFunders();
            expect(contributors.length).to.equal(1);
            expect(contributors[0].totalContributions).to.equal(minContribution * 2n);
        });

        it("Should return correct total contribution for a contributor", async function () {
            await crowdFunding.connect(addr1).contribute(firstName, lastName, email, { value: minContribution * 2n });
            expect(await crowdFunding.connect(addr1).getTotalContributionByContributor()).to.equal(minContribution * 2n);
        });
    });

    /**
     * Test cases for miscellaneous functions in the CrowdFunding
     */
    describe("Miscellaneous", function () {
        it("Should reject direct transfers", async function () {
            await expect(addr1.sendTransaction({ to: await crowdFunding.getAddress(), value: ethers.parseEther("1") }))
                .to.be.revertedWithCustomError(crowdFunding, "CrowdFunding__CallContributeFunction");
        });

        it("Should return correct total funds raised", async function () {
            await crowdFunding.connect(addr1).contribute(firstName, lastName, email, { value: minContribution });
            await crowdFunding.connect(addr2).contribute(firstName, lastName, email, { value: minContribution * 2n });
            expect(await crowdFunding.getTotalFundsRaised()).to.equal(minContribution * 3n);
        });

        it("Should return correct total NFTs issued", async function () {
            await crowdFunding.connect(addr1).contribute(firstName, lastName, email, { value: minContribution });
            await crowdFunding.connect(addr2).contribute(firstName, lastName, email, { value: minContribution });
            expect(await crowdFunding.getCountOfNFTsIssued()).to.equal(2);
        });
    });

    /**
     * Test cases for the owner function updating the CrowdFunding goal
     */
    describe("updateCrowdFundingGoal", function () {
        it("Should allow owner to update the crowdfunding goal", async function () {
            const newGoal = ethers.parseEther("1500");
            await crowdFunding.updateCrowdFundingGoal(newGoal);
            expect(await crowdFunding.s_crowdFundingGoal()).to.equal(newGoal);
        });

        it("Should revert if new goal is less than or equal to total contributions", async function () {
            // Contribute some amount
            await crowdFunding.connect(addr1).contribute(firstName, lastName, email, { value: ethers.parseEther("5") });

            // Try to set new goal less than total contributions
            const newGoal = ethers.parseEther("4");
            await expect(crowdFunding.updateCrowdFundingGoal(newGoal))
                .to.be.revertedWithCustomError(crowdFunding, "CrowdFunding__NewGoalShouldBeGreaterThanTotalContributions")
                .withArgs("New goal should be greater than total contributions made till now.");
        });

        it("Should revert if called by non-owner", async function () {
            const newGoal = ethers.parseEther("15");
            await expect(crowdFunding.connect(addr1).updateCrowdFundingGoal(newGoal))
                .to.be.revertedWithCustomError(crowdFunding, "CrowdFunding__OnlyOwnerOperation")
                .withArgs("Only the owner can perform this operation");
        });
    });

    /**
     * Test cases for the owner function updating the CrowdFunding duration
     */
    describe("updateMinimumContribution", function () {
        it("Should allow owner to update the minimum contribution", async function () {
            const newMinContribution = ethers.parseEther("0.2");
            await crowdFunding.updateMinimumContribution(newMinContribution);
            expect(await crowdFunding.s_minContribution()).to.equal(newMinContribution);
        });

        it("Should revert if new minimum contribution is less than or equal to 0", async function () {
            const newMinContribution = 0;
            await expect(crowdFunding.updateMinimumContribution(newMinContribution))
                .to.be.revertedWithCustomError(crowdFunding, "CrowdFunding__MinimumContributionMustBeGreaterThanZero")
                .withArgs("Contribution should be greater than minimum contribution");
        });

        it("Should revert if called by non-owner", async function () {
            const newMinContribution = ethers.parseEther("0.2");
            await expect(crowdFunding.connect(addr1).updateMinimumContribution(newMinContribution))
                .to.be.revertedWithCustomError(crowdFunding, "CrowdFunding__OnlyOwnerOperation")
                .withArgs("Only the owner can perform this operation");
        });
    });

    describe("getHighestContributor", function () {
        it("should return empty contributor when there are no contributors", async function () {
            const highestContributor = await crowdFunding.getHighestContributor();
            expect(highestContributor.totalContributions).to.equal(0);
        });

        it("should return the highest contributor when there is only one contributor", async function () {
            await crowdFunding.connect(addr1).contribute(firstName, lastName, email, { value: ethers.parseEther("1") });

            const highestContributor = await crowdFunding.getHighestContributor();
            expect(highestContributor.contributorAddress).to.equal(addr1);
            expect(highestContributor.totalContributions).to.equal(ethers.parseEther("1"));
        });

        it("should return the highest contributor when there are multiple contributors", async function () {
            await crowdFunding.connect(addr1).contribute("fname", "lname", "fn@gmail.com", { value: ethers.parseEther("1") });
            await crowdFunding.connect(addr2).contribute("fname2", "lname2", "fn2@gmail.com", { value: ethers.parseEther("2") });
            await crowdFunding.connect(addr3).contribute("fname3", "lname3", "fn3@gmail.com", { value: ethers.parseEther("0.5") });

            const highestContributor = await crowdFunding.getHighestContributor();
            expect(highestContributor.contributorAddress).to.equal(addr2.address);
            expect(highestContributor.totalContributions).to.equal(ethers.parseEther("2"));
        });

        it("should return the first highest contributor when there are multiple contributors with the same highest contribution", async function () {
            await crowdFunding.connect(addr1).contribute("fname", "lname", "fn@gmail.com", { value: ethers.parseEther("2") });
            await crowdFunding.connect(addr2).contribute("fname2", "lname2", "fn2@gmail.com", { value: ethers.parseEther("2") });
            await crowdFunding.connect(addr3).contribute("fname3", "lname3", "fn3@gmail.com", { value: ethers.parseEther("0.5") });

            const highestContributor = await crowdFunding.getHighestContributor();
            expect(highestContributor.contributorAddress).to.equal(addr1.address);
            expect(highestContributor.totalContributions).to.equal(ethers.parseEther("2"));
        });

        it("should update highest contributor when a contributor increases their contribution", async function () {
            await crowdFunding.connect(addr1).contribute("fname", "lname", "fn@gmail.com", { value: ethers.parseEther("1") });
            await crowdFunding.connect(addr2).contribute("fname2", "lname2", "fn2@gmail.com", { value: ethers.parseEther("2") });

            const highestContributor = await crowdFunding.getHighestContributor();
            expect(highestContributor.contributorAddress).to.equal(addr2.address);
            expect(highestContributor.totalContributions).to.equal(ethers.parseEther("2"));

            await crowdFunding.connect(addr1).contribute("fname", "lname", "fn@gmail.com", { value: ethers.parseEther("2") });

            const updatedHighestContributor = await crowdFunding.getHighestContributor();
            expect(updatedHighestContributor.contributorAddress).to.equal(addr1.address);
            expect(updatedHighestContributor.totalContributions).to.equal(ethers.parseEther("3"));
        });
    });

    describe("closeCrowdFunding", function () {
        it("should close the crowd funding", async function () {
            await crowdFunding.closeCrowdFunding();

            const isOpen = await crowdFunding.isOpen();
            expect(isOpen).to.be.false;
        });
    });

    describe("updateCrowdFundingEndTime", function () {
        it("should update the end time when called by the owner", async function () {
            const currentTime = Math.ceil(Date.now() / 1000);
            const newEndTime = currentTime + (100 * 24 * 60 * 60); // 100 day from now

            await crowdFunding.updateCrowdFundingEndTime(newEndTime);

            const updatedEndTime = await crowdFunding.s_CrowdFundingEndTime();
            expect(updatedEndTime).to.equal(newEndTime);
        });

        it("should revert when called by a non-owner", async function () {
            const currentTime = Math.floor(Date.now() / 1000);
            const newEndTime = currentTime + 3600; // 1 hour from now

            await expect(crowdFunding.connect(addr1).updateCrowdFundingEndTime(newEndTime))
                .to.be.revertedWithCustomError(crowdFunding, "CrowdFunding__OnlyOwnerOperation")
                .withArgs("Only the owner can perform this operation");
        });

        it("should revert when new end time is not greater than current time", async function () {
            const currentTime = Math.floor(Date.now() / 1000);
            const newEndTime = currentTime - 3600; // 1 hour ago

            await expect(
                crowdFunding.updateCrowdFundingEndTime(newEndTime)
            ).to.be.revertedWithCustomError(
                crowdFunding,
                "CrowdFunding__NewEndTimeShouldBeGreaterThanCurrentTime"
            ).withArgs("New end time should be greater than current time.");
        });
    });
});