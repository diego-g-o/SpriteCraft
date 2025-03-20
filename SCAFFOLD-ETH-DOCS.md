🏗 Welcome to Scaffold-ETH 2

Scaffold-ETH is everything you need to get started building decentralized applications on Ethereum! 🚀

⚙️ Built using NextJS, RainbowKit, Hardhat, Foundry, Wagmi, and TypeScript.
About Scaffold-ETH 2

Scaffold-ETH is an open-source, up-to-date toolkit for building decentralized applications (dapps) on the Ethereum blockchain. It's designed to make it easier for developers to create and deploy smart contracts and build user interfaces that interact with those contracts.

    ✅ Contract Hot Reload: Your frontend auto-adapts to your smart contract as you edit it.
    🔥 Burner Wallet & Local Faucet: Quickly test your application with a burner wallet and local faucet.
    🔐 Integration with Wallet Providers: Connect to different wallet providers and interact with the Ethereum network.

Scaffold-ETH 2 Tech Stack

Scaffold-ETH is not a product itself but more of a combination or stack of other great tools. It allows you to quickly build and iterate over your smart contracts and frontends.

Here are the main components:

    Hardhat or Foundry (user's choice) for running local networks, deploying and testing smart contracts.
    Wagmi for React Hooks to start working with Ethereum.
    Viem as low-level interface that provides primitives to interact with Ethereum. The alternative to ethers.js and web3.js.
    NextJS for building a frontend, using many useful pre-made hooks.
    RainbowKit for adding wallet connection.
    DaisyUI for pre-built Tailwind CSS components.


Installation
Requirements

Before you begin, you need to install the following tools:

    Node (>= v20.18.3)
    Yarn (v1 or v2+)
    Git

Setup

For a simplified setup, Scaffold-ETH 2 offers a npx tool that guides you interactively through the setup:

npx create-eth@latest

You will be presented with a series of prompts:

    Project Name: Enter a name for your project, e.g., my-dapp-example.
    Solidity Framework Choose your preferred solidity framework (Hardhat, Foundry)

Once the setup is complete, navigate to the project directory:

cd project-name

Hint

If you choose Foundry as solidity framework in the CLI, you'll also need Foundryup installed on your machine. Checkout: getfoundry.sh

If you want to use extensions, you can add the -e flag followed by the extension name:

npx create-eth@latest -e extension-name

For more information about available extensions and how to use them, check out the Extensions section

Environment

Now that our installation is complete, let's configure the development environment for Scaffold ETH-2.
1. Initialize a Local Blockchain:

In the first terminal, run a local network:

yarn chain

This command starts a local Ethereum network using Hardhat or Foundry, depending on which one you selected in the CLI. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in:

    Hardhat
    Foundry

packages/hardhat/hardhat.config.ts

2. Deploy Your Smart Contract:

In the second terminal, deploy the test contract:

yarn deploy

This command deploys a test smart contract to the local network. The contract can be modified to suit your needs and can be found in:

    Hardhat
    Foundry

packages/hardhat/contracts

The yarn deploy command uses a deploy script to deploy the contract to the network. You can customize the deployment script located in:

    Hardhat
    Foundry

packages/hardhat/deploy

3. Launch your NextJS Application:

In the third terminal, start your NextJS app:

yarn start

Visit your app on http://localhost:3000. You can interact with your smart contract using the contract component or the example ui in the frontend.
What's Next:

    Hardhat
    Foundry

    Edit your smart contract:
        YourContract.sol in packages/hardhat/contracts
    Edit your deployment scripts:
        packages/hardhat/deploy
    Edit your frontend homepage at packages/nextjs/app/page.tsx. For guidance on routing and configuring pages/layouts checkout the Next.js documentation.
    Edit the app config in packages/nextjs/scaffold.config.ts
    Edit your smart contract test in:
        packages/hardhat/test to run test use yarn hardhat:test

⚙ Components

Scaffold-ETH 2 provides a set of pre-built components for common web3 use cases. You can make use of them to accelerate and simplify your dapp development.
📄️ Address

Display an address (or ENS) along with a utility icon to copy the address. If the address is associated with an ENS that has an avatar, this avatar will be displayed. If not, a blockie image representation of the address will be shown.
📄️ Balance

Displays the balance of a given address in both ether (ETH) and US dollars (USD).
📄️ AddressInput

Display an Ethereum address input that validates the address format, resolves ENS domains, and shows their avatars.
📄️ EtherInput

Displays an input field for ETH/USD amount, with an option to convert between ETH and USD.
📄️ InputBase

Simple building block for creating an input which comes with basic default styles (colors, rounded borders).
📄️ IntegerInput

Provides an input field for integer values, validating that user input is a valid integer, and showing error if not.
📄️ RainbowKitCustomConnectButton

Scaffold-ETH 2 uses a custom "Connect Button", based on RainbowKit, that is enhanced with several useful features:
📄️ BlockieAvatar

Show a blockie (bar code profile icon) component for a given public address.


Address

Display an address (or ENS) along with a utility icon to copy the address. If the address is associated with an ENS that has an avatar, this avatar will be displayed. If not, a blockie image representation of the address will be shown.

By default, the component will show the ENS name (if available) and the address.

Ens And Address Example

You can also choose to display only the ENS name (if available) or the address, by setting the onlyEnsOrAddress prop to true.

Only Ens Or Address Example

Clicking on the address redirects to the connected wallet's network block explorer. If the wallet is not connected, it redirects to the block explorer of targetNetworks[0]. You can disable this behaviour with the disableAddressLink prop.
Import

import { Address } from "~~/components/scaffold-eth";

Usage

<Address address="0x34aA3F359A9D614239015126635CE7732c18fDF3" />

Props
Prop	Type	Default Value	Description
address	string	undefined	Address in 0x___ format, it will resolve its ENS if it has one associated.
disableAddressLink (optional)	boolean	false	Set it to true to disable the blockexplorer link behaviour when clicking on the address.
format (optional)	string	"short"	By default, only the first five characters of the address are displayed. Set this to "long" to display the entire address.
size (optional)	string	"base"	Size for the displayed Address component. base by default but you can pass in xs, sm, base, lg, xl, 2xl, 3xl.
onlyEnsOrAddress (optional)	boolean	false	When true, displays only the ENS name (if available) or the address, not both.


Balance

Displays the balance of a given address in both ether (ETH) and US dollars (USD).

Balance Example
Import

import { Balance } from "~~/components/scaffold-eth";

Usage

<Balance address="0x34aA3F359A9D614239015126635CE7732c18fDF3" />

Props
Prop	Type	Default Value	Description
address	string	undefined	Address in 0x___ format, it will resolve its ENS if it has one associated.
className (optional)	string	""	Prop to pass additional CSS styling to the component. You can use Tailwind / daisyUI classes like text-3xl for styling.


AddressInput

Display an Ethereum address input that validates the address format, resolves ENS domains, and shows their avatars.

Also shows a blockie image for each address.

AddressInput Example
Import

import { AddressInput } from "~~/components/scaffold-eth";

Usage

const [address, setAddress] = useState("");

<AddressInput onChange={setAddress} value={address} placeholder="Input your address" />

Props
Prop	Type	Default Value	Description
value	string	undefined	An Ethereum address in (0x___ format) or an ENS domain.
onChange	function	undefined	A callback invoked when the data in the address input changes.
placeholder (optional)	string	undefined	The string that will be rendered before address input has been entered.
name (optional)	string	undefined	Helps identify the data being sent if AddressInput is submitted into a form.
disabled (optional)	boolean	false	If true, sets the address input un-clickable and unusable.

Displays an input field for ETH/USD amount, with an option to convert between ETH and USD.

EtherInput Example
Import

import { EtherInput } from "~~/components/scaffold-eth";

Usage

const [ethAmount, setEthAmount] = useState("");

<EtherInput value={ethAmount} onChange={amount => setEthAmount(amount)} />

Props
Prop	Type	Default Value	Description
value	string	undefined	You can enter ether quantity or USD quantity, but value will always be stored in ETH.
onChange	function	undefined	A callback invoked when the amount in the EtherInput changes.
placeholder (optional)	string	undefined	The string that will be rendered when there is no input value.
name (optional)	string	undefined	Helps identify the data being sent if EtherInput is submitted into a form.
disabled (optional)	boolean	false	When set to true, changes input background color and border to have disabled styling.

InputBase

Simple building block for creating an input which comes with basic default styles (colors, rounded borders).

InputBase Example
Import

import { InputBase } from "~~/components/scaffold-eth";

Usage

const [url, setUrl] = useState<string>();

<InputBase name="url" placeholder="url" value={url} onChange={setUrl} />

Props
Prop	Type	Default Value	Description
value	string	undefined	The data that your input will show.
onChange	function	undefined	A callback invoked when the data in the input changes.
placeholder (optional)	string	undefined	The string that will be rendered before input data has been entered.
name (optional)	string	undefined	Helps identify the data being sent if InputBase is submitted into a form.
error (optional)	boolean	false	When set to true, changes input border to have error styling.
disabled (optional)	boolean	false	When set to true, changes input background color and border to have disabled styling.


IntegerInput

Provides an input field for integer values, validating that user input is a valid integer, and showing error if not.
Shows by default a small button to multiply input's value * 10^18 to transform to wei.

IntegerInput Example
Import

import { IntegerInput } from "~~/components/scaffold-eth";

Usage

const [txValue, setTxValue] = useState<string | bigint>("");

<IntegerInput
  value={txValue}
  onChange={updatedTxValue => {
    setTxValue(updatedTxValue);
  }}
  placeholder="value (wei)"
/>

Props
Prop	Type	Default Value	Description
value	string	undefined	The data that your input will show.
onChange	function	undefined	A callback invoked when the amount in the input changes.
placeholder (optional)	string	undefined	The string that will be rendered before input data has been entered.
name (optional)	string	undefined	Helps identify the data being sent if InputBase is submitted into a form.
error (optional)	boolean	false	When set to true, changes input border to have error styling.
disabled (optional)	boolean	false	When set to true, changes input background color and border to have disabled styling.


RainbowKitCustomConnectButton

Scaffold-ETH 2 uses a custom "Connect Button", based on RainbowKit, that is enhanced with several useful features:

    Balance Display: Shows the balance of the native token from the connected address.
    Chain Name and Color: Displays the name of the connected blockchain and uses a distinct color for each chain.
    Custom Modal: Includes copy address feature, view its QR code, access address details in blockexplorer, and disconnect.

You can extend this component to suit your app's needs.

RainbowKitCustomConnectButton Example
Import

import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

Usage

<RainbowKitCustomConnectButton />



BlockieAvatar

Show a blockie (bar code profile icon) component for a given public address.

The autogenerated blockie can be manually replaced by another image that we pass through the ensImage prop.

BlockieAvatar Example

If you want more control over styling the blockie, you can directly use blo (pre-installed in Scaffold-ETH 2) and internally used by BlockieAvatar component to get the image URL.
Import

import { BlockieAvatar } from "~~/components/scaffold-eth";

Usage

<BlockieAvatar address="0x34aA3F359A9D614239015126635CE7732c18fDF3" size={24} />

Props
Prop	Type	Default Value	Description
address	string	undefined	The address for which you want to display its blockie. Ensure it's in the 0x___ format.
size	number	undefined	Width and Height in pixels (square).
ensImage (optional)	string	undefined	An arbitrary image url to render instead of the blockie.

🛠 Interacting with Your Smart Contracts

Scaffold-ETH 2 provides a collection of custom React hooks designed to simplify interactions with your deployed smart contracts. These hooks are wrappers around Wagmi, an easy-to-use interface with typescript autocompletions for reading from, writing to, and monitoring events emitted by your smart contracts.

To ensure autocompletions function correctly, always update the targetNetworks in scaffold.config.ts to include the relevant network/chain whenever you deploy your contract using yarn deploy --network.
info

The custom hooks rely on three main files for their functionality and TypeScript autocompletion:

    packages/nextjs/contracts/deployedContracts.ts
    packages/nextjs/contracts/externalContracts.ts
    scaffold.config.ts

The deployedContracts.ts file is auto-generated/updated whenever you run yarn deploy --network. It organizes contract addresses and abi's based on chainId.
note

When having multiple chains configured in targetNetworks, make sure to have same contractName's on other chains as targetNetworks[0].id.This ensures proper functionality and autocompletion of custom hooks, as the current setup and types assumes that same contract's are present on other chains as targetNetworks[0].

useScaffoldReadContract

Use this hook to read public variables and get data from read-only functions of your smart contract.

const { data: totalCounter } = useScaffoldReadContract({
  contractName: "YourContract",
  functionName: "userGreetingCounter",
  args: ["0xd8da6bf26964af9d7eed9e03e53415d37aa96045"],
});

This example retrieves the data returned by the userGreetingCounter function of the YourContract smart contract.
Configuration
Parameter	Type	Description
contractName	string	Name of the contract to read from.
functionName	string	Name of the function to call.
args (optional)	unknown[]	Array of arguments to pass to the function (if accepts any). Types are inferred from contract's function parameters
watch (optional)	boolean	Watches and refreshes data on new blocks. (default : true)
chainId (optional)	string	Id of the chain the contract lives on. Defaults to targetNetworks[0].id

You can also pass other arguments accepted by useReadContract wagmi hook.
Return Values

    The retrieved data is stored in the data property of the returned object.
    You can refetch the data by calling the refetch function.
    The extended object includes properties inherited from wagmi useReadContract. You can check the useReadContract return values documentation to check the types.

useScaffoldWriteContract

Use this hook to send a transaction to your smart contract to write data or perform an action.

const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract({ contractName: "YourContract" });

The following configuration options can be passed to the hook:
Configuration
Parameter	Type	Description
contractName	string	Name of the contract to write to.
chainId (optional)	string	Id of the chain the contract lives on. Defaults to targetNetworks[0].id
writeContractParams (optional)	object	wagmi's useWriteContract hook parameters object

To send the transaction, you can call the writeContractAsync function returned by the hook (which we instance as writeYourContractAsync). Here's an example usage:

<button
  className="btn btn-primary"
  onClick={async () => {
    try {
      await writeYourContractAsync({
        functionName: "setGreeting",
        args: ["The value to set"],
        value: parseEther("0.1"),
      });
    } catch (e) {
      console.error("Error setting greeting:", e);
    }
  }}
>
  Set Greeting
</button>

This example sends a transaction to the YourContract smart contract to call the setGreeting function with the arguments passed in args. The writeContractAsync function (writeYourContractAsync instance) sends the transaction to the smart contract.

Below is the configuration for writeContractAsync function:
Configuration
Parameter	Type	Description
functionName	string	Name of the function to call.
args (optional)	unknown[]	Array of arguments to pass to the function (if accepts any). Types are inferred from contract's function parameters.
value (optional)	bigint	Amount of ETH to send with the transaction (for payable functions only).
onBlockConfirmation (optional)	function	Callback function to execute when the transaction is confirmed.
blockConfirmations (optional)	number	Number of block confirmations to wait for before considering transaction to be confirmed (default : 1).

You can also pass other arguments accepted by writeContractAsync from wagmi.
Return Values

    writeContractAsync function sends the transaction to the smart contract.
    isMining property indicates whether the transaction is currently being mined.
    The extended object includes properties inherited from wagmi useWriteContract. You can check the useWriteContract return values documentation to check the types.

useScaffoldWatchContractEvent

Use this hook to subscribe to events emitted by your smart contract, and receive real-time updates when these events are emitted.

useScaffoldWatchContractEvent({
  contractName: "YourContract",
  eventName: "GreetingChange",
  // The onLogs function is called whenever a GreetingChange event is emitted by the contract.
  // Parameters emitted by the event can be destructed using the below example
  // for this example: event GreetingChange(address greetingSetter, string newGreeting, bool premium, uint256 value);
  onLogs: logs => {
    logs.map(log => {
      const { greetingSetter, value, premium, newGreeting } = log.args;
      console.log("📡 GreetingChange event", greetingSetter, value, premium, newGreeting);
    });
  },
});

This example subscribes to the GreetingChange event emitted by the YourContract smart contract and logs the parameters from the event to the console when it's emitted.

This hook is a wrapper around wagmi's useWatchContractEvent.
note

Due to shortcomings of some RPC providers, this hook may or may not fire events always checkout this discussion for more details. To update the RPC link checkout this section
Configuration
Parameter	Type	Description
contractName	string	Name of the contract to read from.
eventName	string	Name of the event to read.
onLogs	function	Callback function to execute when the event is emitted. Accepts an array of logs that occurred during the pollingInterval set at scaffold.config.ts. Each array item contains an args property, which can be destructured to get the parameters emitted by the event. This function can customized according to your needs.
chainId (optional)	string	Id of the chain the contract lives on. Defaults to targetNetworks[0].id
note

It is recommended to setState using updater function in the onLogs function to avoid problems due to caching.

useScaffoldEventHistory

Use this hook to retrieve historical event logs for your smart contract, providing past activity data, with the option to watch for new events.

const {
  data: events,
  isLoading: isLoadingEvents,
  error: errorReadingEvents,
} = useScaffoldEventHistory({
  contractName: "YourContract",
  eventName: "GreetingChange",
  fromBlock: 31231n,
  watch: true,
  filters: { greetingSetter: "0x9eB2C4866aAe575bC88d00DE5061d5063a1bb3aF" },
  blockData: true,
  transactionData: true,
  receiptData: true,
});

This example retrieves the historical event logs for the GreetingChange event of the YourContract smart contract, starting from block number 31231 and filtering events where the greetingSetter parameter is 0x9eB2C4866aAe575bC88d00DE5061d5063a1bb3aF.
Configuration
Parameter	Type	Description
contractName	string	Name of the contract to read from.
eventName	string	Name of the event to read.
fromBlock	bigint	Block number from which to start reading events.
filters (optional)	object	Apply filters to the event based on indexed parameter names and values { [parameterName]: value }.
blockData (optional)	boolean	If set to true it will return the block data for each event (default: false).
transactionData (optional)	boolean	If set to true it will return the transaction data for each event (default: false).
receiptData (optional)	boolean	If set to true it will return the receipt data for each event (default: false).
watch (optional)	boolean	If set to true, the events will be refetched every pollingInterval set at scaffold.config.ts. (default: false).
enabled (optional)	boolean	If set to false, the hook will not fetch any data (default: true).
chainId (optional)	string	Id of the chain the contract lives on. Defaults to targetNetworks[0].id
Return Values

    data property of the returned object contains an array of event objects, each containing the event parameters and (optionally) the block, transaction, and receipt data.
    isLoading property indicates whether the event logs are currently being fetched.
    error property contains any error that occurred during the fetching process (if applicable).

useDeployedContractInfo

Use this hook to fetch details about a deployed smart contract, including the ABI and address.

const { data: deployedContractData } = useDeployedContractInfo({ contractName: "YourContract" });

This example retrieves the details of the deployed contract with the specified name and stores the details in the deployedContractData object.
Configuration
Parameter	Type	Description
contractName	string	Name of the contract.
chainId (optional)	string	Id of the chain the contract lives on. Defaults to targetNetworks[0].id
Return Value

    data: Object containing address and abi of contract.

useScaffoldContract

Use this hook to get your contract instance by providing the contract name. It enables you to interact with your contract methods. For reading data or sending transactions, it's recommended to use useScaffoldReadContract and useScaffoldWriteContract.

const { data: yourContract } = useScaffoldContract({
  contractName: "YourContract",
});
// Returns the greeting and can be called in any function, unlike useScaffoldReadContract
await yourContract?.read.greeting();

// Used to write to a contract and can be called in any function
import { useWalletClient } from "wagmi";

const { data: walletClient } = useWalletClient();
const { data: yourContract } = useScaffoldContract({
  contractName: "YourContract",
  chainId: 31337,
  walletClient,
});
const setGreeting = async () => {
  // Call the method in any function
  await yourContract?.write.setGreeting(["the greeting here"]);
};

This example uses the useScaffoldContract hook to obtain a contract instance for the YourContract smart contract.
Configuration
Parameter	Type	Description
contractName	string	Name of the contract.
walletClient (optional)	WalletClient	Wallet client must be passed in order to call write methods of the contract
chainId (optional)	string	Id of the chain the contract lives on. Defaults to targetNetworks[0].id
Return Value

    data : Object representing viem's contract instance. Which can be used to call read and write of the contract.

    isLoading : Boolean indicating if the contract is being loaded.

useTransactor

Use this hook to interact with the chain and give UI feedback on the transaction status.

Transaction success

Any error will instead show a popup with nice error message.

Error Example

const transactor = useTransactor();
const writeTx = transactor({
  to: "0x97843608a00e2bbc75ab0C1911387E002565DEDE", // address of buidlguidl.eth
  value: 1000000000000000000n,
});
await writeTx();

This example tries to send 1 ETH to the address buidlguidl.eth, prompting the connected WalletClient for a signature. And in the case of a successful transaction, it will show a popup in the UI with the message: "🎉 Transaction completed successfully!".

You can pass in anything that is a valid parameter to Viem's sendTransaction function to callback function. It also possible to pass it an promise that resolves in with a transaction hash for example promise from Wagmi's writeContractAsync function.

Refer to this recipe for a more detailed example.
Configuration
useTransactor
Parameter	Type	Description
_walletClient (optional)	WalletClient	The wallet client that should sign the transaction. Defaults to the connected wallet client, and is only needed if the transaction is not already sent using writeContractAsync
callback function
Parameter	Type	Description
tx	sendTransaction-parameters or Promise<Hash>	Either valid parameters for sendTransaction-parameters or a promise that resolves with the transaction hash, e.g. Wagmi's writeContractAsync function.
options (optional)	object	Additional options for the confirmation.
└─options.blockConfirmations (optional)	number	The number of block confirmations to wait for before resolving. Defaults to 1.
└─options.onBlockConfirmation (optional)	function	A callback function that is called once all blockConfirmations is reached.
Return Values
useTransactor

    The callback function that is used to initialize the UI feedback flow.

callback function

    A promise that resolves with the transaction hash once the transaction is mined.

📡 Interacting with External Contracts

If you need to interact with external contracts (i.e. not deployed with your SE-2 instance, e.g DAI contract) you can add external contract data to your packages/nextjs/contracts/externalContracts.ts file, which would let you use Scaffold-ETH 2 custom hooks.

To achieve this, include the contract name, its address, and abi in externalContracts.ts for each chain ID. Ensure to update the targetNetworks in scaffold.config.ts to your preferred chains to enable hooks typescript autocompletion.

This is the structure of externalContracts object:

const externalContracts = {
  1: {
    DAI: {
      address: "0x...",
      abi: [...],
    },
    WETH: {
      address: "0x...",
      abi: [...],
    },
  },
  5: {
    DAI: {
      address: "0x...",
      abi: [...],
    },
    WETH: {
      address: "0x...",
      abi: [...],
    },
  },
} as const;


🧪 Recipes

Explore a collection of practical recipes to implement common web3 use-cases with Scaffold-ETH 2. Learn how to interact with smart contracts, read and display data, manage account balances, and more. Each recipe offers step-by-step guidance, making it easy to implement different blockchain features into your dApps.
📄️ Get balance of the connected account

Learn how to retrieve and display the ETH balance of the connected account in your dApp.
📄️ Write to contract with writeContractAsync button

Learn how to create a button that executes the writeContractAsync function to interact with a smart contract.
📄️ Read a uint from a contract

Learn how to read from contract functions which accepts arguments / no arguments and display them on UI.
📄️ Wagmi useWriteContract with transaction status

Show feedback on transaction status to user by `useWriteContract` along with `useTransactor`
📄️ Add a custom chain

Learn how to add custom chains to your project.

Get the Current Balance of the Connected Account

This recipe shows how to fetch and display the ETH balance of the currently connected account.
Here is the full code, which we will be implementing in the guide below:
components/ConnectedAddressBalance.tsx

import { useAccount } from "wagmi";
import { Address, Balance } from "~~/components/scaffold-eth";

export const ConnectedAddressBalance = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <div className="bg-base-300 p-6 rounded-lg max-w-md mx-auto mt-6">
      <h2 className="text-lg font-bold mb-2">Your Ethereum Balance</h2>

      <div className="text-sm font-semibold mb-2">
        Address: <Address address={connectedAddress} />
      </div>

      <div className="text-sm font-semibold">
        Balance: <Balance address={connectedAddress} />
      </div>
    </div>
  );
};

