// EscrowContract.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

contract EscrowContract {
    address payable public payer;  // Make payer payable
    address payable public payee;
    address public arbiter;
    uint256 public amount;
    bool public releaseApproved;
    bool public fundsDeposited;

    event FundsDeposited(address indexed payer, uint256 amount);
    event ReleaseApproved(address indexed payer, address indexed payee, uint256 amount);
    event FundsWithdrawn(address indexed payer, uint256 amount);

    constructor(address _payee, address _arbiter) {
        payer = payable(msg.sender);
        payee = payable(_payee);
        arbiter = _arbiter;
        releaseApproved = false;
        fundsDeposited = false;
    }

    modifier onlyPayer() {
        require(msg.sender == payer, "Only payer can call this function");
        _;
    }

    modifier onlyPayee() {
        require(msg.sender == payee, "Only payee can call this function");
        _;
    }

    modifier onlyArbiter() {
        require(msg.sender == arbiter, "Only arbiter can call this function");
        _;
    }

    modifier escrowNotReleased() {
        require(!releaseApproved, "Escrow has already been released");
        _;
    }

    modifier escrowFundsDeposited() {
        require(fundsDeposited, "Funds have not been deposited yet");
        _;
    }

    function deposit() external payable onlyPayer {
        require(!fundsDeposited, "Funds have already been deposited");
        require(msg.value > 0, "Amount should be greater than 0");
        amount = msg.value;
        fundsDeposited = true;
        emit FundsDeposited(payer, amount);
    }

    function releaseToPayee() external onlyPayee escrowNotReleased escrowFundsDeposited {
        releaseApproved = true;
        payee.transfer(amount);
        emit ReleaseApproved(payer, payee, amount);
    }

    function withdraw() external onlyPayer escrowNotReleased escrowFundsDeposited {
        payer.transfer(amount);
        emit FundsWithdrawn(payer, amount);
    }
}