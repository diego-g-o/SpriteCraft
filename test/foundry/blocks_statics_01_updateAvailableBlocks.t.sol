// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../packages/hardhat/contracts/blocks.sol";

contract UpdateAvailableBlocksTest is Test {
    ArtProject01 public artProject;
    address public owner = address(0x1);
    address public admin = address(0x2);
    address public externalWallet = address(0x3);

    // Test users
    address public user1 = address(0x100);
    address public user2 = address(0x101);
    address public user3 = address(0x102);
    address public user4 = address(0x103);
    address public user5 = address(0x104);
    address public user6 = address(0x105);
    address public user7 = address(0x106);
    address public user8 = address(0x107);
    address public user9 = address(0x108);
    address public user10 = address(0x109);

    // Constants from the contract - retrieved dynamically
    uint256 public NONCE_MULTIPLIER;
    uint256 public MAX_PRODUCT;

    function setUp() public {
        vm.warp(1672531200); // January 1, 2023

        // Deploy the contract
        artProject = new ArtProject01(
            "ArtProject01",
            "ART01",
            owner,
            admin,
            externalWallet
        );

        // Set up admin for calling updateAvailableBlocks
        vm.startPrank(admin);
    }

    function test_statics_01_01_Scenario1_NewUserMinimumActivity() public {
        // Scenario 1: New user with 1 transaction and 1 day account age
        uint256 nonce = 1;
        uint256 firstTxTime = block.timestamp - 1 days;

        artProject.updateAvailableBlocks(user1, nonce, firstTxTime);
        uint256 pixels = artProject.availablePixels(user1);

        console.log("Scenario 1: New user (1 day, 1 tx)");
        console.log("Nonce:", nonce);
        console.log(
            "Account age in days:",
            (block.timestamp - firstTxTime) / 1 days
        );
        console.log("Available pixels:", pixels);
        console.log("Percentage of max (1024):", (pixels * 100) / 1024, "%");
        console.log("-----------------------------------");
    }

    function test_statics_01_02_OneMonthModerateActivity() public {
        // Scenario 2: User with 1 month account age and 10 transactions
        uint256 nonce = 10;
        uint256 firstTxTime = block.timestamp - 30 days;

        artProject.updateAvailableBlocks(user2, nonce, firstTxTime);
        uint256 pixels = artProject.availablePixels(user2);

        console.log("Scenario 2: 1 month user (10 tx)");
        console.log("Nonce:", nonce);
        console.log(
            "Account age in days:",
            (block.timestamp - firstTxTime) / 1 days
        );
        console.log("Available pixels:", pixels);
        console.log("Percentage of max (1024):", (pixels * 100) / 1024, "%");
        console.log("-----------------------------------");
    }

    function test_statics_01_03_SixMonthsRegularActivity() public {
        // Scenario 3: User with 6 months account age and 50 transactions
        uint256 nonce = 50;
        uint256 firstTxTime = block.timestamp - 180 days;

        artProject.updateAvailableBlocks(user3, nonce, firstTxTime);
        uint256 pixels = artProject.availablePixels(user3);

        console.log("Scenario 3: 6 month user (50 tx)");
        console.log("Nonce:", nonce);
        console.log(
            "Account age in days:",
            (block.timestamp - firstTxTime) / 1 days
        );
        console.log("Available pixels:", pixels);
        console.log("Percentage of max (1024):", (pixels * 100) / 1024, "%");
        console.log("-----------------------------------");
    }

    function test_statics_01_04_OneYearActiveUser() public {
        // Scenario 4: User with 1 year account age and 100 transactions
        uint256 nonce = 100;
        uint256 firstTxTime = block.timestamp - 365 days;

        artProject.updateAvailableBlocks(user4, nonce, firstTxTime);
        uint256 pixels = artProject.availablePixels(user4);

        console.log("Scenario 4: 1 year user (100 tx)");
        console.log("Nonce:", nonce);
        console.log(
            "Account age in days:",
            (block.timestamp - firstTxTime) / 1 days
        );
        console.log("Available pixels:", pixels);
        console.log("Percentage of max (1024):", (pixels * 100) / 1024, "%");
        console.log("-----------------------------------");
    }

    function test_statics_01_05_TwoYearsPowerUser() public {
        // Scenario 5: User with 2 years account age and 300 transactions
        uint256 nonce = 300;
        uint256 firstTxTime = block.timestamp - 730 days;

        artProject.updateAvailableBlocks(user5, nonce, firstTxTime);
        uint256 pixels = artProject.availablePixels(user5);

        console.log("Scenario 5: 2 year user (300 tx)");
        console.log("Nonce:", nonce);
        console.log(
            "Account age in days:",
            (block.timestamp - firstTxTime) / 1 days
        );
        console.log("Available pixels:", pixels);
        console.log("Percentage of max (1024):", (pixels * 100) / 1024, "%");
        console.log("-----------------------------------");
    }

    function test_statics_01_06_FiveYearsModerateActivity() public {
        // Scenario 6: User with 5 years account age but only 200 transactions
        uint256 nonce = 200;
        uint256 firstTxTime = block.timestamp - 1825 days;

        artProject.updateAvailableBlocks(user6, nonce, firstTxTime);
        uint256 pixels = artProject.availablePixels(user6);

        console.log("Scenario 6: 5 year user (200 tx)");
        console.log("Nonce:", nonce);
        console.log(
            "Account age in days:",
            (block.timestamp - firstTxTime) / 1 days
        );
        console.log("Available pixels:", pixels);
        console.log("Percentage of max (1024):", (pixels * 100) / 1024, "%");
        console.log("-----------------------------------");
    }

    function test_statics_01_07_FiveYearsHighActivity() public {
        // Scenario 7: User with 5 years account age and 600 transactions
        uint256 nonce = 600;
        uint256 firstTxTime = block.timestamp - 1825 days;

        artProject.updateAvailableBlocks(user7, nonce, firstTxTime);
        uint256 pixels = artProject.availablePixels(user7);

        console.log("Scenario 7: 5 year user (600 tx)");
        console.log("Nonce:", nonce);
        console.log(
            "Account age in days:",
            (block.timestamp - firstTxTime) / 1 days
        );
        console.log("Available pixels:", pixels);
        console.log("Percentage of max (1024):", (pixels * 100) / 1024, "%");
        console.log("-----------------------------------");
    }

    function test_statics_01_08_EightYearsModerateActivity() public {
        // Scenario 8: User with 8 years account age and 500 transactions
        uint256 nonce = 500;
        uint256 firstTxTime = block.timestamp - 2920 days;

        artProject.updateAvailableBlocks(user8, nonce, firstTxTime);
        uint256 pixels = artProject.availablePixels(user8);

        console.log("Scenario 8: 8 year user (500 tx)");
        console.log("Nonce:", nonce);
        console.log(
            "Account age in days:",
            (block.timestamp - firstTxTime) / 1 days
        );
        console.log("Available pixels:", pixels);
        console.log("Percentage of max (1024):", (pixels * 100) / 1024, "%");
        console.log("-----------------------------------");
    }

    function test_statics_01_09_TenYearsLowActivity() public {
        // Scenario 9: User with 10 years account age but only 100 transactions
        uint256 nonce = 100;
        uint256 firstTxTime = block.timestamp - 3650 days;

        artProject.updateAvailableBlocks(user9, nonce, firstTxTime);
        uint256 pixels = artProject.availablePixels(user9);

        console.log("Scenario 9: 10 year user (100 tx)");
        console.log("Nonce:", nonce);
        console.log(
            "Account age in days:",
            (block.timestamp - firstTxTime) / 1 days
        );
        console.log("Available pixels:", pixels);
        console.log("Percentage of max (1024):", (pixels * 100) / 1024, "%");
        console.log("-----------------------------------");
    }

    function test_statics_01_10_MaximumActivity() public {
        // Scenario 10: Maximum case - 10 years account age with 1000 transactions
        uint256 nonce = 1000;
        uint256 firstTxTime = block.timestamp - 3650 days;

        artProject.updateAvailableBlocks(user10, nonce, firstTxTime);
        uint256 pixels = artProject.availablePixels(user10);

        console.log("Scenario 10: Maximum case (10 years, 1000 tx)");
        console.log("Nonce:", nonce);
        console.log(
            "Account age in days:",
            (block.timestamp - firstTxTime) / 1 days
        );
        console.log("Available pixels:", pixels);
        console.log("Percentage of max (1024):", (pixels * 100) / 1024, "%");
        console.log("-----------------------------------");
    }
    /*
    function testAllScenariosTogether() public {
        // This function runs all scenarios in sequence to see the progression
        testScenario1_NewUserMinimumActivity();
        testScenario2_OneMonthModerateActivity();
        testScenario3_SixMonthsRegularActivity();
        testScenario4_OneYearActiveUser();
        testScenario5_TwoYearsPowerUser();
        testScenario6_FiveYearsModerateActivity();
        testScenario7_FiveYearsHighActivity();
        testScenario8_EightYearsModerateActivity();
        testScenario9_TenYearsLowActivity();
        testScenario10_MaximumActivity();

        // Additional explanation of the formula
        console.log("Formula Explanation:");
        console.log("product = (nonce * NONCE_MULTIPLIER) + timeDiff");
        console.log("newAllowance = (product * 1023) / MAX_PRODUCT + 1");
        console.log("Where:");
        console.log(
            "- NONCE_MULTIPLIER =",
            NONCE_MULTIPLIER,
            "(1 tx = 1 month worth of time)"
        );
        console.log("- MAX_PRODUCT =", MAX_PRODUCT, "(~10 years * 1000 txs)");
    }
    */
}
