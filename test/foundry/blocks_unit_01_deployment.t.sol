// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "./blocks_unit_00_setup.t.sol";

/// @title ArtProject01 Deployment Tests
/// @notice Unit testing for the deployment and initial state of the ArtProject01 contract
/// @dev Contains comprehensive unit tests for contract deployment, roles, and initial state
contract ArtProject01DeploymentTest is ArtProjectTestSetup {
    /**
     * ================================================================================
     *             test_Deployment_BasicParameters
     * ================================================================================
     */

    /// @notice Tests that the contract was deployed with the correct basic parameters
    /// @dev Verifies name, symbol, and role assignments
    function testDeployment() public {
        // Test that the contract was deployed successfully
        assertEq(artProject.name(), "ArtProject01");
        assertEq(artProject.symbol(), "ART");

        // Test that roles were assigned correctly
        assertTrue(artProject.hasRole(artProject.DEFAULT_ADMIN_ROLE(), owner));
        assertTrue(artProject.hasRole(artProject.ADMIN_ROLE(), admin));
        assertFalse(artProject.hasRole(artProject.ADMIN_ROLE(), owner));

        // Test that deployment time was set correctly
        assertEq(artProject.deploymentTime(), deploymentTime);
    }

    /**
     * ================================================================================
     *             test_RoleAssignments
     * ================================================================================
     */

    /// @notice Tests that roles were assigned correctly during deployment
    /// @dev Verifies that only specified addresses have their designated roles
    function test_unit_01_Deployment_01_RoleAssignments() public {
        // Test that other addresses don't have roles by default
        address randomUser = address(0x4);
        assertFalse(
            artProject.hasRole(artProject.DEFAULT_ADMIN_ROLE(), randomUser)
        );
        assertFalse(artProject.hasRole(artProject.ADMIN_ROLE(), randomUser));

        // Test that admin doesn't have DEFAULT_ADMIN_ROLE
        assertFalse(artProject.hasRole(artProject.DEFAULT_ADMIN_ROLE(), admin));
    }

    /**
     * ================================================================================
     *             test_InitialState
     * ================================================================================
     */

    /// @notice Tests that the contract's initial state variables are set correctly
    /// @dev Verifies token counter, external wallet, minting status, and test mode
    function test_unit_01_Deployment_02_InitialState() public {
        // Test initial state variables
        assertEq(artProject.tokenCounter(), 0);
        assertEq(artProject.EXTERNAL_WALLET(), externalWallet);
        assertEq(artProject.mintingStopped(), false);
        assertEq(artProject.totalSupply(), 0);
        assertEq(artProject.testMode(), true);
    }

    /**
     * ================================================================================
     *             test_Constants
     * ================================================================================
     */

    /// @notice Tests that all contract constants are set to their expected values
    /// @dev Verifies pricing parameters, supply limits, and timing constants
    function test_unit_01_Deployment_03_Constants() public {
        // Test all defined constants
        assertEq(artProject.BASE_PRICE(), 0.005 ether);
        assertEq(artProject.MAX_SUPPLY(), 512);
        assertEq(artProject.COMMITMENT_DELAY(), 15 seconds);
        assertEq(artProject.TOKENS_PER_DAY(), 24);
        assertEq(artProject.PRICE_INCREMENT(), 0.01 ether);
        assertEq(artProject.COLOR_MODE_THRESHOLD(), 255);
    }

    /**
     * ================================================================================
     *             test_CurrentPrice
     * ================================================================================
     */

    /// @notice Tests that the currentPrice function returns the expected initial price
    /// @dev Verifies the bonding curve pricing starts at BASE_PRICE
    function test_unit_01_Deployment_04_CurrentPrice() public {
        // Test that currentPrice returns the BASE_PRICE initially
        assertEq(artProject.currentPrice(), 0.005 ether);
    }

    /**
     * ================================================================================
     *             test_CommitmentFunctions
     * ================================================================================
     */

    /// @notice Tests the initial state of the commitment system
    /// @dev Verifies that new users have no active commitments
    function test_unit_01_Deployment_05_CommitmentFunctions() public {
        // Create a mock commitment hash
        bytes32 mockCommitmentHash = keccak256(
            abi.encodePacked("test commitment")
        );

        // Test initial state - user should have no commitment
        assertEq(artProject.commitments(address(this)), bytes32(0));
        assertEq(artProject.commitmentTimestamps(address(this)), 0);
    }

    /**
     * ================================================================================
     *             test_AvailablePixels
     * ================================================================================
     */

    /// @notice Tests the functionality to update a user's available pixels
    /// @dev Verifies that admin can update pixel allowances and they're stored correctly
    function test_unit_01_Deployment_06_AvailablePixels() public {
        address testUser = address(0x5);

        // Initial available pixels should be 0
        assertEq(artProject.availablePixels(testUser), 0);

        // Admin should be able to update available blocks
        vm.startPrank(admin);
        artProject.updateAvailableBlocks(testUser, 10, 20);
        vm.stopPrank();

        // Should be updated to 10 * 20 = 200
        assertEq(artProject.availablePixels(testUser), 200);
    }

    /**
     * ================================================================================
     *             test_CountBlackPixels
     * ================================================================================
     */

    /// @notice Tests the countBlackPixels function with known values
    /// @dev Verifies that the function correctly counts the number of set bits in the art data
    function test_unit_01_Deployment_07_CountBlackPixels() public {
        // Create test art data with known number of black pixels
        bytes32[4] memory artData;

        // Set a single bit in the first bytes32
        artData[0] = bytes32(uint256(1)); // Only 1 bit set

        // Count should be 1
        assertEq(artProject.countBlackPixels(artData), 1);

        // Set another bit
        artData[0] = bytes32(uint256(3)); // 2 bits set (binary: 11)

        // Count should be 2
        assertEq(artProject.countBlackPixels(artData), 2);

        // Test with more complex pattern
        artData[0] = bytes32(
            uint256(
                0x00000000000000000000000000000000000000000000000000000000FFFF0000
            )
        );

        // This should have 16 bits set (FFFF = 16 bits)
        assertEq(artProject.countBlackPixels(artData), 16);
    }
}