Implementation guide
Step 1: Create a new Component

Begin by creating a new component in the "components" folder of your application.
components/ConnectedAddressBalance.tsx

export const ConnectedAddressBalance = () => {
  return (
    <div>
      <h2>Your Ethereum Balance</h2>
    </div>
  );
};

Step 2: Retrieve the Connected Account

Fetch the Ethereum address of the currently connected account using the useAccount wagmi hook and easily display them using Scaffold ETH-2 Address and Balance components.
components/ConnectedAddressBalance.tsx

import { useAccount } from "wagmi";
import { Address, Balance } from "~~/components/scaffold-eth";

export const ConnectedAddressBalance = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <div>
      <h2>Your Ethereum Balance</h2>
      Address: <Address address={connectedAddress} />
      Balance: <Balance address={connectedAddress} />
    </div>
  );
};



Write to a Contract with writeContractAsync button

This recipe shows how to implement a button that allows users to interact with a smart contract by executing the writeContractAsync function returned by useScaffoldWriteContract. By following this guide, you can create a user interface for writing data to a contract.
Here is the full code, which we will be implementing in the guide below:
components/Greetings.tsx

import { useState } from "react";
import { parseEther } from "viem";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const Greetings = () => {
  const [newGreeting, setNewGreeting] = useState("");

  const { writeContractAsync, isPending } = useScaffoldWriteContract("YourContract");

  const handleSetGreeting = async () => {
    try {
      await writeContractAsync(
        {
          functionName: "setGreeting",
          args: [newGreeting],
          value: parseEther("0.01"),
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("📦 Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
    } catch (e) {
      console.error("Error setting greeting", e);
    }
  };

  return (
    <>
      <input
        type="text"
        placeholder="Write your greeting"
        className="input border border-primary"
        onChange={e => setNewGreeting(e.target.value)}
      />
      <button className="btn btn-primary" onClick={handleSetGreeting} disabled={isPending}>
        {isPending ? <span className="loading loading-spinner loading-sm"></span> : "Send"}
      </button>
    </>
  );
};

Implementation
Step 1: Set Up Your Component

Create a new component in the "components" folder. This component will enable users to write data to a smart contract.
components/Greetings.tsx

export const Greetings = () => {
  return (
    <>
      <input type="text" placeholder="Write your greeting" className="input border border-primary" />
      <button>Send</button>
    </>
  );
};

Step 2: Initialize useScaffoldWriteContract hook

Initialize the useScaffoldWriteContract hook. This hook provides the writeContractAsync function for sending transactions, we'll create handleSetGreeting function in which we'll call and pass parameters to writeContractAsync required to perform contract interaction.

import { useState } from "react";
import { parseEther } from "viem";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const Greetings = () => {
  const [newGreeting, setNewGreeting] = useState("");

  const { writeContractAsync } = useScaffoldWriteContract("YourContract");

  const handleSetGreeting = async () => {
    try {
      await writeContractAsync(
        {
          functionName: "setGreeting",
          args: [newGreeting],
          value: parseEther("0.01"),
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("📦 Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
    } catch (e) {
      console.error("Error setting greeting", e);
    }
  };

  return (
    <>
      <input type="text" placeholder="Write your greeting" className="input border border-primary" />
      <button>Send</button>
    </>
  );
};

Step 3: Add input change logic and send transaction when users click the button

Wire up the input field to update the newGreeting state when the user types in a new greeting and call handleSetGreeting function when user click on the button.

import { parseEther } from "viem";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const Greetings = () => {
  const [newGreeting, setNewGreeting] = useState("");

  const { writeContractAsync } = useScaffoldWriteContract("YourContract");

  const handleSetGreeting = async () => {
    try {
      await writeContractAsync(
        {
          functionName: "setGreeting",
          args: [newGreeting],
          value: parseEther("0.01"),
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("📦 Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
    } catch (e) {
      console.error("Error setting greeting", e);
    }
  };

  return (
    <>
      <input
        type="text"
        placeholder="Write your greeting"
        className="input border border-primary"
        onChange={e => setNewGreeting(e.target.value)}
      />
      <button
        className="btn btn-primary"
        onClick={handleSetGreeting}
      >
        Send
      </button>
    </>
  );
};

Step 4: Bonus adding loading state

We can use isPending returned from useScaffoldWriteContract while the transaction is being mined and also disable the button.

import { useState } from "react";
import { parseEther } from "viem";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const Greetings = () => {
  const [newGreeting, setNewGreeting] = useState("");
  const { writeContractAsync, isPending } = useScaffoldWriteContract("YourContract");

  const handleSetGreeting = async () => {
    try {
      await writeContractAsync(
        {
          functionName: "setGreeting",
          args: [newGreeting],
          value: parseEther("0.01"),
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("📦 Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
    } catch (e) {
      console.error("Error setting greeting", e);
    }
  };

  return (
    <>
      <input
        type="text"
        placeholder="Write your greeting"
        className="input border border-primary"
        onChange={e => setNewGreeting(e.target.value)}
      />

      <button
        className="btn btn-primary"
        onClick={handleSetGreeting}
        disabled={isPending}
      >
        {isPending ? <span className="loading loading-spinner loading-sm"></span> : "Send"}
      </button>
    </>
  );
};

Read a uint from a contract

This recipe demonstrates how to read data from contract functions and display it on the UI. We'll showcase an example that accepts some arguments (parameters), and another with no arguments at all.
Here is the full code, which we will be implementing in the guide below:
components/GreetingsCount.tsx

import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export const GreetingsCount = () => {
  const { address: connectedAddress } = useAccount();

  const { data: totalCounter, isLoading: isTotalCounterLoading } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "totalCounter",
  });

  const { data: connectedAddressCounter, isLoading: isConnectedAddressCounterLoading } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "userGreetingCounter",
    args: [connectedAddress], // passing args to function
  });

  return (
    <div className="card card-compact w-64 bg-secondary text-primary-content shadow-xl m-4">
      <div className="card-body items-center text-center">
        <h2 className="card-title">Greetings Count</h2>
        <div className="card-actions items-center flex-col gap-1 text-lg">
          <h2 className="font-bold m-0">Total Greetings count:</h2>
          {isTotalCounterLoading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            <p className="m-0">{totalCounter ? totalCounter.toString() : 0}</p>
          )}
          <h2 className="font-bold m-0">Your Greetings count:</h2>
          {isConnectedAddressCounterLoading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            <p className="m-0">{connectedAddressCounter ? connectedAddressCounter.toString() : 0}</p>
          )}
        </div>
      </div>
    </div>
  );
};

Implementation guide
Step 1: Create a new Component

Begin by creating a new component in the "components" folder of your application.
components/GreetingsCount.tsx

export const GreetingsCount = () => {
  return (
    <div>
      <h2 className="font-bold m-0">Total Greetings count:</h2>
      <h2 className="font-bold m-0">Your Greetings count:</h2>
    </div>
  );
};

Step 2: Retrieve total greetings count

Initialize the useScaffoldReadContract hook to read from the contract. This hook provides the data which contains the return value of the function.
components/GreetingsCount.tsx

import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export const GreetingsCount = () => {
  const { data: totalCounter } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "totalCounter",
  });

  return (
    <div>
      <h2 className="font-bold m-0">Total Greetings count:</h2>
      <p>{totalCounter ? totalCounter.toString() : 0}</p>
      <h2 className="font-bold m-0">Your Greetings count:</h2>
    </div>
  );
};

In the line const {data: totalCounter} = useScaffoldReadContract({...}) we are using destructuring assignment to assign data to a new name totalCounter.

In the contract, totalCounter returns an uint value, which is represented as a BigInt in javascript and can be converted to a readable string using .toString().
Step 3: Retrieve connected address greetings count

We can get the connected address using the useAccount hook and pass it to args key in the useScaffoldReadContract hook configuration. This will be used as an argument to read the contract function.
components/GreetingsCount.tsx

import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useAccount } from "wagmi";

export const GreetingsCount = () => {
  const { address: connectedAddress } = useAccount();

  const { data: totalCounter } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "totalCounter",
  });

  const { data: connectedAddressCounter } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "userGreetingCounter",
    args: [connectedAddress], // passing args to function
  });

  return (
    <div>
      <h2>Total Greetings count:</h2>
      <p>{totalCounter ? totalCounter.toString() : 0}</p>
      <h2>Your Greetings count:</h2>
      <p>{connectedAddressCounter ? connectedAddressCounter.toString() : 0}</p>
    </div>
  );
};

