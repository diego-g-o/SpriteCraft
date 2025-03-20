//Armar tests: unit, fuzz, x y z
//Darle una segunda mirada a los unit test the currentPrice()

//bajar los uints que se puedan
//Mejorar la logica de updateAvailableBlocks() Donde ponemos el umbral de se crea el secret mode?

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ArtProject01 NFT Contract
 * @notice This contract implements a commit-reveal pattern for minting unique pixel art NFTs
 * @dev Inherits from OpenZeppelin ERC721, AccessControl, Pausable, and ReentrancyGuard contracts.
 * Uses a bonding curve pricing mechanism and supports special color mode for qualifying artworks.
 */
contract ArtProject01 is ERC721, AccessControl, Pausable, ReentrancyGuard {
    // =======================
    // Roles
    // =======================

    /// @notice Role identifier for the administrator.
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // =======================
    // Data Structures
    // =======================

    /**
     * @notice Struct representing an Art NFT.
     * @param artData The unique 32x32 grid data stored as an array of bytes32 (4 x bytes32 = 1024 bits).
     * @param mintedAt Timestamp when the NFT was minted.
     * @param useColorMode Boolean indicating if the NFT should use a special color palette.
     */
    struct ArtNFT {
        bytes32[4] artData;
        uint256 mintedAt;
        bool useColorMode;
    }

    // =======================
    // State Variables
    // =======================

    /// @notice Mapping to ensure art uniqueness. True if the art has been minted.
    mapping(bytes32 => bool) public mintedArts;

    /// @notice Mapping from tokenId to ArtNFT struct.
    mapping(uint256 => ArtNFT) public artNFTs;

    /// @notice Mapping from user address to commitment hash.
    mapping(address => bytes32) public commitments;

    /// @notice Mapping from user address to commitment timestamp.
    mapping(address => uint256) public commitmentTimestamps;

    /// @notice Minimum time (in seconds) that must pass between commitment and reveal
    uint64 public immutable COMMITMENT_DELAY;

    /// @notice Timestamp when the contract was deployed.
    uint64 public immutable deploymentTime;

    /// @notice Constant for tokens per day as per minting schedule.
    uint16 public immutable TOKENS_PER_DAY;

    /// @notice Base price for minting.
    uint128 public immutable BASE_PRICE;

    /// @notice Price increment for tokens minted above the ideal schedule.
    uint128 public immutable PRICE_INCREMENT;

    /// @notice Kill switch variable to stop minting permanently.
    bool public mintingStopped;

    /// @notice Counter for minted token IDs.
    uint16 public tokenCounter;

    /// @notice Address of the external wallet for fund withdrawals
    address public immutable EXTERNAL_WALLET;

    /// @notice Maximum number of NFTs that can be minted
    uint256 public immutable MAX_SUPPLY;

    /// @notice Flag to allow bypassing EOA check in tests
    bool public testMode;

    /// @notice Mapping from user address to available pixels.
    mapping(address => uint256) public availablePixels;

    /// @notice Threshold of black pixels required to use color mode
    uint256 public immutable COLOR_MODE_THRESHOLD;

    /// @notice Constant multiplier for nonce in pixel calculation
    uint256 public immutable NONCE_MULTIPLIER;

    /// @notice Maximum expected product for pixel calculation
    uint256 public immutable MAX_PRODUCT;

    // =======================
    // Events
    // =======================

    /**
     * @notice Emitted when a user's available pixels are updated.
     * @param user Address of the user.
     * @param newAllowance New pixel allowance.
     */
    event AvailablePixelsUpdated(address indexed user, uint256 newAllowance);

    /**
     * @notice Emitted when an NFT is minted.
     * @param user Address of the user.
     * @param tokenId The minted token's ID.
     * @param artHash The hash representing the art.
     */
    event NFTMinted(address indexed user, uint256 indexed tokenId, bytes32 indexed artHash);

    /**
     * @notice Emitted when funds are extracted to a external wallet.
     * @param to Address of the recipient.
     * @param amount Amount of ETH transferred.
     */
    event FundsExtracted(address indexed to, uint256 amount);

    /**
     * @notice Emitted when minting is paused or unpaused.
     * @param paused Boolean state indicating if minting is paused.
     */
    event MintingHasStopped(bool paused);

    /**
     * @notice Emitted when the minting window expires.
     * @param user Address of the user.
     * @param commitmentHash The hash of the commitment.
     */
    event CommitmentSubmitted(address indexed user, bytes32 indexed commitmentHash);

    /**
     * @notice Emitted when a user requests an update to their available blocks.
     * @param user Address of the user requesting the update.
     */
    event AvailableBlockUpdateRequested(address indexed user);

    // =======================
    // Errors
    // =======================

    /// @notice Error thrown when the pixel limit is exceeded.
    error PixelLimitExceeded();

    /// @notice Error thrown when duplicate art is detected.
    error DuplicateArt();

    /// @notice Error thrown when the caller is not an externally owned account.
    error NotEOA();

    /// @notice Error thrown when there is a commitment mismatch.
    error CommitmentMismatch();

    /// @notice Error thrown when no valid commitment exists
    error NoValidCommitment();

    /// @notice Error thrown when commitment delay has not passed
    error CommitmentDelayNotMet(uint256 remainingTime);

    /// @notice Error thrown when art has already been minted
    error ArtAlreadyMinted();

    /// @notice Error thrown when user doesn't have enough available pixels
    error NotEnoughAvailablePixels();

    /// @notice Error thrown when insufficient ETH is sent for minting
    error InsufficientETHSent();

    /// @notice Error thrown when excessive ETH is sent for minting
    error ExcessiveETHSent();

    /// @notice Error thrown when ETH transfer fails
    error TransferFailed();

    /// @notice Error thrown when max supply has been reached
    error MaxSupplyReached();

    /// @notice Error thrown when trying to reset state in invalid conditions
    error InvalidResetState();

    /// @notice Error thrown when an invalid address is provided
    error InvalidAddress();

    /// @notice Error thrown when an invalid timestamp is provided, usually in the future
    error InvalidTimestamp();

    /// @notice Error thrown when an invalid commitment hash is provided
    error InvalidCommitmentHash();

    /// @notice Error thrown when an active commitment already exists
    error ActiveCommitmentExists();

    /// @notice Error thrown when minting has been stopped
    error MintingStopped();

    /// @notice Error thrown when direct ETH transfers are not allowed
    error DirectETHTransfersNotAllowed();

    /// @notice Error thrown when fallback transactions are not allowed
    error FallbackTransactionsNotAllowed();

    /// @notice Error thrown when caller is not admin or owner
    error NotAdminOrOwner();

    /// @notice Error thrown when token does not exist
    error TokenDoesNotExist();

    /// @notice Error thrown when no fee is required
    error NoFeeRequired();

    /// @notice Error thrown when division by zero occurs
    error DivisionByZero();

    // =======================
    // Constructor
    // =======================

    /**
     * ================================================================================
     *            Constructor
     * ================================================================================
     * @notice Initializes the contract with roles and sets the deployment time.
     * @param name_ The name of the NFT collection.
     * @param symbol_ The symbol of the NFT collection.
     * @param contractOwner Address that will receive the DEFAULT_ADMIN_ROLE
     * @param contractAdmin Address that will receive the ADMIN_ROLE
     * @param externalWallet Address where funds will be sent when withdrawn
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address contractOwner,
        address contractAdmin,
        address externalWallet
    ) ERC721(name_, symbol_) {
        _grantRole(DEFAULT_ADMIN_ROLE, contractOwner);
        bytes32 adminRole = keccak256("ADMIN_ROLE");
        _grantRole(adminRole, contractAdmin);
        deploymentTime = uint64(block.timestamp);
        mintingStopped = false;
        COMMITMENT_DELAY = 15 seconds; // Set appropriate delay for commit-reveal
        TOKENS_PER_DAY = 24;
        BASE_PRICE = 0.005 ether;
        PRICE_INCREMENT = 0.01 ether;
        EXTERNAL_WALLET = externalWallet;
        MAX_SUPPLY = 512;
        COLOR_MODE_THRESHOLD = 255;
        NONCE_MULTIPLIER = 5184000; // 1 transaction equals 2 months
        MAX_PRODUCT = (1000 * 2592000) + 157680000; // MAX = 1000 trans. and 5 year old acc.
    }

    //315360000000
    //315360000000
    // =======================
    // Modifiers
    // =======================

    /**
     * ================================================================================
     *            onlyEOA Modifier
     * ================================================================================
     * @notice Modifier to ensure that the caller is an externally owned account (EOA).
     * @dev Can be bypassed in test mode to facilitate testing
     */
    modifier onlyEOA() {
        if (!testMode && msg.sender != tx.origin) revert NotEOA();
        _;
    }

    // =======================
    // Core Functions
    // =======================

    /**
     * ================================================================================
     *            updateAvailableBlocks
     * ================================================================================
     * @notice Updates the available pixel blocks for a user based on nonce and timestamp.
     * @dev Callable only by accounts with ADMIN_ROLE. Maps linearly to range [1, 1024].
     * @param user The address of the user.
     * @param nonce The nonce value for calculation.
     * @param firstTxTime The timestamp of user's first transaction (tracked off-chain by admin).
     */
    function updateAvailableBlocks(address user, uint256 nonce, uint256 firstTxTime) external onlyRole(ADMIN_ROLE) {
        if (user == address(0)) revert InvalidAddress();
        if (firstTxTime == 0) revert InvalidTimestamp(); // Ensure firstTxTime is not zero
        if (firstTxTime > block.timestamp) revert InvalidTimestamp(); // Ensure firstTxTime is not in the future

        // Cap nonce at 1000 to prevent overflow
        if (nonce > 1000) {
            nonce = 1000;
        }

        // Calculate time difference since first transaction
        uint256 timeDiff = block.timestamp - firstTxTime;

        // Calculate the raw product: nonce * NONCE_MULTIPLIER + timeDiff
        uint256 product = (nonce * NONCE_MULTIPLIER) + timeDiff;

        // Prevent division by zero
        if (MAX_PRODUCT == 0) revert DivisionByZero();

        // Map the product linearly from [0, MAX_PRODUCT] to [1, 1024]
        uint256 newAllowance = (product * 1023) / MAX_PRODUCT + 1;

        // Cap at maximum of 1024
        if (newAllowance > 1024) {
            newAllowance = 1024;
        }

        // Update the user's available pixels
        availablePixels[user] = newAllowance;

        emit AvailablePixelsUpdated(user, newAllowance);
    }

    /**
     * ================================================================================
     *            startMinting
     * ================================================================================
     * @notice Starts the minting process by submitting a commitment.
     * @dev The commitment prevents front-running by hiding the actual art data until reveal.
     * No ETH is required at this stage. Implements commit-reveal pattern.
     * Users can replace their commitment if the previous one has expired (COMMITMENT_DELAY + 1 second).
     * @param commitmentHash Hash of the art data combined with the sender's address.
     */
    function startMinting(bytes32 commitmentHash) external payable nonReentrant onlyEOA whenNotPaused {
        if (mintingStopped) revert MintingStopped();
        // No fee required for starting the minting process
        if (msg.value != 0) revert NoFeeRequired();

        // Add validation
        if (commitmentHash == bytes32(0)) revert InvalidCommitmentHash();

        // Check if user already has an active commitment
        if (commitments[msg.sender] != bytes32(0)) {
            // Check if the previous commitment has expired (COMMITMENT_DELAY + 1 second)
            uint256 commitmentTime = commitmentTimestamps[msg.sender];
            uint256 timeElapsed = block.timestamp - commitmentTime;

            if (timeElapsed < COMMITMENT_DELAY + 1) {
                revert ActiveCommitmentExists();
            }
            // If we reach here, the previous commitment has expired and can be replaced
        }

        // Check if max supply has been reached
        if (tokenCounter >= MAX_SUPPLY) {
            revert MaxSupplyReached();
        }

        // Store the commitment and timestamp
        commitments[msg.sender] = commitmentHash;
        commitmentTimestamps[msg.sender] = block.timestamp;

        emit CommitmentSubmitted(msg.sender, commitmentHash);
    }

    /**
     * ================================================================================
     *            mintNFT
     * ================================================================================
     * @notice Mints the NFT after revealing the art data that matches the previous commitment.
     * @dev Verifies that the revealed data matches the commitment and all other requirements are met.
     * ETH payment is required at this stage based on the current price.
     * @param artData The actual art data representing the 32x32 grid as an array of 4 bytes32 values.
     * @param useColorMode Boolean indicating if the NFT should use a special color palette.
     */
    function mintNFT(
        bytes32[4] calldata artData,
        bool useColorMode
    ) external payable nonReentrant onlyEOA whenNotPaused {
        if (mintingStopped) revert MintingStopped();
        // Generate a unique hash for the art data array
        bytes32 artHash = generateArtHash(artData);

        // Verify the art is unique
        if (!isArtUnique(artHash)) {
            revert ArtAlreadyMinted();
        }

        // Check if a valid commitment exists
        uint256 commitmentTime = commitmentTimestamps[msg.sender];
        if (commitmentTime == 0) {
            revert NoValidCommitment();
        }

        // Check if the commitment delay has passed
        uint256 timeElapsed = block.timestamp - commitmentTime;
        if (timeElapsed < COMMITMENT_DELAY) {
            revert CommitmentDelayNotMet(COMMITMENT_DELAY - timeElapsed);
        }

        // Verify the commitment matches the revealed data
        bytes32 revealedHash = keccak256(abi.encode(artData, msg.sender));
        if (revealedHash != commitments[msg.sender]) {
            revert CommitmentMismatch();
        }

        // Check if enough ETH was sent
        uint256 price = currentPrice();
        if (msg.value < price) {
            revert InsufficientETHSent();
        }

        // Check if too much ETH was sent (more than double the price)
        if (msg.value > price * 2) {
            revert ExcessiveETHSent();
        }

        // If color mode is requested, check if user has enough available pixels
        if (useColorMode) {
            uint256 blackPixels = countBlackPixels(artData);
            if (blackPixels < COLOR_MODE_THRESHOLD) {
                revert NotEnoughAvailablePixels();
            }

            // Check if user has enough available pixels
            if (availablePixels[msg.sender] < COLOR_MODE_THRESHOLD) {
                revert NotEnoughAvailablePixels();
            }

            // Deduct the required pixels from user's allowance
            availablePixels[msg.sender] -= COLOR_MODE_THRESHOLD;
        }

        // Store the art data
        mintedArts[artHash] = true;

        // Get tokenId before incrementing
        uint256 tokenId = tokenCounter;
        // Increment the counter
        tokenCounter++;

        // Store the NFT data with color mode flag
        artNFTs[tokenId] = ArtNFT({ artData: artData, mintedAt: block.timestamp, useColorMode: useColorMode });

        // Clear the commitment data
        delete commitments[msg.sender];
        delete commitmentTimestamps[msg.sender];

        // INTERACTIONS: External calls last
        // Mint the NFT
        _safeMint(msg.sender, tokenId);

        emit NFTMinted(msg.sender, tokenId, artHash);
    }

    /**
     * ================================================================================
     *            generateArtHash
     * ================================================================================
     * @notice Generates a unique hash for an array of art data
     * @dev Uses keccak256 to create a deterministic hash of the entire art piece
     * @param artData The 32x32 grid represented as an array of bytes32
     * @return bytes32 A unique hash representing the entire art piece
     */
    function generateArtHash(bytes32[4] memory artData) public pure returns (bytes32) {
        return keccak256(abi.encode(artData));
    }

    /**
     * ================================================================================
     *            isArtUnique
     * ================================================================================
     * @notice Checks if the given art hash is unique.
     * @dev Uses the mintedArts mapping to check if the art has already been minted.
     * @param artHash The hash representing the art.
     * @return bool True if the art has not been minted yet.
     */
    function isArtUnique(bytes32 artHash) public view returns (bool) {
        return !mintedArts[artHash];
    }

    /**
     * ================================================================================
     *            fallback
     * ================================================================================
     * @notice Fallback function to reject all transactions.
     * @dev Reverts all calls with data using a custom error.
     */
    fallback() external payable {
        revert FallbackTransactionsNotAllowed();
    }

    /**
     * ================================================================================
     *            receive
     * ================================================================================
     * @notice Receive function to reject all ETH transfers.
     * @dev Reverts all plain ETH transfers to the contract using a custom error.
     */
    receive() external payable {
        revert DirectETHTransfersNotAllowed();
    }

    /**
     * ================================================================================
     *            requestAvailableBlockUpdate
     * ================================================================================
     * @notice Allows users to request an update of their available pixel blocks.
     * @dev Emits an event that can be picked up by an off-chain service.
     * No state changes occur on-chain from this function.
     */
    function requestAvailableBlockUpdate() external onlyEOA {
        emit AvailableBlockUpdateRequested(msg.sender);
    }

    /**
     * ================================================================================
     *            currentPrice
     * ================================================================================
     * @notice Calculates the current minting price based on a bonding curve.
     * @dev Price increases as the actual supply exceeds the ideal supply rate.
     * Returns maximum value if max supply has been reached to prevent minting.
     * @return price The current price to mint an NFT in wei.
     */
    function currentPrice() public view returns (uint256 price) {
        // If max supply has been reached, return max value to prevent minting
        if (tokenCounter >= MAX_SUPPLY) {
            return type(uint256).max;
        }

        // Calculate hours since deployment
        uint256 hoursSinceDeployment = (block.timestamp - deploymentTime) / 1 hours;

        // Calculate ideal token supply based on tokens per hour rate (TOKENS_PER_DAY / 24)
        uint256 tokensPerHour = TOKENS_PER_DAY / 24;
        uint256 idealSupply = hoursSinceDeployment * tokensPerHour;

        // Get the actual current supply
        uint256 actualSupply = tokenCounter;

        // If we're at or below the ideal supply, return the base price
        if (actualSupply <= idealSupply) {
            return BASE_PRICE;
        }

        // If we're above the ideal supply, calculate the price increase
        // Each token above the ideal supply increases the price by PRICE_INCREMENT
        uint256 excessTokens = actualSupply - idealSupply;
        return BASE_PRICE + (excessTokens * PRICE_INCREMENT);
    }

    /**
     * ================================================================================
     *            totalSupply
     * ================================================================================
     * @notice Returns the total number of tokens minted.
     * @dev Simply returns the current token counter value.
     * @return uint256 The current token count.
     */
    function totalSupply() public view returns (uint256) {
        return tokenCounter;
    }

    // =======================
    // Administrative Functions
    // =======================

    /**
     * ================================================================================
     *            stopMinting
     * ================================================================================
     * @notice Stops minting permanently.
     * @dev Callable only by accounts with DEFAULT_ADMIN_ROLE.
     * Calls the _pause() function and emits MintingHasStopped event.
     * Once stopped, cannot be reversed by design.
     */
    function stopMinting() external onlyRole(DEFAULT_ADMIN_ROLE) onlyEOA {
        _pause();
        emit MintingHasStopped(true);
    }

    /**
     * ================================================================================
     *            supportsInterface
     * ================================================================================
     * @notice Implementation of the supportsInterface function from ERC165.
     * @dev Resolves the inheritance conflict between ERC721 and AccessControl.
     * @param interfaceId The interface identifier to check support for.
     * @return bool True if the interface is supported.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * ================================================================================
     *            countBlackPixels
     * ================================================================================
     * @notice Counts the number of black pixels (1s) in the art data
     * @dev Uses Brian Kernighan's algorithm for efficient counting. Each bit represents a pixel,
     * where 1 = black and 0 = white. The function counts the number of set bits (1s) across all bytes32 values.
     * @param artData The 32x32 grid represented as an array of bytes32
     * @return pixelCount The number of black pixels
     */
    function countBlackPixels(bytes32[4] memory artData) public pure returns (uint256 pixelCount) {
        for (uint256 i = 0; i < 4; i++) {
            // Convert bytes32 to uint256 for bitwise operations
            uint256 data = uint256(artData[i]);

            // Use Brian Kernighan's algorithm to count set bits
            while (data != 0) {
                data = data & (data - 1);
                pixelCount++;
            }
        }

        return pixelCount;
    }

    /**
     * ================================================================================
     *            withdraw
     * ================================================================================
     * @notice Allows admin or owner to withdraw funds to the external wallet
     * @dev Only callable by ADMIN_ROLE or DEFAULT_ADMIN_ROLE.
     * Transfers entire contract balance to the EXTERNAL_WALLET address.
     * Follows checks-effects-interactions pattern for security.
     */
    function withdraw() external onlyEOA nonReentrant {
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender) && !hasRole(ADMIN_ROLE, msg.sender)) {
            revert NotAdminOrOwner();
        }

        uint256 balance = address(this).balance;
        if (balance == 0) return;

        // Transfer funds before updating state (checks-effects-interactions pattern)
        address payable recipient = payable(EXTERNAL_WALLET);
        (bool success, ) = recipient.call{ value: balance }("");
        if (!success) {
            revert TransferFailed();
        }

        emit FundsExtracted(EXTERNAL_WALLET, balance);
    }

    /**
     * ================================================================================
     *            setTestMode
     * ================================================================================
     * @notice Enables test mode to bypass EOA checks
     * @dev Only callable by admin. Used for testing purposes only.
     * @param isTest Boolean flag to enable or disable test mode
     */
    function setTestMode(bool isTest) external onlyRole(DEFAULT_ADMIN_ROLE) {
        testMode = isTest;
    }

    /**
     * ================================================================================
     *            getArtData
     * ================================================================================
     * @notice Gets the full art data for a specific token
     * @dev Reverts if the token does not exist
     * @param tokenId The ID of the token
     * @return artData The art data as an array of bytes32
     * @return useColorMode Boolean indicating if the NFT uses a special color palette
     */
    function getArtData(uint256 tokenId) external view returns (bytes32[4] memory artData, bool useColorMode) {
        if (!_exists(tokenId)) revert TokenDoesNotExist();
        ArtNFT memory nft = artNFTs[tokenId];
        return (nft.artData, nft.useColorMode);
    }

    /**
     * ================================================================================
     *            _exists
     * ================================================================================
     * @notice Checks if a token exists
     * @dev A token exists if its ID is less than the current token counter
     * @param tokenId The ID of the token to check
     * @return bool True if the token exists
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return tokenId < tokenCounter;
    }
}
