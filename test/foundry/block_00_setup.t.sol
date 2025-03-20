// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../packages/hardhat/contracts/blocks.sol";

/// @title ArtProject Test Setup
/// @notice Base contract for ArtProject01 tests with common setup and helper functions
/// @dev Provides shared functionality for all ArtProject01 test contracts
contract ArtProjectTestSetup is Test {
    // Contract instance
    ArtProject01 public artProject;

    // Test addresses
    address public owner = address(0x1);
    address public admin = address(0x2);
    address public externalWallet = address(0x3);
    address public randomUser = address(0x4);
    address public testUser = address(0x5);

    // Deployment timestamp
    uint256 public deploymentTime;

    /// @notice Sets up the test environment with a deployed contract instance
    function setUp() public virtual {
        vm.startPrank(owner);
        // Record the block timestamp before deployment
        deploymentTime = block.timestamp;
        artProject = new ArtProject01(
            "ArtProject01",
            "ART",
            owner,
            admin,
            externalWallet
        );

        // Enable test mode to bypass EOA checks in tests
        artProject.setTestMode(true);
        vm.stopPrank();

        // Give test accounts some ETH
        vm.deal(randomUser, 10 ether);
        vm.deal(testUser, 10 ether);
    }

    /// @notice Helper function to give a user a specific number of pixels
    /// @param user The address to give pixels to
    /// @param pixelCount The number of pixels to give
    function _giveUserPixels(address user, uint256 pixelCount) internal {
        vm.startPrank(admin);
        // Calculate appropriate date and nonce values to result in pixelCount
        // For simplicity, we use pixelCount as date and 1 as nonce
        artProject.updateAvailableBlocks(user, pixelCount, 1);
        vm.stopPrank();
    }

    /// @notice Helper function to set up the minting process for a user
    /// @param user The address to set up for minting
    /// @return artData A unique art data hash for testing
    function _setupForMinting(
        address user
    ) internal returns (bytes32[4] memory) {
        // Create unique art data for testing
        bytes32[4] memory artData;
        artData[0] = bytes32(
            uint256(
                0x00000000000000000000000000000000000000000000000000000000FFFF0000
            )
        );

        // Create a commitment hash
        bytes32 commitmentHash = keccak256(abi.encode(artData, user));

        // Submit the commitment
        vm.prank(user);
        artProject.startMinting(commitmentHash);

        // Fast forward past the commitment delay
        vm.warp(block.timestamp + artProject.COMMITMENT_DELAY() + 1);

        return artData;
    }
}