Step 4: Bonus adding loading state

We can use isLoading returned from the useScaffoldReadContract hook. This variable is set to true while fetching data from the contract.
components/GreetingsCount.tsx

import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useAccount } from "wagmi";

export const GreetingsCount = () => {
  const { address: connectedAddress } = useAccount();

  const { data: totalCounter, isLoading: isTotalCounterLoading } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "totalCounter",
  });

  const { data: connectedAddressCounter, isLoading: isConnectedAddressCounterLoading } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "userGreetingCounter",
    args: [connectedAddress], // passing args to function
  });

  return (
    <div>
      <h2>Total Greetings count:</h2>
      {isTotalCounterLoading ? (
        <span className="loading loading-spinner"></span>
      ) : (
        <p className="m-0">{totalCounter ? totalCounter.toString() : 0}</p>
      )}
      <h2>Your Greetings count:</h2>
      {isConnectedAddressCounterLoading ? (
        <span className="loading loading-spinner"></span>
      ) : (
        <p className="m-0">{connectedAddressCounter ? connectedAddressCounter.toString() : 0}</p>
      )}
    </div>
  );
};

Wagmi useWriteContract with transaction status

This recipe demonstrates how to create a button for contract interaction using the "useTransactor" and "useWriteContract" hooks from the "wagmi" library. The interaction includes the capability to provide feedback on the transaction status when using wagmi useWriteContract.
Here is the full code, which we will be implementing in the guide below:
components/ContractInteraction.tsx

