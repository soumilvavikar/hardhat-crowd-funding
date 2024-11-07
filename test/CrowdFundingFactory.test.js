const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrowdFundingFactory", function () {
  let CrowdFundingFactory;
  let factory;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    CrowdFundingFactory = await ethers.getContractFactory("CrowdFundingFactory");
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy the factory contract
    factory = await CrowdFundingFactory.deploy();
    // Wait for the contract to be mined
    await factory.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy the factory contract", async function () {
      expect(await factory.getAddress()).to.be.properAddress;
    });
  });

  describe("Creating CrowdFunding campaigns", function () {
    it("Should create a new CrowdFunding campaign", async function () {
      const minimumContribution = ethers.parseEther("0.1");
      const goal = ethers.parseEther("10");
      const duration = 86400; // 1 day in seconds

      await expect(factory.createCrowdFunding(minimumContribution, goal, duration))
        .to.emit(factory, "CrowdFundingCreated")
        .withArgs(ethers.isAddress, owner.address);

      const deployedCampaigns = await factory.getDeployedCrowdFundings();
      expect(deployedCampaigns.length).to.equal(1);
    });

    it("Should create multiple CrowdFunding campaigns", async function () {
      const minimumContribution = ethers.parseEther("0.1");
      const goal = ethers.parseEther("10");
      const duration = 86400; // 1 day in seconds

      await factory.createCrowdFunding(minimumContribution, goal, duration);
      await factory.createCrowdFunding(minimumContribution, goal, duration);
      await factory.createCrowdFunding(minimumContribution, goal, duration);

      const deployedCampaigns = await factory.getDeployedCrowdFundings();
      expect(deployedCampaigns.length).to.equal(3);
    });
  });

  describe("Retrieving deployed campaigns", function () {
    it("Should return the correct number of deployed campaigns", async function () {
      const minimumContribution = ethers.parseEther("0.1");
      const goal = ethers.parseEther("10");
      const duration = 86400; // 1 day in seconds

      await factory.createCrowdFunding(minimumContribution, goal, duration);
      await factory.createCrowdFunding(minimumContribution, goal, duration);

      const count = await factory.getDeployedCrowdFundingsCount();
      expect(count).to.equal(2);
    });

    it("Should return the correct addresses of deployed campaigns", async function () {
      const minimumContribution = ethers.parseEther("0.1");
      const goal = ethers.parseEther("10");
      const duration = 86400; // 1 day in seconds

      await factory.createCrowdFunding(minimumContribution, goal, duration);
      await factory.createCrowdFunding(minimumContribution, goal, duration);

      const deployedCampaigns = await factory.getDeployedCrowdFundings();
      expect(deployedCampaigns.length).to.equal(2);
      expect(deployedCampaigns[0]).to.be.properAddress;
      expect(deployedCampaigns[1]).to.be.properAddress;
    });
  });
});