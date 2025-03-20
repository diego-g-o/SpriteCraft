// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../packages/hardhat/contracts/blocks.sol";

contract ArtProjectTestSetup is Test {
    ArtProject01 public artProject;
    address public owner = address(0x1);
    address public admin = address(0x2);
    address public externalWallet = address(0x3);
    address public randomUser = address(0x4);
    address public testUser = address(0x5);
    uint256 public deploymentTime;

    function setUp() public virtual {
        vm.startPrank(owner);
        deploymentTime = block.timestamp;
        artProject = new ArtProject01(
            "ArtProject01",
            "ART",
            owner,
            admin,
            externalWallet
        );
        artProject.setTestMode(true);
        vm.stopPrank();
    }

    function _setupForMinting(
        address minter
    ) internal returns (bytes32 artData) {
        vm.deal(minter, 1 ether);
        vm.startPrank(minter);

        // Create art data
        artData = bytes32(
            uint256(
                0x00000000000000000000000000000000000000000000000000000000FFFF0000
            )
        );

        // Create a commitment hash (this would typically be keccak256(abi.encode(artData, minter)))
        bytes32 commitmentHash = keccak256(abi.encode(artData, minter));

        // Call startMinting with the commitment hash and no value
        artProject.startMinting(commitmentHash);

        vm.stopPrank();
        return artData;
    }

    function _giveUserPixels(address user, uint256 pixelCount) internal {
        vm.startPrank(admin);
        uint256 date = 1;
        uint256 nonce = pixelCount;
        if (nonce == 0) nonce = 1;
        artProject.updateAvailableBlocks(user, date, nonce * date);
        vm.stopPrank();
    }
}