import * as React from "react";
import { parseEther } from "viem";
import { useWriteContract } from "wagmi";
import DeployedContracts from "~~/contracts/deployedContracts";
import { useTransactor } from "~~/hooks/scaffold-eth";

export const ContractInteraction = () => {
  const { writeContractAsync, isPending } = useWriteContract();

  const writeContractAsyncWithParams = () =>
    writeContractAsync({
      address: DeployedContracts[31337].YourContract.address,
      abi: DeployedContracts[31337].YourContract.abi,
      functionName: "setGreeting",
      value: parseEther("0.01"),
      args: ["Hello world!"],
    });

  const writeTx = useTransactor();

  const handleSetGreeting = async () => {
    try {
      await writeTx(writeContractAsyncWithParams, { blockConfirmations: 1 });
    } catch (e) {
      console.log("Unexpected error in writeTx", e);
    }
  };

  return (
    <button className="btn btn-primary" onClick={handleSetGreeting} disabled={isPending}>
      {isPending ? <span className="loading loading-spinner loading-sm"></span> : "Send"}
    </button>
  );
};

Implementation
Step 1: Set Up Your Component

Create a new component in the "components" folder. The component will show a button that will allow users to interact with your smart contract.
components/ContractInteraction.tsx

import * as React from "react";

export const ContractInteraction = () => {
  return <button>Send</button>;
};

