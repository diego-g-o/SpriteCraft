

# ART PROJECT01

## 1. Project Overview

**ART PROJECT01** is an NFT initiative that combines retro pixel art aesthetics with blockchain innovation. Participants create unique black-and-white art on a 32×32 grid, where their ability to “paint” black pixels is determined by their historical activity on the Optimism network. This design rewards long-term community members, ensuring each NFT is both one-of-a-kind and intrinsically tied to the user’s on-chain history.

---

## 2. Technical Architecture

### 2.1. System Architecture
- **Frontend:**  
  - **Framework:** Next.js (v14 with App Router)  
  - **Styling:** Tailwind CSS  
  - **Icons:** Heroicons  
  - **Language:** TypeScript  
  - **Interaction:** Vanilla JavaScript for canvas rendering  
- **Blockchain & Wallet Integration:**  
  - **Libraries:** wagmi and viem  
  - **Network:** Optimism  
- **Backend:**  
  - **Runtime:** Node.js  
  - **Data Source:** Etherscan API for wallet history  
  - **Metadata Storage:** IPFS for art rendering  
- **Diagrams & Flowcharts:**  
  - _[Placeholder]_ Include an architecture diagram showing data flow from the user’s browser, through the backend, smart contract, and IPFS integration.  
  - _[Placeholder]_ A detailed flowchart outlining the commit-reveal minting process.

### 2.2. Project Management & Roadmap
- **Milestones & Timelines:**  
  - Define development phases (prototype, alpha, beta, production) and expected release dates.
- **Team & Roles:**  
  - List core team members, their responsibilities, and any advisory roles for accountability and expertise.

---

## 3. Core Functionality

### 3.1. Art Creation & Uniqueness
- **Canvas Interaction:**  
  - A clickable 32×32 grid (scaled responsively to 2x, 4x, or 5x) that toggles cells between white and black.
  - A real-time counter monitors the number of black pixels used and warns if the user exceeds their allocated allowance.
- **Aesthetic Enhancements:**  
  - Use vanilla JavaScript with additional retro gaming effects to emulate an 80’s/90’s pixel art vibe.
- **Uniqueness Enforcement:**  
  - Each art piece, defined by its unique grid state (encoded as a hexadecimal string), must be distinct from all previously minted NFTs.

### 3.2. NFT Minting Process
- **On-Chain Storage:**  
  - NFTs are minted as on-chain data structures following the ERC721 standard.
  - Only externally owned accounts (EOAs) can mint NFTs.
- **Commit-Reveal Scheme:**  
  - **Commit Phase:** Users submit a hash of their art data and a salt to lock in their design.
  - **Reveal Phase:** A subsequent transaction reveals the art data and salt to verify the commitment. Alongside the dynamically adjusted cost of the NFT.


### 3.3. Wallet Data & Pixel Allowance Integration
- **Eligibility Check:**  
  - Only wallets that are at least six months old are eligible to participate.
- **Pixel Allowance Calculation:**  
  - A Node.js backend service fetches wallet transaction history via the Etherscan API.
  - The allowed number of black pixels is calculated based on wallet age and transaction count.
  - A caching or rate-limiting strategy should be implemented to handle API constraints and ensure data consistency.
- **Metadata Management:**  
  - After art creation, a Node.js script updates both on-chain mappings (for pixel allowances) and off-chain metadata (rendered art stored on IPFS).

---

## 4. User Interface Features

### 4.1. Canvas and Information Box
- **Canvas:**  
  - Displays a 32×32 grid with visual toggles for each pixel.
  - A counter shows current pixel usage and warns when limits are exceeded.
