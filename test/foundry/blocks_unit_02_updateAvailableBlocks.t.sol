// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "./blocks_unit_00_setup.t.sol";

/// @title ArtProject01 UpdateAvailableBlocks Functionality Tests
/// @author Claude & Diego
/// @notice Unit testing for the updateAvailableBlocks function of the ArtProject01 contract
/// @dev Contains comprehensive unit tests for all updateAvailableBlocks edge cases and requirements
contract ArtProject01Test is ArtProjectTestSetup {
    // Event to test
    event AvailablePixelsUpdated(address indexed user, uint256 newAllowance);

    // Modifier for admin operations
    modifier asAdmin() {
        vm.startPrank(admin);
        _;
        vm.stopPrank();
    }

    // Modifier for owner operations
    modifier asOwner() {
        vm.startPrank(owner);
        _;
        vm.stopPrank();
    }

    // Modifier for random user operations
    modifier asRandomUser() {
        vm.startPrank(randomUser);
        _;
        vm.stopPrank();
    }
    //To prevent underflow and generate a more realistic condition. flash forward one year
    modifier forwardOneYear() {
        vm.warp(31104000);
        _;
    }

    // Helper function to set up test parameters for updateAvailableBlocks
    function _setupUpdateAvailableBlocksTest(
        uint256 nonce,
        uint256 firstTxTime
    ) internal view returns (uint256 expectedAllowance) {
        // Cap nonce at 1000 to match contract logic
        if (nonce > 1000) {
            nonce = 1000;
        }

        // Calculate expected allowance based on contract logic
        uint256 timeDiff = block.timestamp - firstTxTime;
        uint256 product = (nonce * artProject.NONCE_MULTIPLIER()) + timeDiff;
        expectedAllowance = (product * 1023) / artProject.MAX_PRODUCT() + 1;

        // Cap at 1024 if needed
        if (expectedAllowance > 1024) {
            expectedAllowance = 1024;
        }

        return expectedAllowance;
    }

    /**
     * ================================================================================
     *             test_unit_02_01_UpdateAvailableBlocks_Admin
     * ================================================================================
     * @notice Tests that updateAvailableBlocks can be called by an admin
     * @dev Verifies that an admin can successfully update a user's available pixels
     */
    function test_unit_02_01_UpdateAvailableBlocks_Admin()
        public
        forwardOneYear
        asAdmin
    {
        // Setup
        uint256 nonce = 5;
        uint256 firstTxTime = block.timestamp - 1 days;
        uint256 expectedAllowance = _setupUpdateAvailableBlocksTest(
            nonce,
            firstTxTime
        );

        // Expect the event with correct parameters
        vm.expectEmit(true, true, true, true);
        emit AvailablePixelsUpdated(testUser, expectedAllowance);

        // Action
        artProject.updateAvailableBlocks(testUser, nonce, firstTxTime);

        // Assertion
        assertEq(
            artProject.availablePixels(testUser),
            expectedAllowance,
            "Available pixels should match expected allowance"
        );
    }

    /**
     * ================================================================================
     *             test_unit_02_02_UpdateAvailableBlocks_RevertWhen_CalledByOwner
     * ================================================================================
     * @notice Tests that updateAvailableBlocks reverts when called by the owner
     * @dev Verifies that only accounts with ADMIN_ROLE can call this function
     */
    function test_unit_02_02_UpdateAvailableBlocks_RevertWhen_CalledByOwner()
        public
        forwardOneYear
        asOwner
    {
        // Setup
        uint256 nonce = 5;
        uint256 firstTxTime = block.timestamp - 1 days;

        // Expect revert with AccessControl error
        bytes memory expectedError = abi.encodeWithSignature(
            "AccessControlUnauthorizedAccount(address,bytes32)",
            owner,
            artProject.ADMIN_ROLE()
        );
        vm.expectRevert(expectedError);

        // Action
        artProject.updateAvailableBlocks(testUser, nonce, firstTxTime);
    }

    /**
     * ================================================================================
     *             test_unit_02_03_UpdateAvailableBlocks_RevertWhen_CalledByRandomUser
     * ================================================================================
     * @notice Tests that updateAvailableBlocks reverts when called by a random user
     * @dev Verifies that accounts without ADMIN_ROLE cannot call this function
     */
    function test_unit_02_03_UpdateAvailableBlocks_RevertWhen_CalledByRandomUser()
        public
        forwardOneYear
        asRandomUser
    {
        // Setup
        uint256 nonce = 5;
        uint256 firstTxTime = block.timestamp - 1 days;

        // Expect revert with AccessControl error
        bytes memory expectedError = abi.encodeWithSignature(
            "AccessControlUnauthorizedAccount(address,bytes32)",
            randomUser,
            artProject.ADMIN_ROLE()
        );
        vm.expectRevert(expectedError);

        // Action
        artProject.updateAvailableBlocks(testUser, nonce, firstTxTime);
    }

    /**
     * ================================================================================
     *             test_unit_02_04_UpdateAvailableBlocks_CorrectAllowance
     * ================================================================================
     * @notice Tests that updateAvailableBlocks calculates the correct allowance
     * @dev Verifies the calculation logic by testing multiple combinations of nonce and firstTxTime
     */
    function test_unit_02_04_UpdateAvailableBlocks_CorrectAllowance()
        public
        forwardOneYear
        asAdmin
    {
        // Test multiple combinations to ensure calculation is correct
        uint256[3] memory nonces = [uint256(5), 10, 15];
        uint256[3] memory timestamps = [
            block.timestamp - 1 days,
            block.timestamp - 7 days,
            block.timestamp - 30 days
        ];

        for (uint i = 0; i < nonces.length; i++) {
            // Calculate expected allowance based on contract logic
            uint256 timeDiff = block.timestamp - timestamps[i];
            uint256 product = (nonces[i] * artProject.NONCE_MULTIPLIER()) +
                timeDiff;
            uint256 expectedAllowance = (product * 1023) /
                artProject.MAX_PRODUCT() +
                1;

            // Cap at 1024 if needed
            if (expectedAllowance > 1024) {
                expectedAllowance = 1024;
            }

            // Expect the event with correct parameters
            vm.expectEmit(true, true, true, true);
            emit AvailablePixelsUpdated(testUser, expectedAllowance);

            // Action
            artProject.updateAvailableBlocks(
                testUser,
                nonces[i],
                timestamps[i]
            );

            // Assertion
            assertEq(
                artProject.availablePixels(testUser),
                expectedAllowance,
                "Available pixels should match expected allowance"
            );
        }
    }

    /**
     * ================================================================================
     *             test_unit_02_05_UpdateAvailableBlocks_UpdatesMapping
     * ================================================================================
     * @notice Tests that updateAvailableBlocks correctly updates the mapping
     * @dev Verifies that the availablePixels mapping is updated with new values
     */
    function test_unit_02_05_UpdateAvailableBlocks_UpdatesMapping()
        public
        forwardOneYear
        asAdmin
    {
        // Initial state check
        assertEq(
            artProject.availablePixels(testUser),
            0,
            "Initial available pixels should be 0"
        );

        // First update
        uint256 nonce = 5;
        uint256 firstTxTime = block.timestamp - 100 days;

        // Calculate expected allowance
        uint256 timeDiff = block.timestamp - firstTxTime;
        uint256 product = (nonce * artProject.NONCE_MULTIPLIER()) + timeDiff;
        uint256 expectedAllowance = (product * 1023) /
            artProject.MAX_PRODUCT() +
            1;
        if (expectedAllowance > 1024) expectedAllowance = 1024;

        // Expect the event with correct parameters
        vm.expectEmit(true, true, true, true);
        emit AvailablePixelsUpdated(testUser, expectedAllowance);

        artProject.updateAvailableBlocks(testUser, nonce, firstTxTime);
        assertEq(
            artProject.availablePixels(testUser),
            expectedAllowance,
            "Available pixels should be updated after first call"
        );

        // Second update with different values
        uint256 newNonce = 10;
        uint256 newFirstTxTime = block.timestamp - 200 days;

        // Calculate new expected allowance
        uint256 newTimeDiff = block.timestamp - newFirstTxTime;
        uint256 newProduct = (newNonce * artProject.NONCE_MULTIPLIER()) +
            newTimeDiff;
        uint256 newExpectedAllowance = (newProduct * 1023) /
            artProject.MAX_PRODUCT() +
            1;
        if (newExpectedAllowance > 1024) newExpectedAllowance = 1024;

        // Expect the event with correct parameters
        vm.expectEmit(true, true, true, true);
        emit AvailablePixelsUpdated(testUser, newExpectedAllowance);

        artProject.updateAvailableBlocks(testUser, newNonce, newFirstTxTime);
        assertEq(
            artProject.availablePixels(testUser),
            newExpectedAllowance,
            "Available pixels should be updated after second call"
        );
    }

    /**
     * ================================================================================
     *             test_unit_02_06_UpdateAvailableBlocks_EmitsEvent
     * ================================================================================
     * @notice Tests that updateAvailableBlocks emits the correct event
     * @dev Verifies that the AvailablePixelsUpdated event is emitted with correct parameters
     */
    function test_unit_02_06_UpdateAvailableBlocks_EmitsEvent()
        public
        forwardOneYear
        asAdmin
    {
        // Setup
        uint256 nonce = 5;
        uint256 firstTxTime = block.timestamp - 1 days;
        uint256 expectedAllowance = _setupUpdateAvailableBlocksTest(
            nonce,
            firstTxTime
        );

        // Expect the event with correct parameters
        vm.expectEmit(true, true, true, true);
        emit AvailablePixelsUpdated(testUser, expectedAllowance);

        // Action
        artProject.updateAvailableBlocks(testUser, nonce, firstTxTime);
    }

    /**
     * ================================================================================
     *             test_unit_02_07_UpdateAvailableBlocks_RevertWhen_ZeroAddress
     * ================================================================================
     * @notice Tests that updateAvailableBlocks reverts when called with a zero address
     * @dev Verifies that the function validates the user address
     */
    function test_unit_02_07_UpdateAvailableBlocks_RevertWhen_ZeroAddress()
        public
        forwardOneYear
        asAdmin
    {
        // Setup
        uint256 nonce = 5;
        uint256 firstTxTime = block.timestamp - 100 days;

        // Expect revert with custom error
        vm.expectRevert(abi.encodeWithSignature("InvalidAddress()"));

        // Action
        artProject.updateAvailableBlocks(address(0), nonce, firstTxTime);
    }

    /**
     * ================================================================================
     *             test_unit_02_08_UpdateAvailableBlocks_RevertWhen_ZeroFirstTxTime
     * ================================================================================
     * @notice Tests that updateAvailableBlocks reverts when firstTxTime is zero
     * @dev Verifies that the function validates the firstTxTime parameter
     */
    function test_unit_02_08_UpdateAvailableBlocks_RevertWhen_ZeroFirstTxTime()
        public
        forwardOneYear
        asAdmin
    {
        // Setup
        uint256 nonce = 5;
        uint256 firstTxTime = 0; // Invalid value

        // Expect revert with custom error
        vm.expectRevert(abi.encodeWithSignature("InvalidTimestamp()"));

        // Action
        artProject.updateAvailableBlocks(testUser, nonce, firstTxTime);
    }

    /**
     * ================================================================================
     *             test_unit_02_09_UpdateAvailableBlocks_RevertWhen_FutureFirstTxTime
     * ================================================================================
     * @notice Tests that updateAvailableBlocks reverts when firstTxTime is in the future
     * @dev Verifies that the function validates the firstTxTime parameter
     */
    function test_unit_02_09_UpdateAvailableBlocks_RevertWhen_FutureFirstTxTime()
        public
        forwardOneYear
        asAdmin
    {
        // Setup
        uint256 nonce = 5;
        uint256 firstTxTime = block.timestamp + 400 days; // Future timestamp

        // Expect revert with custom error
        vm.expectRevert(abi.encodeWithSignature("InvalidTimestamp()"));

        // Action
        artProject.updateAvailableBlocks(testUser, nonce, firstTxTime);
    }

    /**
     * ================================================================================
     *             test_unit_02_10_UpdateAvailableBlocks_WithLargeNonce
     * ================================================================================
     * @notice Tests updateAvailableBlocks with a nonce value above 1000
     * @dev Verifies that the function caps nonce at 1000 to prevent overflow
     */
    function test_unit_02_10_UpdateAvailableBlocks_WithLargeNonce()
        public
        forwardOneYear
        asAdmin
    {
        // Setup
        uint256 nonce = 1500; // Above the 1000 cap
        uint256 firstTxTime = block.timestamp - 1 days;

        // Calculate expected allowance with capped nonce (1000)
        uint256 cappedNonce = 1000;
        uint256 expectedAllowance = _setupUpdateAvailableBlocksTest(
            cappedNonce,
            firstTxTime
        );

        // Expect the event with correct parameters
        vm.expectEmit(true, true, true, true);
        emit AvailablePixelsUpdated(testUser, expectedAllowance);

        // Action
        artProject.updateAvailableBlocks(testUser, nonce, firstTxTime);

        // Assertion
        assertEq(
            artProject.availablePixels(testUser),
            expectedAllowance,
            "Available pixels should be calculated with capped nonce"
        );
    }

    /**
     * ================================================================================
     *             test_unit_02_11_UpdateAvailableBlocks_WithLargeValues
     * ================================================================================
     * @notice Tests updateAvailableBlocks with values that would cause overflow
     * @dev Verifies that the function handles potential overflow by capping at 1024
     */
    function test_unit_02_11_UpdateAvailableBlocks_WithLargeValues()
        public
        asAdmin
    {
        // Setup - use values that would result in a very large product
        // We need product >= MAX_PRODUCT to get allowance = 1024

        // Get the MAX_PRODUCT value from the contract
        uint256 maxProduct = artProject.MAX_PRODUCT();

        // Use a nonce of 1000 (the maximum allowed)
        uint256 nonce = 1000;

        // Calculate the minimum firstTxTime needed to make product >= MAX_PRODUCT
        // We need: (nonce * NONCE_MULTIPLIER) + timeDiff >= MAX_PRODUCT
        // So: timeDiff >= MAX_PRODUCT - (nonce * NONCE_MULTIPLIER)
        uint256 nonceContribution = nonce * artProject.NONCE_MULTIPLIER();

        // Set block.timestamp to a very large value first to ensure we have room for a large timeDiff
        vm.warp(block.timestamp + 3153600000); // 100 years in seconds (100 * 365 * 24 * 60 * 60)

        // Calculate required timeDiff
        uint256 requiredTimeDiff;
        uint256 firstTxTime;

        if (nonceContribution >= maxProduct) {
            // If nonceContribution is already >= MAX_PRODUCT, we just need a valid timestamp
            requiredTimeDiff = 1;
        } else {
            // We need a timeDiff large enough to make product >= MAX_PRODUCT
            requiredTimeDiff = maxProduct - nonceContribution + 1;
        }

        // Set firstTxTime to ensure we get the required timeDiff
        // Make sure firstTxTime is not zero or in the future
        firstTxTime = block.timestamp - requiredTimeDiff;

        // Expected allowance should be 1024 (the maximum)
        uint256 expectedAllowance = 1024;

        // Expect the event with correct parameters
        vm.expectEmit(true, true, true, true);
        emit AvailablePixelsUpdated(testUser, expectedAllowance);

        // Action
        artProject.updateAvailableBlocks(testUser, nonce, firstTxTime);

        // Assertion
        assertEq(
            artProject.availablePixels(testUser),
            expectedAllowance,
            "Available pixels should be capped at 1024 for large values"
        );
    }

    /**
     * ================================================================================
     *             test_unit_02_12_UpdateAvailableBlocks_WithMinimumValues
     * ================================================================================
     * @notice Tests updateAvailableBlocks with minimum valid values
     * @dev Verifies that the function correctly handles minimum values
     */
    function test_unit_02_12_UpdateAvailableBlocks_WithMinimumValues()
        public
        forwardOneYear
        asAdmin
    {
        // Setup - use minimum valid values
        uint256 nonce = 1;
        uint256 firstTxTime = block.timestamp - 1; // Just 1 second ago
        uint256 expectedAllowance = _setupUpdateAvailableBlocksTest(
            nonce,
            firstTxTime
        );

        // Expect the event with correct parameters
        vm.expectEmit(true, true, true, true);
        emit AvailablePixelsUpdated(testUser, expectedAllowance);

        // Action
        artProject.updateAvailableBlocks(testUser, nonce, firstTxTime);

        // Assertion
        assertEq(
            artProject.availablePixels(testUser),
            expectedAllowance,
            "Available pixels should be correctly calculated for minimum values"
        );
    }

    /**
     * ================================================================================
     *             test_unit_02_13_UpdateAvailableBlocks_WithRealisticValues
     * ================================================================================
     * @notice Tests updateAvailableBlocks with realistic values
     * @dev Verifies that the function correctly calculates allowance for typical usage
     */
    function test_unit_02_13_UpdateAvailableBlocks_WithRealisticValues()
        public
        forwardOneYear
        asAdmin
    {
        // Setup - use realistic values
        uint256 nonce = 50; // Moderate nonce
        uint256 firstTxTime = block.timestamp - 30 days; // 30 days ago
        uint256 expectedAllowance = _setupUpdateAvailableBlocksTest(
            nonce,
            firstTxTime
        );

        // Expect the event with correct parameters
        vm.expectEmit(true, true, true, true);
        emit AvailablePixelsUpdated(testUser, expectedAllowance);

        // Action
        artProject.updateAvailableBlocks(testUser, nonce, firstTxTime);

        // Assertion
        assertEq(
            artProject.availablePixels(testUser),
            expectedAllowance,
            "Available pixels should be correctly calculated for realistic values"
        );
    }
}