Step 2: Configure wagmi's useWriteContract hook

Add wagmi's useWriteContract hook and configure writeContractAsync with the parameters: abi, address, functionName, value and args. Get the ABI and address of your smart contract from the DeployedContracts or you can grab it from ExternalContracts object, those will be used to set up the contract interaction.

import * as React from "react";
import { parseEther } from "viem";
import { useWriteContract } from "wagmi";
import DeployedContracts from "~~/contracts/deployedContracts";

export const ContractInteraction = () => {
  const { writeContractAsync } = useWriteContract();

  const writeContractAsyncWithParams = () =>
    writeContractAsync({
      address: DeployedContracts[31337].YourContract.address,
      abi: DeployedContracts[31337].YourContract.abi,
      functionName: "setGreeting",
      value: parseEther("0.01"),
      args: ["Hello world!"],
    });
  return <button>Send</button>;
};

Step 3: Initialize useTransactor hook and send transaction

Initialize the useTransactor hook, and use it to wrap writeContractAsyncWithParams function which we got from useWriteContract to show feedback transaction status to user.

import * as React from "react";
import { parseEther } from "viem";
import { useWriteContract } from "wagmi";
import DeployedContracts from "~~/contracts/deployedContracts";
import { useTransactor } from "~~/hooks/scaffold-eth";

