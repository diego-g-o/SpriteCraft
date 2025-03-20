
# SPRITE CRAFT

SPRITE CRAFT is an NFT initiative that combines retro pixel art aesthetics with blockchain innovation. In this project, users create unique 32×32 pixel art pieces on a black-and-white canvas. Their allowed “black pixel” count is determined by their historical on-chain activity on the Optimism network—rewarding long-term community members with enhanced creative allowances.

---

## Table of Contents

- [SPRITE CRAFT](#sprite-craft)
  - [Table of Contents](#table-of-contents)
  - [Project Overview](#project-overview)
  - [Technical Architecture](#technical-architecture)
    - [System Architecture](#system-architecture)
  - [Core Functionality](#core-functionality)
    - [Art Creation \& Uniqueness](#art-creation--uniqueness)
    - [NFT Minting Process](#nft-minting-process)
    - [Wallet Data \& Pixel Allowance Integration](#wallet-data--pixel-allowance-integration)
  - [Smart Contract Specification](#smart-contract-specification)
  - [Tokenomics and Economic Considerations](#tokenomics-and-economic-considerations)

---

## Project Overview

SPRITE CRAFT is designed to empower users to mint unique NFTs where each art piece is intrinsically tied to its creator’s on-chain history. Using a commit–reveal minting process, the system prevents front-running while enforcing art uniqueness and controlled pixel allowances. Each NFT is generated through an interactive 32×32 grid, where the number of available black pixels is determined based on the wallet’s age and transaction history on Optimism.

---

## Technical Architecture

### System Architecture

- **Frontend:**  
  - **Framework:** Next.js (v14 with App Router)  
  - **Styling:** Tailwind CSS  
  - **Language:** TypeScript  
  - **Art Generation:** Vanilla JavaScript for canvas rendering

- **Blockchain & Wallet Integration:**  
  - **Libraries:** wagmi, viem, and rainbowKit  
  - **Network:** Optimism

- **Backend:**  
  - **Runtime:** Node.js  
  - **Data Source:** Etherscan API (for wallet history)  
  - **Metadata Storage:** IPFS for art rendering

---

## Core Functionality

### Art Creation & Uniqueness

- **Canvas Interaction:**  
  - Users interact with a 32×32 clickable grid (with responsive scaling options) to toggle pixels between black and white.  
  - A real-time counter tracks pixel usage and alerts users when approaching their limit.

- **Aesthetic Enhancements:**  
  - Incorporates retro gaming effects using vanilla JavaScript to evoke an 80’s/90’s vibe.

- **Uniqueness Enforcement:**  
  - Each art piece is encoded as a unique hexadecimal string. The smart contract ensures no two identical art pieces are minted.

### NFT Minting Process

- **On-Chain Storage:**  
  - NFTs follow the ERC721 standard with on-chain storage of art data and metadata.
  
- **Commit–Reveal Scheme:**  
  - **Commit Phase:** Users submit a hash (commitment) of their art data (plus salt) to secure their design.
  - **Reveal Phase:** A subsequent transaction reveals the actual art data; the contract verifies it against the earlier commitment.
  - Minting cost adjusts dynamically based on a bonding curve mechanism.

### Wallet Data & Pixel Allowance Integration

- **Eligibility:**  
  - Only wallets at least six months old are eligible for enhanced pixel allowances.
  
- **Pixel Allowance Calculation:**  
  - A Node.js backend service fetches wallet data via the Etherscan API.
  - Allowed black pixels are calculated based on wallet age and transaction count.
  - Caching and rate-limiting strategies ensure data consistency and reliability.

---

## Smart Contract Specification

The Solidity smart contract implements the following key features:

- **Inheritance & Security:**  
  - Based on OpenZeppelin’s ERC721, AccessControl, Pausable, and ReentrancyGuard contracts.
  
- **Core Data Structures:**  
  - `ArtNFT` struct: Contains art data (an array of 4 `bytes32`), minting timestamp, and a flag for special color mode.
  - Mappings to enforce art uniqueness, track pixel allowances, and manage user commitments.

- **Commit–Reveal Minting:**  
  - Users first submit a commitment hash (commit phase) and then reveal their art data (reveal phase).  
  - The contract validates the reveal against the commitment, ensuring authenticity and preventing front-running.

- **Bonding Curve Pricing:**  
  - The price for minting is calculated using a bonding curve that increases the minting cost if tokens are minted faster than the ideal schedule.
  - Example pricing function:
    ```solidity
    function currentPrice() public view returns (uint256 price) {
        uint256 hoursSinceDeployment = (block.timestamp - deploymentTime) / 1 hours;
        uint256 tokensPerHour = TOKENS_PER_DAY / 24;
        uint256 idealSupply = hoursSinceDeployment * tokensPerHour;
        uint256 actualSupply = tokenCounter;
        if (actualSupply <= idealSupply) {
            return BASE_PRICE;
        }
        uint256 excessTokens = actualSupply - idealSupply;
        return BASE_PRICE + (excessTokens * PRICE_INCREMENT);
    }
    ```

- **Additional Functionalities:**  
  - **Pixel Allowance Updates:** Function `updateAvailableBlocks` updates users’ available pixels based on a nonce and timestamp.
  - **Minting Control:** Includes a kill switch (pausing minting permanently) and robust error handling via custom errors.
  - **Fund Withdrawal:** Allows administrators to extract funds safely to an external wallet following the checks-effects-interactions pattern.

---

## Tokenomics and Economic Considerations

- **Minting Costs and Fees:**  
  - A dynamic pricing model is implemented via a bonding curve.  
  - Minting fees adjust based on token supply relative to the ideal schedule.

- **Revenue Allocation:**  
  - 10% of all proceeds will be donated to public goods projects.



