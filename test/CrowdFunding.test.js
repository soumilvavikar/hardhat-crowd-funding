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
    const goal = BigInt(ethers.parseEther("10"));
    const duration = 7 * 24 * 60 * 60; // 7 days

    /**
     * beforeEach hook to deploy the CrowdFunding contract
     */
    beforeEach(async function () {
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
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
                .to.be.revertedWithCustomError(crowdFunding, "CrowdFunding__OnlyOwnerCanWithdraw");
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
            await crowdFunding.connect(addr2).contribute("Jane", lastName, "jane@example.com", { value: minContribution * 2n });
            expect(await crowdFunding.getTotalFundsRaised()).to.equal(minContribution * 3n);
        });

        it("Should return correct total NFTs issued", async function () {
            await crowdFunding.connect(addr1).contribute(firstName, lastName, email, { value: minContribution });
            await crowdFunding.connect(addr2).contribute("Jane", lastName, "jane@example.com", { value: minContribution });
            expect(await crowdFunding.getTotalNFTsIssued()).to.equal(2);
        });
    });
});