- **Information Box:**  
  - Displays wallet details (creation date, transaction count, available pixels).
  - Shows art details, including a dynamic title (e.g., “Artpiece #<HexRepresentation>”), pixel usage, minting cost, and availability.
  - Actionable buttons include "Update my available pixels," "Pre-mint NFT," and "Mint NFT."

### 4.2. Navigation and Feedback
- **Header:**  
  - Contains a logo, navigation links (Explore, Create, About), and a wallet connect button (using Scaffold ETH Connect).
- **Footer:**  
  - Displays license information, a note about donating 10% of proceeds to public goods, and a link to the About page.
- **Loading & Transition States:**  
  - Visual feedback for wallet connections, API calls, and art generation must be clearly defined.
- **Accessibility & Responsiveness:**  
  - The UI should comply with WCAG guidelines, featuring ARIA labels and keyboard navigation.
  - Responsive design ensures functionality on a variety of screen sizes and orientations.

---

Below is the improved smart contract specification. All additions and refinements are made solely within Section 5 without altering any other parts of the document.

---

## 5. Smart Contract Specification

### 5.1. Data Structures and Mappings
- **ALWAYS USE NATSPEC**  
  - Always write code following Natspec for functions, events, and state variables to improve readability and auditability.

- **BASED ON OPEN ZEPPELIN IMPLEMENTATION OF ERC721**  
  - Must be compliant and based on the OpenZeppelin implementation of ERC721. Import all relevant files into the contract.

- **USE OPENZEPPELIN ROLE-BASED ACCESS CONTROL**  
  - Use OpenZeppelin's AccessControl contract. Define roles such as `DEFAULT_ADMIN_ROLE` (owner) and a custom `ADMIN_ROLE`. Initialize these roles in the constructor.

- **ART DATA**  
  - Art data is represented as a `bytes32` value corresponding to the black and white pixels of a 32×32 grid.
  - *Optional:* Consider using a struct (e.g., `struct ArtNFT { bytes32 artData; bool minted; uint256 mintedAt; }`) if additional metadata (like minting timestamp) is needed.

- **User Pixel Allowance:**  
  - `mapping(address => uint256) public availablePixels;`  
  - Stores the number of blocks/black pixels each user is permitted based on their on-chain history.

- **User Pixel Already Spent:**  
  - `mapping(address => uint256) public spentPixels;`  
  - Stores the number of blocks/black pixels each user has already spent in previous mintings.

- **Art NFT Data Structure & Uniqueness:**  
  - Define a struct for storing art metadata (if not using a simple mapping):
    - For example:  
      ```solidity
      struct ArtNFT {
          bytes32 artData;
          bool minted;
          uint256 mintedAt;
      }
      ```
  - Alternatively, maintain uniqueness using a mapping:  
    - `mapping(bytes32 => bool) public mintedArts;`  
    - This ensures that each art piece (determined by its hash) is minted only once.

- **Minting Price Curve Variables:**  
  - Declare state variables to implement the bonding curve:
    - `uint256 public deploymentTime;`
    - `uint256 public constant TOKENS_PER_DAY = 5;`
    - `uint256 public constant BASE_PRICE;`
    - `uint256 public constant PRICE_INCREMENT;`
  - These variables define the ideal mint schedule (e.g., 5 tokens per day over approximately 102 days) and adjust the minting price if tokens are minted faster than expected.

```solidity
function currentPrice() public view returns (uint256 price) {
    uint256 timePassed = block.timestamp - deploymentTime;
    uint256 idealMinted = (timePassed * TOKENS_PER_DAY) / 1 days;
    uint256 currentSupply = totalSupply();
    if (currentSupply <= idealMinted) {
        return BASE_PRICE;
    } else {
        uint256 extra = currentSupply - idealMinted;
        return BASE_PRICE + (extra * PRICE_INCREMENT);
    }
}
```

- **Commit-Reveal Mechanism:**  
  - Implements a two-step minting process to prevent front-running and other exploits.
  - **Commit Phase:**  
    - Users submit a hash of their art data concatenated with a salt.
    - Store the commitment in a mapping:  
      - `mapping(address => bytes32) public artCommitments;`
    - Optionally record the commit timestamp using:  
      - `mapping(address => uint256) public commitTimestamps;`
  - **Reveal Phase:**  
    - Users provide the actual art data and salt in a subsequent transaction.
    - The contract verifies that `keccak256(abi.encodePacked(artData, salt))` matches the stored commitment.
    - Implement an expiry or timeout for commitments to clear stale data if needed.

- **Kill Switch / Pausability:**  
  - Include a boolean variable:  
    - `bool public mintingPaused;`
  - Add functions to toggle the pause state (kill switch) callable only by the owner.
  - Use modifiers (e.g., `whenNotPaused`) to prevent minting and state changes when the contract is paused.

---

### 5.2. Roles, Permissions, and Access Control
- **Roles:**  
  - **Owner / Default Admin:**  
    - Full control (typically the deployer) with `DEFAULT_ADMIN_ROLE`.
  - **Administrator:**  
    - Assigned a custom `ADMIN_ROLE` responsible for updating pixel allowances and for automatic transfers of gathered funds to a cold wallet. (This administrator is implemented as a Node.js backend service that queries Etherscan.)
- **Modifiers:**  
  - Implement modifiers such as `onlyOwner`, `onlyAdmin`, and `whenNotPaused` to restrict function access accordingly.

---

### 5.3. Core Smart Contract Functions
- **updateAvailableBlocks(address user, uint256 newAllowance):**  
  - Restricted to the administrator (`ADMIN_ROLE`).
  - Updates the pixel/block allowance for a user.
  - Emits an event (e.g., `event AvailablePixelsUpdated(address indexed user, uint256 newAllowance);`).

- **mintNFT(bytes32 artHash, uint256 pixelCount, bytes32 commitment):**  
  - **Preconditions:**  
    - The submitted `pixelCount` must not exceed the user's remaining allowance (`availablePixels[msg.sender] - spentPixels[msg.sender]`).
    - The art piece (identified by `artHash`) must be unique (checked via the `mintedArts` mapping).
    - The caller must be an externally owned account (EOA); e.g., using `require(msg.sender == tx.origin)`.
    - The revealed art data (during the reveal phase) must match the previously committed hash in `artCommitments[msg.sender]`.
    - The ETH sent must be equal to or exceed the value returned by the `currentPrice()` function.
  - Upon successful minting:
    - Update `spentPixels` for the user.
    - Mark the art as minted in `mintedArts` and/or update the corresponding `ArtNFT` struct.
    - Emit an event:  
      - `event NFTMinted(address indexed user, uint256 tokenId, bytes32 artHash);`

- **commit(bytes32 hash):**  
  - Allows users to submit the commitment hash (of art data and salt) prior to minting.
  - Stores the commitment in `artCommitments[msg.sender]` (overwriting any previous commitment).
  - Emits an event:  
    - `event ArtCommitted(address indexed user, bytes32 commitment);`

- **revealNFT(bytes32 artData, bytes32 salt):**  
  - Verifies that `keccak256(abi.encodePacked(artData, salt))` equals the stored commitment.
  - On a successful match, proceeds with minting (or ties into the `mintNFT` process) and clears the commitment to prevent replay attacks.
  - Emits an event:  
    - `event ArtRevealed(address indexed user, bytes32 artData);`

- **extract():**  
  - Transfers the collected ETH to a designated cold wallet.
  - Can only be called by the owner or administrator.
  - Emits an event:  
    - `event FundsExtracted(address indexed to, uint256 amount);`

- **fallback() and receive():**  
  - Implement these functions following security best practices.
  - Include safeguards to prevent unintended ETH transfers and to mitigate reentrancy vulnerabilities.

- **isArtUnique(bytes32 artHash):**  
  - Checks whether the given art hash has already been minted by referencing the `mintedArts` mapping.
  - Returns a boolean value.

- **Error Handling:**  
  - Use custom errors (Solidity 0.8+ syntax) to provide clear failure messages and to improve gas efficiency. For example:
    - `error PixelLimitExceeded();`
    - `error DuplicateArt();`
    - `error NotEOA();`
    - `error CommitmentMismatch();`

- **Request for Block Availability Update:**  
  - A helper function that allows users to sign an off-chain transaction requesting an update of their available pixels.
  - The administrator (via the Node.js app) will process and validate these requests, ignoring spam submissions.

---

### 5.4. Security, Audit, and Gas Optimization
- **Security Considerations:**  
  - Conduct formal security audits covering the commit-reveal process, pixel allowance mappings, role-based access controls, and external integrations.
  - Document threat models to identify and mitigate risks such as front-running, reentrancy, overflow/underflow, and stale commitments.
  - Apply the checks-effects-interactions pattern where applicable.

- **Gas Optimization:**  
  - Analyze and benchmark gas usage for minting, update functions, and the commit-reveal mechanism.
  - Optimize storage operations by using immutable variables when possible and by minimizing state changes.

- **Upgradeability:**  
  - Consider employing proxy patterns (e.g., OpenZeppelin Upgradeable Contracts) to allow future upgrades.
  - Define a secure migration strategy with clear role-based controls for managing upgrades.

- **Events:**  
  - Emit events for all critical operations to ensure transparency and auditability:
    - `event ArtCommitted(address indexed user, bytes32 commitment);`
    - `event ArtRevealed(address indexed user, bytes32 artData);`
    - `event NFTMinted(address indexed user, uint256 tokenId, bytes32 artHash);`
    - `event AvailablePixelsUpdated(address indexed user, uint256 newAllowance);`
    - `event FundsExtracted(address indexed to, uint256 amount);`
    - `event MintingPaused(bool paused);`

---

This refined specification introduces additional state variables, mappings, events, and function details that enhance clarity, security, and maintainability. It reflects deep consideration of both functionality and best practices from a Solidity development perspective while preserving the original structure and intent of the document.

### 6.2. Tokenomics and Economic Considerations
- **Minting Costs and Fees:**  
  - Detail the cost model for minting (including gas fees, platform fees, and royalties).
- **Revenue Allocation:**  
  - Specify that 10% of all proceeds will be donated to public goods projects.
- **Incentive Structures:**  
  - Explain any additional rewards or incentives for early adopters and active community members.

---

## 7. Backend & Off-Chain Integrations

### 7.1. Data Fetching and Synchronization
- **Etherscan API Integration:**  
  - Provide details on how wallet data is securely retrieved and cached.
- **IPFS Metadata Handling:**  
  - Describe the process for rendering art metadata and storing it on IPFS.
- **Data Consistency:**  
  - Outline methods to ensure synchronization between off-chain pixel allowances and on-chain state.

### 7.2. Logging and Monitoring
- **Monitoring Strategy:**  
  - Define a logging system for both on-chain events and off-chain processes to quickly detect and resolve issues.
- **Error & Success Feedback:**  
  - Ensure that both the backend and smart contract provide clear status messages and logging for auditability.

---

## 8. Testing and Documentation

### 8.1. Testing Framework
- **Smart Contracts:**  
  - Use Hardhat/Truffle for unit and integration testing.
  - Simulate attack vectors and edge cases (e.g., front-running, invalid pixel counts).
- **Frontend & Backend:**  
  - Implement tests using Jest and React Testing Library.
  - Plan for stress testing and load testing to assess performance.

### 8.2. Documentation
- **Developer Documentation:**  
  - Provide inline code comments and maintain external documentation to help new developers onboard.
- **User Guides:**  
  - Create FAQs and tutorials explaining the minting process, pixel allowance calculations, and the commit-reveal mechanism in simple terms.

---

## 9. Performance, Scalability, and Future Considerations

### 9.1. Performance Optimization
- **Responsive Design:**  
  - Ensure the UI scales well on various devices using SSR, code splitting, and lazy loading.
- **Gas Efficiency:**  
  - Regularly review and optimize smart contract code for lower gas consumption.

### 9.2. Scalability and Future Enhancements
- **Modular Architecture:**  
  - Design the system in a modular way to allow future upgrades (e.g., new art effects, additional blockchain integrations).
- **Community Feedback:**  
  - Incorporate user feedback to continuously improve UI/UX and add features.

---

This draft now presents a comprehensive, professional project specification that covers technical architecture, core functionality, smart contract design, legal and governance aspects, backend integrations, testing, and future scalability. It should serve as a robust blueprint for stakeholders, developers, and auditors to ensure successful project execution.
	
	
	
    

## TECHNOLOGY STACK


*   **Frontend:** ScaffoldEth2 , Next.js (App Router), TypeScript, Tailwind CSS, Heroicons. All pages must be implemented using the nextpage convention, ensuring each route is a dedicated file under app as per Next.js standards.
    
*   **Generative Art:** Vanilla Javascript
    
*   **Blockchain Interaction:** wagmi, viem and rainbowKit
    
*   **State Management:** React Hooks
    
*   **Testing:** Jest, React Testing Library (for client) and appropriate testing frameworks for API routes.
    

## FILE STRUCTURE



## ADDITIONAL REQUIREMENTS
-----------------------

### **Project Setup**

*   All new components should go in /components folder, either at the root or the local page depending on the usage. and be named like ExampleComponent.tsx unless otherwise specified.
    
*   All new pages go in /app.
    
*   Use the **Next.js 14 App Router**.
    
*   Data fetching should be done in a **server component** and passed down as props.
    
*   **Client components** (useState, hooks, etc.) require 'use client' at the top of the file.
    

### **Server-Side API Calls**

*   All interactions with external APIs (e.g., Reddit, OpenAI, IPFS storage) should be performed **server-side**.
    
*   Create dedicated API routes in the /pages/api directory for each external API interaction.
    
*   Client-side components should **fetch data through these API routes**, not directly from external APIs.
    

### **Environment Variables**

*   Store all sensitive information (API keys, credentials) in **environment variables**.
    
*   Use a .env.local file for local development and ensure it's listed in .gitignore.
    
*   For production, set environment variables in the deployment platform (e.g., **Vercel**).
    
*   Access environment variables **only in server-side code or API routes**.
    

### **Error Handling and Logging**

*   Implement **comprehensive error handling** in both client-side components and server-side API routes.
    
*   Log errors **on the server-side** for debugging purposes.
    
*   Display **user-friendly error messages** on the client-side.
    

### **Type Safety**

*   Use **TypeScript interfaces** for all data structures, especially API responses.
    
*   Avoid using the any type; instead, **define proper types** for all variables and function parameters.
    

### **API Client Initialization**

*   Initialize API clients before use.
    
*   Implement **checks** to handle connection failures or invalid API responses.
    

### **Testing and Continuous Integration**

*   **Unit/Integration Tests:** Write tests for UI components, API routes, and blockchain interactions.
    
*   **CI/CD:** Configure a continuous integration pipeline (e.g., GitHub Actions) for automated testing and linting.
    
*   **Documentation:** Maintain a clear README with setup instructions, and update inline comments for clarity.
    

