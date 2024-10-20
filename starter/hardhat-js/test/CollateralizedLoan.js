// Importing necessary modules and functions from Hardhat and Chai for testing
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

// Describing a test suite for the CollateralizedLoan contract
describe("CollateralizedLoan", function () {

  
  // A fixture to deploy the contract before each test. This helps in reducing code repetition.
  
  async function deployCollateralizedLoanFixture() {
    try {
      // Get the contract factory
      const CollateralizedLoan = await ethers.getContractFactory("CollateralizedLoan");
    
      // Deploy the contract and ensure it is fully deployed
      const collateralizedLoan = await CollateralizedLoan.deploy(); 
      // No need to call deployed()
      console.log("Deployed contract address:", collateralizedLoan.address);    

      // Get signers for the borrower and lender
      const [borrower, lender] = await ethers.getSigners();
    
      // Return deployed contract and signers
      return { collateralizedLoan, borrower, lender };
    } catch (error) {
        console.error("Deployment failed:", error);
      throw error;
    }
}

  

  // Test to check if the contract is deployed and the address is defined
  it("Should deploy the contract and have a valid address", async function () {
    // Load the fixture
    const { collateralizedLoan } = await loadFixture(deployCollateralizedLoanFixture);
  
    // Ensure the contract is defined
    expect(collateralizedLoan).to.not.be.undefined;
  
    // Ensure the address is defined and valid
    console.log("Deployed Contract Address (from test):", collateralizedLoan.address);
    expect(collateralizedLoan.address).to.be.a('string');
    expect(collateralizedLoan.address).to.match(/^0x[a-fA-F0-9]{40}$/); // Match Ethereum address format
  });


  
  
  /*
  // Test suite for requesting a loan
  describe("Requesting a Loan", function () {
    it("Allows a borrower to request a loan by providing collateral", async function () {
      const { collateralizedLoan, borrower } = await loadFixture(deployCollateralizedLoanFixture);

      // Borrower requests a loan with collateral
      const interestRate = 10; // 10% interest rate
      const duration = 3600; // 1 hour duration
      const collateralAmount = ethers.utils.parseEther("1.0"); // 1 ETH collateral

      const tx = await collateralizedLoan.connect(borrower).depositCollateralAndRequestLoan(interestRate, duration, { value: collateralAmount });
      const receipt = await tx.wait();

      // Check if the LoanRequested event is emitted
      const loanRequestedEvent = receipt.events.find(event => event.event === "LoanRequested");
      expect(loanRequestedEvent).to.exist;
      expect(loanRequestedEvent.args.borrower).to.equal(borrower.address);
      expect(loanRequestedEvent.args.collateralAmount).to.equal(collateralAmount);
    });
  });


// Test suite for funding a loan
  describe("Funding a Loan", function () {
    it("Allows a lender to fund a requested loan", async function () {
    const { collateralizedLoan, borrower, lender } = await loadFixture(deployCollateralizedLoanFixture);

    // Borrower requests a loan
    const interestRate = 10; // 10% interest rate
    const duration = 3600; // 1 hour duration
    const collateralAmount = ethers.utils.parseEther("1.0"); // 1 ETH collateral
    const loanAmount = ethers.utils.parseEther("0.5"); // 50% loan

    await collateralizedLoan.connect(borrower).depositCollateralAndRequestLoan(interestRate, duration, { value: collateralAmount });

    // Lender funds the loan
    const tx = await collateralizedLoan.connect(lender).fundLoan(0, { value: loanAmount });
    const receipt = await tx.wait();

    // Check if the LoanFunded event is emitted
    const loanFundedEvent = receipt.events.find(event => event.event === "LoanFunded");
    expect(loanFundedEvent).to.exist;
    expect(loanFundedEvent.args.lender).to.equal(lender.address);
  });

  it("Prevents funding a loan with incorrect amount", async function () {
    const { collateralizedLoan, borrower, lender } = await loadFixture(deployCollateralizedLoanFixture);

    // Borrower requests a loan
    const interestRate = 10; // 10% interest rate
    const duration = 3600; // 1 hour duration
    const collateralAmount = ethers.utils.parseEther("1.0"); // 1 ETH collateral
    const loanAmount = ethers.utils.parseEther("0.5"); // 50% loan

    await collateralizedLoan.connect(borrower).depositCollateralAndRequestLoan(interestRate, duration, { value: collateralAmount });

    // Lender tries to fund the loan with the wrong amount
    const incorrectLoanAmount = ethers.utils.parseEther("0.4"); // Less than required

    await expect(
      collateralizedLoan.connect(lender).fundLoan(0, { value: incorrectLoanAmount })
    ).to.be.revertedWith("Incorrect loan amount sent");
    });
  });


  // Test suite for repaying a loan
  describe("Repaying a Loan", function () {
    it("Enables the borrower to repay the loan fully", async function () {
      const { collateralizedLoan, borrower, lender } = await loadFixture(deployCollateralizedLoanFixture);

      // Borrower requests a loan
      const interestRate = 10; // 10% interest rate
      const duration = 3600; // 1 hour duration
      const collateralAmount = ethers.utils.parseEther("1.0"); // 1 ETH collateral
      const loanAmount = ethers.utils.parseEther("0.5"); // 50% loan

      await collateralizedLoan.connect(borrower).depositCollateralAndRequestLoan(interestRate, duration, { value: collateralAmount });

      // Lender funds the loan
      await collateralizedLoan.connect(lender).fundLoan(0, { value: loanAmount });

      // Borrower repays the loan
      const repaymentAmount = ethers.utils.parseEther("0.55"); // 0.5 loan amount + 10% interest
      const tx = await collateralizedLoan.connect(borrower).repayLoan(0, { value: repaymentAmount });
      const receipt = await tx.wait();

      // Check if the LoanRepaid event is emitted
      const loanRepaidEvent = receipt.events.find(event => event.event === "LoanRepaid");
      expect(loanRepaidEvent).to.exist;
    });

    it("Prevents repayment with incorrect amount", async function () {
      const { collateralizedLoan, borrower, lender } = await loadFixture(deployCollateralizedLoanFixture);

      // Borrower requests a loan
      const interestRate = 10; // 10% interest rate
      const duration = 3600; // 1 hour duration
      const collateralAmount = ethers.utils.parseEther("1.0"); // 1 ETH collateral
      const loanAmount = ethers.utils.parseEther("0.5"); // 50% loan

      await collateralizedLoan.connect(borrower).depositCollateralAndRequestLoan(interestRate, duration, { value: collateralAmount });

      // Lender funds the loan
      await collateralizedLoan.connect(lender).fundLoan(0, { value: loanAmount });

      // Borrower tries to repay with the wrong amount
      const incorrectRepaymentAmount = ethers.utils.parseEther("0.53"); // Less than required

      await expect(
        collateralizedLoan.connect(borrower).repayLoan(0, { value: incorrectRepaymentAmount })
      ).to.be.revertedWith("Incorrect repayment amount");
    });
  });

  
  // Test suite for claiming collateral
  describe("Claiming Collateral", function () {
    it("Permits the lender to claim collateral if the loan isn't repaid on time", async function () {
      const { collateralizedLoan, borrower, lender } = await loadFixture(deployCollateralizedLoanFixture);

      // Borrower requests a loan
      const interestRate = 10; // 10% interest rate
      const duration = 3600; // 1 hour duration
      const collateralAmount = ethers.utils.parseEther("1.0"); // 1 ETH collateral
      const loanAmount = ethers.utils.parseEther("0.5"); // 50% loan

      await collateralizedLoan.connect(borrower).depositCollateralAndRequestLoan(interestRate, duration, { value: collateralAmount });

      // Lender funds the loan
      await collateralizedLoan.connect(lender).fundLoan(0, { value: loanAmount });

      // Simulate passage of time (loan becomes overdue)
      await ethers.provider.send("evm_increaseTime", [3601]); // Fast-forward by 1 hour and 1 second
      await ethers.provider.send("evm_mine", []);

      // Lender claims the collateral
      const tx = await collateralizedLoan.connect(lender).claimCollateral(0);
      const receipt = await tx.wait();

      // Check if the CollateralClaimed event is emitted
      const collateralClaimedEvent = receipt.events.find(event => event.event === "CollateralClaimed");
      expect(collateralClaimedEvent).to.exist;
      expect(collateralClaimedEvent.args.loanId).to.equal(0);
    });

    it("Prevents the lender from claiming collateral if the loan is repaid on time", async function () {
      const { collateralizedLoan, borrower, lender } = await loadFixture(deployCollateralizedLoanFixture);

      // Borrower requests a loan
      const interestRate = 10; // 10% interest rate
      const duration = 3600; // 1 hour duration
      const collateralAmount = ethers.utils.parseEther("1.0"); // 1 ETH collateral
      const loanAmount = ethers.utils.parseEther("0.5"); // 50% loan

      await collateralizedLoan.connect(borrower).depositCollateralAndRequestLoan(interestRate, duration, { value: collateralAmount });

      // Lender funds the loan
      await collateralizedLoan.connect(lender).fundLoan(0, { value: loanAmount });

      // Borrower repays the loan before the due date
      const repaymentAmount = ethers.utils.parseEther("0.55"); // 0.5 loan amount + 10% interest
      await collateralizedLoan.connect(borrower).repayLoan(0, { value: repaymentAmount });

      // Lender tries to claim collateral but should be reverted
      await expect(
        collateralizedLoan.connect(lender).claimCollateral(0)
      ).to.be.revertedWith("Loan already repaid");
    });
  });
  */

});