export const ContractInteraction = () => {
  const { writeContractAsync } = useWriteContract();

  const writeContractAsyncWithParams = () =>
    writeContractAsync({
      address: DeployedContracts[31337].YourContract.address,
      abi: DeployedContracts[31337].YourContract.abi,
      functionName: "setGreeting",
      value: parseEther("0.01"),
      args: ["Hello world!"],
    });

  const writeTx = useTransactor();

  return <button onClick={() => writeTx(writeContractAsyncWithParams, { blockConfirmations: 1 })}>Send</button>;
};

Step 4: Wrap useTransactor in a handler async function

Wrap the writeTx function in a handler function to start the transaction when the user clicks the button.

import * as React from "react";
import { parseEther } from "viem";
import { useWriteContract } from "wagmi";
import DeployedContracts from "~~/contracts/deployedContracts";
import { useTransactor } from "~~/hooks/scaffold-eth";

export const ContractInteraction = () => {
  const { writeContractAsync, isPending } = useWriteContract();

  const writeContractAsyncWithParams = () =>
  writeContractAsync({
    address: DeployedContracts[31337].YourContract.address,
    abi: DeployedContracts[31337].YourContract.abi,
    functionName: "setGreeting",
    value: parseEther("0.01"),
    args: ["Hello world!"],
  });

  const writeTx = useTransactor();

  const handleSetGreeting = async () => {
    try {
      await writeTx(writeContractAsyncWithParams, { blockConfirmations: 1 });
    } catch (e) {
      console.log("Unexpected error in writeTx", e);
    }
  };


  return (
    <button className="btn btn-primary" onClick={handleSetGreeting}>
      Send
    </button>
  );

Step 5: Bonus adding loading state

We can use isPending returned from useWriteContract while the transaction is being mined and also disable the button.

import * as React from "react";
import { parseEther } from "viem";
import { useWriteContract } from "wagmi";
import DeployedContracts from "~~/contracts/deployedContracts";
import { useTransactor } from "~~/hooks/scaffold-eth";

export const ContractInteraction = () => {
  const { writeContractAsync, isPending } = useWriteContract();

  const writeContractAsyncWithParams = () =>
    writeContractAsync({
      address: DeployedContracts[31337].YourContract.address,
      abi: DeployedContracts[31337].YourContract.abi,
      functionName: "setGreeting",
      value: parseEther("0.01"),
      args: ["Hello world!"],
    });

  const writeTx = useTransactor();

  const handleSetGreeting = async () => {
    try {
      await writeTx(writeContractAsyncWithParams, { blockConfirmations: 1 });
    } catch (e) {
      console.log("Unexpected error in writeTx", e);
    }
  };

  return (
    <button className="btn btn-primary" onClick={handleSetGreeting} disabled={isPending}>
      {isPending ? <span className="loading loading-spinner loading-sm"></span> : "Send"}
    </button>
  );
};

Add a custom chain

This recipe demonstrates how to add a custom chain to your project. We'll use Base as an example, but you can apply this process to any other chain you want to add. Scaffold-ETH 2 uses viem/chains as a list of chains. Normally, Base already exists in viem/chains and you can import it and use it, but we're going to add it manually to show you how to do it.
info

Scaffold-ETH 2 consists of two parts:

    packages/nextjs: nextjs frontend
    packages/hardhat or packages/foundry: hardhat or foundry to deploy smart contracts

The frontend and the hardhat/foundry project use a different set of chains. You should add the chain to both the frontend and your hardhat/foundry config. Checkout deploying your smart contract section on how to deploy different chains.

By doing this, you will be able to deploy the contracts to the chain you added and interact with them from the frontend.
Step 1: Define the chain

First, create a new file called customChains.ts in your packages/nextjs/utils/ directory.

Open the file with your favorite editor and add the following code to define the chain.
packages/nextjs/utils/customChains.ts

import { defineChain } from "viem";

// Base chain
export const base = defineChain({
  id: 8453,
  name: "Base",
  nativeCurrency: { name: "Base", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.base.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Basescan",
      url: "https://basescan.org",
    },
  },
});

