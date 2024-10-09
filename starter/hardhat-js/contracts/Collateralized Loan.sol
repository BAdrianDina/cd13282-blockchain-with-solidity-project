// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Collateralized Loan Contract
contract CollateralizedLoan {
    // Define the structure of a loan
    struct Loan {
        address payable borrower;
        address payable lender;
        uint collateralAmount;
        uint loanAmount;
        uint interestRate;
        uint dueDate;
        bool isFunded;
        bool isRepaid;
    }

    // Create a mapping to manage the loans
    mapping(uint => Loan) public loans;
    uint public nextLoanId;


    // Hint: Define events for loan requested, funded, repaid, and collateral claimed
    /*  Event LoanRequested that is emitted when a new loan is requested. 
        It includes the loan details (ID, borrower, collateral, loan amount, interest rate, 
        and due date).
    */
    // Events for loan requested, funded, repaid, and collateral claimed
    event LoanRequested(uint loanId, address borrower, uint collateralAmount, uint loanAmount, uint interestRate, uint dueDate);
    event LoanFunded(uint loanId, address indexed lender);
    event LoanRepaid(uint loanId);
    event CollateralClaimed(uint loanId);

    // Custom Modifiers
    // Hint: Write a modifier to check if a loan exists
    // Hint: Write a modifier to ensure a loan is not already funded
    modifier loanExists(uint loanId) {
        require(loans[loanId].borrower != address(0), "Loan does not exist");
        _;
    }

    // Modifier to ensure a loan is not already funded
    modifier notFunded(uint loanId) {
        require(!loans[loanId].isFunded, "Loan is already funded");
        _;
    }


   // Function to deposit collateral and request a loan
    function depositCollateralAndRequestLoan(uint _interestRate, uint _duration) external payable {
        require(msg.value > 0, "Collateral amount must be greater than 0");

        // Calculate the loan amount based on the collateralized amount
        uint loanAmount = (msg.value * 50) / 100;

        // Set due date based on the duration provided by the borrower
        uint dueDate = block.timestamp + _duration;

        // Create a new loan
        loans[nextLoanId] = Loan({
            borrower: payable(msg.sender),  // Cast msg.sender to payable
            lender: payable(address(0)),  // Set initial lender to payable zero address
            collateralAmount: msg.value,
            loanAmount: loanAmount,
            interestRate: _interestRate,
            dueDate: dueDate,
            isFunded: false,
            isRepaid: false
        });

        // Emit an event for loan request
        emit LoanRequested(nextLoanId, msg.sender, msg.value, loanAmount, _interestRate, dueDate);

        // Increment the loan ID for the next loan
        nextLoanId++;
    }




    // Function to fund a loan
    function fundLoan(uint loanId) external payable loanExists(loanId) notFunded(loanId) {
        Loan storage loan = loans[loanId];
    
        // Ensure the exact loan amount is sent by the lender
        require(msg.value == loan.loanAmount, "Incorrect loan amount sent");

        // Set the lender and mark the loan as funded
        loan.lender = payable(msg.sender); // Store lender's address
        loan.isFunded = true;

        // Transfer the loan amount to the borrower
        loan.borrower.transfer(msg.value);

        // Emit the LoanFunded event
        emit LoanFunded(loanId, msg.sender);
    }

    // Function to repay a loan
    function repayLoan(uint loanId) external payable loanExists(loanId) {
        Loan storage loan = loans[loanId];
        require(loan.isFunded, "Loan not funded");
        require(!loan.isRepaid, "Loan already repaid");
        require(msg.sender == loan.borrower, "Only the borrower can repay the loan");

        // Calculate the total repayment amount (loan amount + interest)
        uint repaymentAmount = loan.loanAmount + (loan.loanAmount * loan.interestRate / 100);
        require(msg.value == repaymentAmount, "Incorrect repayment amount");
        require(block.timestamp <= loan.dueDate, "Loan repayment period has expired");

        loan.isRepaid = true;

        // Transfer the repayment amount to the lender
        loan.lender.transfer(msg.value);

        // Return the collateral to the borrower
        loan.borrower.transfer(loan.collateralAmount);

        emit LoanRepaid(loanId);
    }

    // Function to claim collateral on default
    function claimCollateral(uint loanId) external loanExists(loanId) {
        Loan storage loan = loans[loanId];
        require(loan.isFunded, "Loan not funded");
        require(!loan.isRepaid, "Loan already repaid");
        require(block.timestamp > loan.dueDate, "Loan is not yet in default");
        require(msg.sender == loan.lender, "Only the lender can claim the collateral");

        loan.isRepaid = true;

        // Transfer the collateral to the lender
        loan.lender.transfer(loan.collateralAmount);

        emit CollateralClaimed(loanId);
    }
}