In this file, we're defining the Base chain. We're using the defineChain function from viem to define the chain. You can add as many chains as you want to the customChains.ts file.
Step 2: Update scaffold.config.ts

Next, update your scaffold.config.ts file to include the new chain:
packages/nextjs/scaffold.config.ts

import { base } from "./utils/customChains";
// ... other imports and type definitions

const scaffoldConfig = {
  targetNetworks: [base],
  // ... other configuration options
} as const satisfies ScaffoldConfig;

export default scaffoldConfig;

If you'd like to add multiple chains, you can do so by adding them to the targetNetworks array. Below is a simple example of how to add multiple chains.
packages/nextjs/scaffold.config.ts

import { base, baseSepolia } from "./utils/customChains";

const scaffoldConfig = {
  targetNetworks: [base, baseSepolia],
  // ... other configuration options
} as const satisfies ScaffoldConfig;

🛳 Shipping Your dApp

Learn how to deploy your Smart Contracts to a Live Network and how to deploy your NextJS App.
📄️ Deploy Your Smart Contracts

To deploy your smart contracts to a live network, there are a few things you need to adjust.
📄️ Deploy Your NextJS App

We recommend connecting your GitHub repo to Vercel (through the Vercel UI) so it gets automatically deployed when pushing to main.

Deploy Your Smart Contracts

To deploy your smart contracts to a live network, there are a few things you need to adjust.
1. Configure your network

Scaffold-ETH 2 comes with a selection of predefined networks. To add your custom network:

    Hardhat
    Foundry

Go to packages/hardhat/hardhat.config.ts and add your network to the networks object.
packages/hardhat/hardhat.config.ts

networks: {
    // ... other networks
    base: {
        url: "https://mainnet.base.org",
        accounts: [deployerPrivateKey]
    },
}

Here are the Alchemy docs for information on specific networks.

You can also add your custom network by following the recipe here.
2. Generate a new account or add one to deploy the contract(s) from.

The deployer account is the account that will deploy your contracts. Additionally, the deployer account will be used to execute any function calls that are part of your deployment script.

You can generate a random account / private key by running:

yarn generate

    Hardhat
    Foundry

It will automatically add the encrypted private key (DEPLOYER_PRIVATE_KEY_ENCRYPTED) in your .env file.

You will be prompted to enter a password which will be used to encrypt your private key. Make sure to remember this password as you'll need it for future deployments and account queries.
Info

We are only storing the plain private key in memory, it's never stored in disk files for security reasons. Checkout the code here.

If you prefer to import your private key, run:

yarn account:import

You will get prompted to paste your private key and set the encryption password. It will store your encrypted private key in your .env file.

You can check the configured (generated or imported) account and balances with:

yarn account

You will need to enter your password to decrypt the private key and view the account information and balances.
3. Deploy your smart contract(s)

    Hardhat
    Foundry

By default yarn deploy will deploy all the contracts from your packages/hardhat/contracts folder to the local network. You can change defaultNetwork in:

packages/hardhat/hardhat.config.ts

3.1 Deploy specific contracts

To deploy specific contracts instead of all of them, you can follow these steps:

    Hardhat
    Foundry

    Add tags to the deploy scripts located in packages/hardhat/deploy. For example 01_deploy_my_contract.ts:

deployMyContract.tags = ["tagExample"];

    Run yarn deploy --tags tagExample to run all the scripts with the "tagExample" tag.

3.2 Deploy to specific networks

Run the command below to deploy the smart contracts to the target network. Make sure to have your encryption password and some funds in your deployer account to pay for the transaction.

yarn deploy --network network_name

    Hardhat
    Foundry

You can also specify a tag:

yarn deploy --network sepolia --tags tagExample

4. Verify your smart contract

You can verify your smart contract on Etherscan by running:

yarn verify --network network_name

eg: yarn verify --network sepolia

This command works in both Hardhat and Foundry, verifying all the deployed contracts. However, the verification method differs depending on the Solidity framework you're using...

    Hardhat
    Foundry

Hardhat uses etherscan-verify from hardhat-deploy.

Additionally, in Hardhat, there's an alternative method for contract verification. You can use hardhat-verify to verify your contracts, passing in the network name, contract address and constructor arguments (if any):

yarn hardhat-verify --network network_name contract_address "Constructor arg 1"`

If the chain you're using is not supported by any of the verifying methods, you can add new supported chains to your chosen method, either etherscan-verify or hardhat-verify.
Configuration of Third-Party Services for Production-Grade Apps.

By default, Scaffold-ETH 2 provides predefined API keys for popular services such as Alchemy and Etherscan. This allows you to begin developing and testing your applications more easily, avoiding the need to register for these services.

For production-grade applications, it's recommended to obtain your own API keys (to prevent rate limiting issues). You can configure these at:

    Hardhat
    Foundry

    ALCHEMY_API_KEY variable in packages/hardhat/.env and packages/nextjs/.env.local. You can create API keys from the Alchemy dashboard.
    ETHERSCAN_API_KEY variable in packages/hardhat/.env using your generated API key. You can get your key here.

Deploy Your NextJS App
Hint

We recommend connecting your GitHub repo to Vercel (through the Vercel UI) so it gets automatically deployed when pushing to main.

If you want to deploy directly from the CLI, run this and follow the steps to deploy to Vercel:

yarn vercel

You might need to log in to Vercel first by running:

yarn vercel:login

Once you log in (email, GitHub, etc), the default options should work. It'll give you a public URL.

If you want to redeploy to the same production URL you can run:

yarn vercel --prod

If you omit the --prod flag it will deploy it to a preview/test URL.

Make sure to check the values of your Scaffold Configuration before deploying your NextJS App.
Scaffold App Configuration

You can configure different settings for your dapp at packages/nextjs/scaffold.config.ts.

export type ScaffoldConfig = {
  targetNetworks: Chain[];
  pollingInterval: number;
  alchemyApiKey: string;
  walletConnectProjectId: string;
  onlyLocalBurnerWallet: boolean;
  walletAutoConnect: boolean;
  // your dapp custom config, eg:
  // tokenIcon : string;
};

The configuration parameters are described below. Make sure to update the values according to your needs:
- targetNetworks

Array of blockchain networks where your dapp is deployed. Use values that are present on chains object from viem/chains eg: targetNetworks: [chains.optimism]

To add a custom chain that's not in viem/chains, see the recipe, Add a custom chain.
- pollingInterval

The interval in milliseconds at which your front-end application polls the RPC servers for fresh data. Note that this setting does not affect the local network.
- alchemyApiKey

Default Alchemy API key from Scaffold-ETH 2 for local testing purposes. It's recommended to obtain your own API key from the Alchemy Dashboard and store it in this environment variable: NEXT_PUBLIC_ALCHEMY_API_KEY in the \packages\nextjs\.env.local file.
- walletConnectProjectId

WalletConnect's default project ID from Scaffold-ETH 2 for local testing purposes. It's recommended to obtain your own project ID from the WalletConnect website and store it in this environment variable: NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID in the \packages\nextjs\.env.local file.
- onlyLocalBurnerWallet

Controls the networks where the Burner Wallet feature is available. This feature provides a lightweight wallet for users.

    true => Use Burner Wallet only on Hardhat network.
    false => Use Burner Wallet on all networks.

- walletAutoConnect

Set it to true to activate automatic wallet connection behavior:

    If the user was connected into a wallet before, on page reload it reconnects automatically.
    If the user is not connected to any wallet, on reload, it connects to the burner wallet if it is enabled for the current network. See onlyLocalBurnerWallet

You can extend this configuration file, adding new parameters that you need to use across your dapp (make sure you update the above type ScaffoldConfig):

  tokenIcon: "💎",

To use the values from the ScaffoldConfig in any other file of your application, you first need to import it in those files:

import scaffoldConfig from "~~/scaffold.config";



🔌 Extensions

Extensions are modular add-ons for Scaffold-ETH 2 that provide additional functionality or serve as examples for specific features. They allow you to quickly add new features, pages, contracts, or components during project creation, ensuring seamless integration with Scaffold-ETH 2 core functionality.
📄️ How to Install Extensions

This guide explains what are extensions and how to use them in your Scaffold-ETH 2 project.
📄️ Creating Your Own Extension

This section will help you develop custom extensions for Scaffold-ETH 2, from simple additions to more complex modifications.

How to Install Extensions

This guide explains what are extensions and how to use them in your Scaffold-ETH 2 project.
What are Extensions?

Extensions are modular add-ons for Scaffold-ETH 2 that provide additional functionality or serve as examples for specific features.
Info

Extensions can only be installed during the initial setup of a new Scaffold-ETH 2 project.

They offer several benefits:

    Seamless integration with the base Scaffold-ETH 2 project
    Quick addition of new features, pages, contracts, or components at project creation
    Compatibility with Scaffold-ETH 2 core updates and improvements

Extensions are compact packages containing specific code (such as a smart contract or UI component) that automatically integrate with the latest version of Scaffold-ETH 2 when initializing a new project via npx. They are starting points for your project, not finished products.
Installing Extensions

To install an extension when creating a new Scaffold-ETH 2 project, run:

npx create-eth@latest -e {github-username}/{extension-repo-name}:{branch-name}

The {branch-name} is optional. If not specified, it uses the default branch.

E.g.: npx create-eth@latest -e ChangoMan/charts-extension
Available Extensions
You can find a complete list of available extensions, including both curated (by BuidlGuidl) and community extensions, on scaffold-eth website.
