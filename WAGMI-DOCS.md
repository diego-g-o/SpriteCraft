TypeScript
Requirements
Wagmi is designed to be as type-safe as possible! Things to keep in mind:

Types currently require using TypeScript >=5.0.4.
TypeScript doesn't follow semver and often introduces breaking changes in minor releases.
Changes to types in this repository are considered non-breaking and are usually released as patch changes (otherwise every type enhancement would be a major version!).
It is highly recommended that you lock your wagmi and typescript versions to specific patch releases and upgrade with the expectation that types may be fixed or upgraded between any release.
The non-type-related public API of Wagmi still follows semver very strictly.
To ensure everything works correctly, make sure your tsconfig.json has strict mode set to true.


tsconfig.json

{
  "compilerOptions": {
    "strict": true
  }
}
Config Types
By default React Context does not work well with type inference. To support strong type-safety across the React Context boundary, there are two options available:

Declaration merging to "register" your config globally with TypeScript.
config property to pass your config directly to hooks.
Declaration Merging
Declaration merging allows you to "register" your config globally with TypeScript. The Register type enables Wagmi to infer types in places that wouldn't normally have access to type info via React Context alone.

To set this up, add the following declaration to your project. Below, we co-locate the declaration merging and the config set up.


import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}

export const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})
Since the Register type is global, you only need to add it once in your project. Once set up, you will get strong type-safety across your entire project. For example, query hooks will type chainId based on your config's chains.


import { useBlockNumber } from 'wagmi'

useBlockNumber({ chainId: 123 })
Type '123' is not assignable to type '1 | 11155111 | undefined'.
You just saved yourself a runtime error and you didn't even need to pass your config. 🎉

Hook config Property
For cases where you have more than one Wagmi config or don't want to use the declaration merging approach, you can pass a specific config directly to hooks via the config property.


import { createConfig, http } from 'wagmi'
import { mainnet, optimism } from 'wagmi/chains'

export const configA = createConfig({ 
  chains: [mainnet], 
  transports: { 
    [mainnet.id]: http(), 
  }, 
})

export const configB = createConfig({ 
  chains: [optimism], 
  transports: { 
    [optimism.id]: http(), 
  }, 
})
As you expect, chainId is inferred correctly for each config.


import { useBlockNumber } from 'wagmi'

useBlockNumber({ chainId: 123, config: configA })
Type '123' is not assignable to type '1'.
useBlockNumber({ chainId: 123, config: configB })
Type '123' is not assignable to type '10'.
This approach is more explicit, but works well for advanced use-cases, if you don't want to use React Context or declaration merging, etc.

Const-Assert ABIs & Typed Data
Wagmi can infer types based on ABIs and EIP-712 Typed Data definitions, powered by Viem and ABIType. This achieves full end-to-end type-safety from your contracts to your frontend and enlightened developer experience by autocompleting ABI item names, catching misspellings, inferring argument and return types (including overloads), and more.

For this to work, you must either const-assert ABIs and Typed Data (more info below) or define them inline. For example, useReadContract's abi configuration parameter:


const { data } = useReadContract({
  abi: […], // <--- defined inline
})

const abi = […] as const // <--- const assertion
const { data } = useReadContract({ abi })
If type inference isn't working, it's likely you forgot to add a const assertion or define the configuration parameter inline. Also, make sure your ABIs, Typed Data definitions, and TypeScript configuration are valid and set up correctly.

TIP

Unfortunately TypeScript doesn't support importing JSON as const yet. Check out the Wagmi CLI to help with this! It can automatically fetch ABIs from Etherscan and other block explorers, resolve ABIs from your Foundry/Hardhat projects, generate React Hooks, and more.

Anywhere you see the abi or types configuration property, you can likely use const-asserted or inline ABIs and Typed Data to get type-safety and inference. These properties are also called out in the docs.

Here's what useReadContract looks like with and without a const-asserted abi property.


Const-Asserted

Not Const-Asserted

import { useReadContract } from 'wagmi'

const { data } = useReadContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: erc721Abi,
  functionName: 'balanceOf',



  args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'],
})

data


You can prevent runtime errors and be more productive by making sure your ABIs and Typed Data definitions are set up appropriately. 🎉


import { useReadContract } from 'wagmi'

useReadContract({
  abi: erc721Abi,
  functionName: 'balanecOf',
Type '"balanecOf"' is not assignable to type '"balanceOf" | "isApprovedForAll" | "getApproved" | "ownerOf" | "tokenURI" | undefined'. Did you mean '"balanceOf"'?
})
Configure Internal Types
For advanced use-cases, you may want to configure Wagmi's internal types. Most of Wagmi's types relating to ABIs and EIP-712 Typed Data are powered by ABIType. See the ABIType docs for more info on how to configure types.

TanStack Query
Wagmi Hooks are not only a wrapper around the core Wagmi Actions, but they also utilize TanStack Query to enable trivial and intuitive fetching, caching, synchronizing, and updating of asynchronous data in your React applications.

Without an asynchronous data fetching abstraction, you would need to handle all the negative side-effects that comes as a result, such as: representing finite states (loading, error, success), handling race conditions, caching against a deterministic identifier, etc.

Queries & Mutations
Wagmi Hooks represent either a Query or a Mutation.

Queries are used for fetching data (e.g. fetching a block number, reading from a contract, etc), and are typically invoked on mount by default. All queries are coupled to a unique Query Key, and can be used for further operations such as refetching, prefetching, or modifying the cached data.

Mutations are used for mutating data (e.g. connecting/disconnecting accounts, writing to a contract, switching chains, etc), and are typically invoked in response to a user interaction. Unlike Queries, they are not coupled with a query key.

Terms
Query: An asynchronous data fetching (e.g. read data) operation that is tied against a unique Query Key.
Mutation: An asynchronous mutating (e.g. create/update/delete data or side-effect) operation.
Query Key: A unique identifier that is used to deterministically identify a query. It is typically a tuple of the query name and the query arguments.
Stale Data: Data that is unused or inactive after a certain period of time.
Query Fetching: The process of invoking an async query function.
Query Refetching: The process of refetching rendered queries.
Query Invalidation: The process of marking query data as stale (e.g. inactive/unused), and refetching rendered queries.
Query Prefetching: The process of prefetching queries and seeding the cache.
Persistence via External Stores
By default, TanStack Query persists all query data in-memory. This means that if you refresh the page, all in-memory query data will be lost.

If you want to persist query data to an external storage, you can utilize TanStack Query's createSyncStoragePersister or createAsyncStoragePersister to plug external storage like localStorage, sessionStorage, IndexedDB or AsyncStorage (React Native).

Sync Storage
Below is an example of how to set up Wagmi + TanStack Query with sync external storage like localStorage or sessionStorage.

Install

pnpm

npm

yarn

bun

pnpm i @tanstack/query-sync-storage-persister @tanstack/react-query-persist-client
Usage

// 1. Import modules.
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { WagmiProvider, deserialize, serialize } from 'wagmi'

// 2. Create a new Query Client with a default `gcTime`.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1_000 * 60 * 60 * 24, // 24 hours
    },
  },
})

// 3. Set up the persister.
const persister = createSyncStoragePersister({
  serialize,
  storage: window.localStorage,
  deserialize,
})

function App() {
  return (
    <WagmiProvider config={config}>
      {/* 4. Wrap app in PersistQueryClientProvider */}
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
      >
        {/* ... */}
      </PersistQueryClientProvider>
    </WagmiProvider>
  )
}
Read more about Sync Storage Persistence.

Async Storage
Below is an example of how to set up Wagmi + TanStack Query with async external storage like IndexedDB or AsyncStorage.

Install

pnpm

npm

yarn

bun

pnpm i @tanstack/query-async-storage-persister @tanstack/react-query-persist-client
Usage

// 1. Import modules.
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { WagmiProvider, deserialize, serialize } from 'wagmi'

// 2. Create a new Query Client with a default `gcTime`.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1_000 * 60 * 60 * 24, // 24 hours
    },
  },
})

// 3. Set up the persister.
const persister = createAsyncStoragePersister({
  serialize,
  storage: AsyncStorage,
  deserialize,
})

function App() {
  return (
    <WagmiProvider config={config}>
      {/* 4. Wrap app in PersistQueryClientProvider */}
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
      >
        {/* ... */}
      </PersistQueryClientProvider>
    </WagmiProvider>
  )
}
Read more about Async Storage Persistence.

Query Keys
Query Keys are typically used to perform advanced operations on the query such as: invalidation, refetching, prefetching, etc.

Wagmi exports Query Keys for every Hook, and they can be retrieved via the Hook (React) or via an Import (Vanilla JS).

Read more about Query Keys on the TanStack Query docs.

Hook (React)
Each Hook returns a queryKey value. You would use this approach when you want to utilize the query key in a React component as it handles reactivity for you, unlike the Import method below.


import { useBlock } from 'wagmi'

function App() {
  const { queryKey } = useBlock()
}
Import (Vanilla JS)
Each Hook has a corresponding get<X>QueryOptions function that returns a query key. You would use this method when you want to utilize the query key outside of a React component in a Vanilla JS context, like in a utility function.


import { getBlockQueryOptions } from 'wagmi/query'
import { config } from './config'

function perform() {
  const { queryKey } = getBlockQueryOptions(config, { 
    chainId: config.state.chainId
  })
}
WARNING

The caveat of this method is that it does not handle reactivity for you (e.g. active account/chain changes, argument changes, etc). You would need to handle this yourself by explicitly passing through the arguments to get<X>QueryOptions.

Invalidating Queries
Invalidating a query is the process of marking the query data as stale (e.g. inactive/unused), and refetching the queries that are already rendered.

Read more about Invalidating Queries on the TanStack Query docs.

Example: Watching a Users' Balance
You may want to "watch" a users' balance, and invalidate the balance after each incoming block. We can invoke invalidateQueries inside a useEffect with the block number as it's only dependency – this will refetch all rendered balance queries when the blockNumber changes.


import { useQueryClient } from '@tanstack/react-query' 
import { useEffect } from 'react' 
import { useBlockNumber, useBalance } from 'wagmi' 

function App() {
  const queryClient = useQueryClient()
  const { data: blockNumber } = useBlockNumber({ watch: true })
  const { data: balance, queryKey } = useBalance()
  
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey })
  }, [blockNumber])

  return <div>{balance}</div>
}
Example: After User Interaction
Maybe you want to invalidate a users' balance after some interaction. This would mark the balance as stale, and consequently refetch all rendered balance queries.


import { useBalance } from 'wagmi'

function App() {
  // 1. Extract `queryKey` from the useBalance Hook.
  const { queryKey } = useBalance()

  return (
    <button
      onClick={async () => {
        // 2. Invalidate the query when the user clicks "Invalidate".
        await queryClient.invalidateQueries({ queryKey })
      }}
    >
      Invalidate
    </button>
  )
}

function Example() {
  // 3. Other `useBalance` Hooks in your rendered React tree will be refetched!
  const { data: balance } = useBalance()

  return <div>{balance}</div>
}
Fetching Queries
Fetching a query is the process of invoking the query function to retrieve data. If the query exists and the data is not invalidated or older than a given staleTime, then the data from the cache will be returned. Otherwise, the query will fetch for the latest data.


example.tsx

app.tsx

config.ts

import { getBlockQueryOptions } from 'wagmi'
import { queryClient } from './app'
import { config } from './config'

export async function fetchBlockData() {
  return queryClient.fetchQuery(
    getBlockQueryOptions(config, {
      chainId: config.state.chainId,
    }
  ))
}
Retrieving & Updating Query Data
You can retrieve and update query data imperatively with getQueryData and setQueryData. This is useful for scenarios where you want to retrieve or update a query outside of a React component.

Note that these functions do not invalidate or refetch queries.


example.tsx

app.tsx

config.ts

import { getBlockQueryOptions } from 'wagmi'
import type { Block } from 'viem'
import { queryClient } from './app'
import { config } from './config'

export function getPendingBlockData() {
  return queryClient.getQueryData(
    getBlockQueryOptions(config, {
      chainId: config.state.chainId,
      tag: 'pending'
    }
  ))
}

export function setPendingBlockData(data: Block) {
  return queryClient.setQueryData(
    getBlockQueryOptions(config, {
      chainId: config.state.chainId,
      tag: 'pending'
    },
    data
  ))
}
Prefetching Queries
Prefetching a query is the process of fetching the data ahead of time and seeding the cache with the returned data. This is useful for scenarios where you want to fetch data before the user navigates to a page, or fetching data on the server to be reused on client hydration.

Read more about Prefetching Queries on the TanStack Query docs.

Example: Prefetching in Event Handler

import { Link } from 'next/link'
import { getBlockQueryOptions } from 'wagmi'

function App() {
  const config = useConfig()
  const chainId = useChainId()

  // 1. Set up a function to prefetch the block data.
  const prefetch = () =>
    queryClient.prefetchQuery(getBlockQueryOptions(config, { chainId }))
  

  return (
    <Link
      // 2. Add event handlers to prefetch the block data
      // when user hovers over or focuses on the button.
      onMouseEnter={prefetch}
      onFocus={prefetch}
      to="/block-details"
    >
      Block details
    </Link>
  )
}
SSR
It is possible to utilize TanStack Query's SSR strategies with Wagmi Hooks & Query Keys. Check out the Server Rendering & Hydration & Advanced Server Rendering guides.

Devtools
TanStack Query includes dedicated Devtools that assist in visualizing and debugging your queries, their cache states, and much more. You will have to pass a custom queryKeyFn to your QueryClient for Devtools to correctly serialize BigInt values for display. Alternatively, You can use the hashFn from @wagmi/core/query, which already handles this serialization.

Install

pnpm

npm

yarn

bun

pnpm i @tanstack/react-query-devtools
Usage

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { hashFn } from "@wagmi/core/query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: hashFn,
    },
  },
});


Viem
Viem is a low-level TypeScript Interface for Ethereum that enables developers to interact with the Ethereum blockchain, including: JSON-RPC API abstractions, Smart Contract interaction, wallet & signing implementations, coding/parsing utilities and more.

Wagmi Core is essentially a wrapper over Viem that provides multi-chain functionality via Wagmi Config and automatic account management via Connectors.

Leveraging Viem Actions
All of the core Wagmi Hooks are friendly wrappers around Viem Actions that inject a multi-chain and connector aware Wagmi Config.

There may be cases where you might want to dig deeper and utilize Viem Actions directly (maybe a Hook doesn't exist in Wagmi yet). In these cases, you can create your own custom Wagmi Hook by importing Viem Actions directly via viem/actions and plugging in a Viem Client returned by the useClient Hook.

The example below demonstrates two different ways to utilize Viem Actions:

Tree-shakable Actions (recommended): Uses useClient (for public actions) and useConnectorClient (for wallet actions).
Client Actions: Uses usePublicClient (for public actions) and useWalletClient (for wallet actions).
TIP

It is highly recommended to use the tree-shakable method to ensure that you are only pulling modules you use, and keep your bundle size low.


Tree-shakable Actions

Client Actions

// 1. Import modules. 
import { useMutation, useQuery } from '@tanstack/react-query'
import { http, createConfig, useClient, useConnectorClient } from 'wagmi' 
import { base, mainnet, optimism, zora } from 'wagmi/chains' 
import { getLogs, watchAsset } from 'viem/actions'

// 2. Set up a Wagmi Config 
export const config = createConfig({ 
  chains: [base, mainnet, optimism, zora], 
  transports: { 
    [base.id]: http(), 
    [mainnet.id]: http(), 
    [optimism.id]: http(), 
    [zora.id]: http(), 
  }, 
}) 

function Example() {
  // 3. Extract a Viem Client for the current active chain.
  const publicClient = useClient({ config })

  // 4. Create a "custom" Query Hook that utilizes the Client.
  const { data: logs } = useQuery({
    queryKey: ['logs', publicClient.uid],
    queryFn: () => getLogs(publicClient, /* ... */)
  })
  
  // 5. Extract a Viem Client for the current active chain & account.
  const { data: walletClient } = useConnectorClient({ config })

  // 6. Create a "custom" Mutation Hook that utilizes the Client.
  const { mutate } = useMutation({
    mutationFn: (asset) => watchAsset(walletClient, asset)
  })

  return (
    <div>
      {/* ... */}
    </div>
  )
}
Private Key & Mnemonic Accounts
It is possible to utilize Viem's Private Key & Mnemonic Accounts with Wagmi by explicitly passing through the account via the account argument on Wagmi Actions.


import { http, createConfig, useSendTransaction } from 'wagmi' 
import { base, mainnet, optimism, zora } from 'wagmi/chains' 
import { parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

export const config = createConfig({ 
  chains: [base, mainnet, optimism, zora], 
  transports: { 
    [base.id]: http(), 
    [mainnet.id]: http(), 
    [optimism.id]: http(), 
    [zora.id]: http(), 
  }, 
}) 

const account = privateKeyToAccount('0x...')

function Example() {
  const { data: hash } = useSendTransaction({
    account,
    to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
    value: parseEther('0.001')
  })
}
INFO

Wagmi currently does not support hoisting Private Key & Mnemonic Accounts to the top-level Wagmi Config – meaning you have to explicitly pass through the account to every Action. If you feel like this is a feature that should be added, please open an discussion.


Error Handling
The error property in Wagmi Hooks is strongly typed with it's corresponding error type. This enables you to have granular precision with handling errors in your application.

You can discriminate the error type by using the name property on the error object.


index.tsx

config.ts

import { useBlockNumber } from 'wagmi'

function App() {
  const { data, error } = useBlockNumber()

  error?.name






  if (error?.name === 'HttpRequestError') {
    const { status } = error


    return <div>A HTTP error occurred. Status: {status}</div>
  }
  if (error?.name === 'LimitExceededRpcError') {
    const { code } = error

    
    return <div>Rate limit exceeded. Code: {code}</div>
  }
  // ...
}

Chain Properties
Some chains support additional properties related to blocks and transactions. This is powered by Viem's formatters and serializers. For example, Celo, ZkSync, OP Stack chains all support additional properties. In order to use these properties in a type-safe way, there are a few things you should be aware of.


TIP

Make sure you follow the TypeScript guide's Config Types section before moving on. The easiest way to do this is to use Declaration Merging to "register" your config globally with TypeScript.


import { http, createConfig } from 'wagmi'
import { base, celo, mainnet } from 'wagmi/chains'

export const config = createConfig({
  chains: [base, celo, mainnet],
  transports: {
    [base.id]: http(),
    [celo.id]: http(),
    [mainnet.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
Narrowing Parameters
Once your Config is registered with TypeScript, you are ready to access chain-specific properties! For example, Celo's feeCurrency is available.


index.tsx

config.ts

import { parseEther } from 'viem'
import { useSimulateContract } from 'wagmi'

const result = useSimulateContract({
  to: '0xd2135CfB216b74109775236E36d4b433F1DF507B',
  value: parseEther('0.01'),
  feeCurrency: '0x…', 
})
This is great, but if you have multiple chains that support additional properties, your autocomplete could be overwhelmed with all of them. By setting the chainId property to a specific value (e.g. celo.id), you can narrow parameters to a single chain.


index.tsx

config.ts

import { parseEther } from 'viem'
import { useSimulateContract } from 'wagmi'
import { celo } from 'wagmi/chains'

const result = useSimulateContract({
  to: '0xd2135CfB216b74109775236E36d4b433F1DF507B',
  value: parseEther('0.01'),
  chainId: celo.id, 
  feeCurrency: '0x…', 
  // ^? (property) feeCurrency?: `0x${string}` | undefined
})
Narrowing Return Types
Return types can also have chain-specific properties attached to them. There are a couple approaches for extracting these properties.

chainId Parameter
Not only can you use the chainId parameter to narrow parameters, you can also use it to narrow the return type.


index.tsx

config.ts

import { useWaitForTransactionReceipt } from 'wagmi'
import { zkSync } from 'wagmi/chains'

const { data } = useWaitForTransactionReceipt({
  chainId: zkSync.id,
  hash: '0x16854fcdd0219cacf5aec5e4eb2154dac9e406578a1510a6fc48bd0b67e69ea9',
})

data?.logs
//    ^? (property) logs: ZkSyncLog[] | undefined
chainId Data Property
Wagmi internally will set a chainId property on return types that you can use to narrow results. The chainId is determined from the chainId parameter or global state (e.g. connector). You can use this property to help TypeScript narrow the type.


index.tsx

config.ts

import { useWaitForTransactionReceipt } from 'wagmi'
import { zkSync } from 'wagmi/chains'

const { data } = useWaitForTransactionReceipt({
  hash: '0x16854fcdd0219cacf5aec5e4eb2154dac9e406578a1510a6fc48bd0b67e69ea9',
})

if (data?.chainId === zkSync.id) {
  data?.logs
  //    ^? (property) logs: ZkSyncLog[] | undefined
}
Troubleshooting
If chain properties aren't working, make sure TypeScript is configured correctly. Not all chains have additional properties, to check which ones do, see the Viem repo (chains that have a top-level directory under src/chains support additional properties).


SSR
Wagmi uses client-only external stores (such as localStorage and mipd) to show the user the most relevant data as quickly as possible on first render.

However, the caveat of using these external client stores is that frameworks which incorporate SSR (such as Next.js) will throw hydration warnings on the client when it identifies mismatches between the server-rendered HTML and the client-rendered HTML.

To stop this from happening, you can toggle on the ssr property in the Wagmi Config.


import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

const config = createConfig({
  chains: [mainnet, sepolia],
  ssr: true,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})
Turning on the ssr property means that content from the external stores will be hydrated on the client after the initial mount.

Persistence using Cookies
As a result of turning on the ssr property, external persistent stores like localStorage will be hydrated on the client after the initial mount.

This means that you will still see a flash of "empty" data on the client (e.g. a "disconnected" account instead of a "reconnecting" account, or an empty address instead of the last connected address) until after the first mount, when the store hydrates.

In order to persist data between the server and the client, you can use cookies.

1. Set up cookie storage
First, we will set up cookie storage in the Wagmi Config.


import { 
  createConfig, 
  http, 
  cookieStorage,
  createStorage
} from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

export function getConfig() {
  return createConfig({
    chains: [mainnet, sepolia],
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
  })
}
2. Hydrate the cookie
Next, we will need to add some mechanisms to hydrate the stored cookie in Wagmi.

Next.js App Directory
In our app/layout.tsx file (a Server Component), we will need to extract the cookie from the headers function and pass it to cookieToInitialState.

We will need to pass this result to the initialState property of the WagmiProvider. The WagmiProvider must be in a Client Component tagged with "use client" (see app/providers.tsx tab).


app/layout.tsx

app/providers.tsx

app/config.ts

import { type ReactNode } from 'react'
import { headers } from 'next/headers'
import { cookieToInitialState } from 'wagmi'

import { getConfig } from './config'
import { Providers } from './providers'

export default async function Layout({ children }: { children: ReactNode }) {
  const initialState = cookieToInitialState(
    getConfig(),
    (await headers()).get('cookie')
  )
  return (
    <html lang="en">
      <body>
        <Providers>
        <Providers initialState={initialState}>
          {children}
        </Providers>
      </body>
    </html>
  )
}


Connect Wallet
The ability for a user to connect their wallet is a core function for any Dapp. It allows users to perform tasks such as: writing to contracts, signing messages, or sending transactions.

Wagmi contains everything you need to get started with building a Connect Wallet module. To get started, you can either use a third-party library or build your own.

Third-party Libraries
You can use a pre-built Connect Wallet module from a third-party library such as:

ConnectKit - Guide
AppKit - Guide
RainbowKit - Guide
Dynamic - Guide
Privy - Guide
The above libraries are all built on top of Wagmi, handle all the edge cases around wallet connection, and provide a seamless Connect Wallet UX that you can use in your Dapp.

Build Your Own
Wagmi provides you with the Hooks to get started building your own Connect Wallet module.

It takes less than five minutes to get up and running with Browser Wallets, WalletConnect, and Coinbase Wallet.

1. Configure Wagmi
Before we get started with building the functionality of the Connect Wallet module, we will need to set up the Wagmi configuration.

Let's create a config.ts file and export a config object.


config.ts

import { http, createConfig } from 'wagmi'
import { base, mainnet, optimism } from 'wagmi/chains'
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'

const projectId = '<WALLETCONNECT_PROJECT_ID>'

export const config = createConfig({
  chains: [mainnet, base],
  connectors: [
    injected(),
    walletConnect({ projectId }),
    metaMask(),
    safe(),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
})
In the above configuration, we want to set up connectors for Injected (browser), WalletConnect (browser + mobile), MetaMask, and Safe wallets. This configuration uses the Mainnet and Base chains, but you can use whatever you want.

WARNING

Make sure to replace the projectId with your own WalletConnect Project ID, if you wish to use WalletConnect!

Get your Project ID

2. Wrap App in Context Provider
Next, we will need to wrap our React App with Context so that our application is aware of Wagmi & React Query's reactive state and in-memory caching.


app.tsx

config.ts

 // 1. Import modules
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from './config'

// 2. Set up a React Query client.
const queryClient = new QueryClient()

function App() {
  // 3. Wrap app with Wagmi and React Query context.
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}> 
        {/** ... */} 
      </QueryClientProvider> 
    </WagmiProvider>
  )
}
3. Display Wallet Options
After that, we will create a WalletOptions component that will display our connectors. This will allow users to select a wallet and connect.

Below, we are rendering a list of connectors retrieved from useConnect. When the user clicks on a connector, the connect function will connect the users' wallet.


wallet-options.tsx

app.tsx

config.ts

import * as React from 'react'
import { Connector, useConnect } from 'wagmi'

export function WalletOptions() {
  const { connectors, connect } = useConnect()

  return connectors.map((connector) => (
    <button key={connector.uid} onClick={() => connect({ connector })}>
      {connector.name}
    </button>
  ))
}
4. Display Connected Account
Lastly, if an account is connected, we want to show some basic information, like the connected address and ENS name and avatar.

Below, we are using hooks like useAccount, useEnsAvatar and useEnsName to extract this information.

We are also utilizing useDisconnect to show a "Disconnect" button so a user can disconnect their wallet.


account.tsx

wallet-options.tsx

app.tsx

config.ts

import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi'

export function Account() {
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: ensName } = useEnsName({ address })
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! })

  return (
    <div>
      {ensAvatar && <img alt="ENS Avatar" src={ensAvatar} />}
      {address && <div>{ensName ? `${ensName} (${address})` : address}</div>}
      <button onClick={() => disconnect()}>Disconnect</button>
    </div>
  )
}
5. Wire it up!
Finally, we can wire up our Wallet Options and Account components to our application's entrypoint.


app.tsx

account.tsx

wallet-options.tsx

config.ts

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, useAccount } from 'wagmi'
import { config } from './config'
import { Account } from './account'
import { WalletOptions } from './wallet-options'

const queryClient = new QueryClient()

function ConnectWallet() {
  const { isConnected } = useAccount()
  if (isConnected) return <Account />
  return <WalletOptions />
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}> 
        <ConnectWallet />
      </QueryClientProvider> 
    </WagmiProvider>
  )
}



Send Transaction
The following guide teaches you how to send transactions in Wagmi. The example below builds on the Connect Wallet guide and uses the useSendTransaction & useWaitForTransaction hooks.

Example
Feel free to check out the example before moving on:


Steps
1. Connect Wallet
Follow the Connect Wallet guide guide to get this set up.

2. Create a new component
Create your SendTransaction component that will contain the send transaction logic.


send-transaction.tsx

import * as React from 'react'
 
export function SendTransaction() {
  return (
    <form>
      <input name="address" placeholder="0xA0Cf…251e" required />
      <input name="value" placeholder="0.05" required />
      <button type="submit">Send</button>
    </form>
  )
}
3. Add a form handler
Next, we will need to add a handler to the form that will send the transaction when the user hits "Send". This will be a basic handler in this step.


send-transaction.tsx

import * as React from 'react'
 
export function SendTransaction() {
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const to = formData.get('address') as `0x${string}`
    const value = formData.get('value') as string
  }

  return (
    <form>
    <form onSubmit={submit}>
      <input name="address" placeholder="0xA0Cf…251e" required />
      <input name="value" placeholder="0.05" required />
      <button type="submit">Send</button>
    </form>
  )
}
4. Hook up the useSendTransaction Hook
Now that we have the form handler, we can hook up the useSendTransaction Hook to send the transaction.


send-transaction.tsx

import * as React from 'react'
import { useSendTransaction } from 'wagmi'
import { parseEther } from 'viem'
 
export function SendTransaction() {
  const { data: hash, sendTransaction } = useSendTransaction()

  async function submit(e: React.FormEvent<HTMLFormElement>) { 
    e.preventDefault() 
    const formData = new FormData(e.target as HTMLFormElement) 
    const to = formData.get('address') as `0x${string}` 
    const value = formData.get('value') as string 
    sendTransaction({ to, value: parseEther(value) })
  } 

  return (
    <form onSubmit={submit}>
      <input name="address" placeholder="0xA0Cf…251e" required />
      <input name="value" placeholder="0.05" required />
      <button type="submit">Send</button>
      {hash && <div>Transaction Hash: {hash}</div>}
    </form>
  )
}
5. Add loading state (optional)
We can optionally add a loading state to the "Send" button while we are waiting confirmation from the user's wallet.


send-transaction.tsx

import * as React from 'react'
import { useSendTransaction } from 'wagmi' 
import { parseEther } from 'viem' 
 
export function SendTransaction() {
  const { 
    data: hash, 
    isPending,
    sendTransaction 
  } = useSendTransaction() 

  async function submit(e: React.FormEvent<HTMLFormElement>) { 
    e.preventDefault() 
    const formData = new FormData(e.target as HTMLFormElement) 
    const to = formData.get('address') as `0x${string}` 
    const value = formData.get('value') as string 
    sendTransaction({ to, value: parseEther(value) }) 
  } 

  return (
    <form onSubmit={submit}>
      <input name="address" placeholder="0xA0Cf…251e" required />
      <input name="value" placeholder="0.05" required />
      <button 
        disabled={isPending}
        type="submit"
      >
        Send
        {isPending ? 'Confirming...' : 'Send'}
      </button>
      {hash && <div>Transaction Hash: {hash}</div>} 
    </form>
  )
}
6. Wait for transaction receipt (optional)
We can also display the transaction confirmation status to the user by using the useWaitForTransactionReceipt Hook.


send-transaction.tsx

import * as React from 'react'
import { 
  useSendTransaction, 
  useWaitForTransactionReceipt
} from 'wagmi' 
import { parseEther } from 'viem' 
 
export function SendTransaction() {
  const { 
    data: hash, 
    isPending, 
    sendTransaction 
  } = useSendTransaction() 

  async function submit(e: React.FormEvent<HTMLFormElement>) { 
    e.preventDefault() 
    const formData = new FormData(e.target as HTMLFormElement) 
    const to = formData.get('address') as `0x${string}` 
    const value = formData.get('value') as string 
    sendTransaction({ to, value: parseEther(value) }) 
  } 

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  return (
    <form onSubmit={submit}>
      <input name="address" placeholder="0xA0Cf…251e" required />
      <input name="value" placeholder="0.05" required />
      <button 
        disabled={isPending} 
        type="submit"
      >
        {isPending ? 'Confirming...' : 'Send'} 
      </button>
      {hash && <div>Transaction Hash: {hash}</div>} 
      {isConfirming && <div>Waiting for confirmation...</div>}
      {isConfirmed && <div>Transaction confirmed.</div>}
    </form>
  )
}
7. Handle errors (optional)
If the user rejects the transaction, or the user does not have enough funds to cover the transaction, we can display an error message to the user.


send-transaction.tsx

import * as React from 'react'
import { 
  type BaseError,
  useSendTransaction, 
  useWaitForTransactionReceipt 
} from 'wagmi' 
import { parseEther } from 'viem' 
 
export function SendTransaction() {
  const { 
    data: hash,
    error,
    isPending, 
    sendTransaction 
  } = useSendTransaction() 

  async function submit(e: React.FormEvent<HTMLFormElement>) { 
    e.preventDefault() 
    const formData = new FormData(e.target as HTMLFormElement) 
    const to = formData.get('address') as `0x${string}` 
    const value = formData.get('value') as string 
    sendTransaction({ to, value: parseEther(value) }) 
  } 

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash, 
    }) 

  return (
    <form onSubmit={submit}>
      <input name="address" placeholder="0xA0Cf…251e" required />
      <input name="value" placeholder="0.05" required />
      <button 
        disabled={isPending} 
        type="submit"
      >
        {isPending ? 'Confirming...' : 'Send'} 
      </button>
      {hash && <div>Transaction Hash: {hash}</div>} 
      {isConfirming && <div>Waiting for confirmation...</div>} 
      {isConfirmed && <div>Transaction confirmed.</div>} 
      {error && (
        <div>Error: {(error as BaseError).shortMessage || error.message}</div>
      )}
    </form>
  )
}
8. Wire it up!
Finally, we can wire up our Send Transaction component to our application's entrypoint.


app.tsx

send-transaction.tsx

config.ts

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, useAccount } from 'wagmi'
import { config } from './config'
import { SendTransaction } from './send-transaction'

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}> 
        <SendTransaction />
      </QueryClientProvider> 
    </WagmiProvider>
  )
}


Read from Contract
The useReadContract Hook allows you to read data on a smart contract, from a view or pure (read-only) function. They can only read the state of the contract, and cannot make any changes to it. Since read-only methods do not change the state of the contract, they do not require any gas to be executed, and can be called by any user without the need to pay for gas.

The component below shows how to retrieve the token balance of an address from the Wagmi Example contract


read-contract.tsx

contracts.ts

import { useReadContract } from 'wagmi'
import { wagmiContractConfig } from './contracts'

function ReadContract() {
  const { data: balance } = useReadContract({
    ...wagmiContractConfig,
    functionName: 'balanceOf',
    args: ['0x03A71968491d55603FFe1b11A9e23eF013f75bCF'],
  })

  return (
    <div>Balance: {balance?.toString()}</div>
  )
}
If useReadContract depends on another value (address in the example below), you can use the query.enabled option to prevent the query from running until the dependency is ready.


const { data: balance } = useReadContract({
  ...wagmiContractConfig,
  functionName: 'balanceOf',
  args: [address],
  query: {
    enabled: !!address,
  },
})
Loading & Error States
The useReadContract Hook also returns loading & error states, which can be used to display a loading indicator while the data is being fetched, or an error message if contract execution reverts.


read-contract.tsx

read-contract.tsx (refetch)

read-contract.tsx (invalidate)

import { type BaseError, useReadContract } from 'wagmi'

function ReadContract() {
  const { 
    data: balance,
    error,
    isPending
  } = useReadContract({
    ...wagmiContractConfig,
    functionName: 'balanceOf',
    args: ['0x03A71968491d55603FFe1b11A9e23eF013f75bCF'],
  })

  if (isPending) return <div>Loading...</div>

  if (error)
    return (
      <div>
        Error: {(error as BaseError).shortMessage || error.message}
      </div>
    )

  return (
    <div>Balance: {balance?.toString()}</div>
  )
}
Refetching On Blocks
The useBlockNumber Hook can be utilized to refetch or invalidate the contract data on a specific block interval.


read-contract.tsx (refetch)

read-contract.tsx (invalidate)

import { useEffect } from 'react'
import { useBlockNumber, useReadContract } from 'wagmi'

function ReadContract() {
  const { data: balance, refetch } = useReadContract({
    ...wagmiContractConfig,
    functionName: 'balanceOf',
    args: ['0x03A71968491d55603FFe1b11A9e23eF013f75bCF'],
  })
  const { data: blockNumber } = useBlockNumber({ watch: true })

  useEffect(() => {
    // want to refetch every `n` block instead? use the modulo operator!
    // if (blockNumber % 5 === 0) refetch() // refetch every 5 blocks
    refetch()
  }, [blockNumber])

  return (
    <div>Balance: {balance?.toString()}</div>
  )
}
Calling Multiple Functions
We can use the useReadContract Hook multiple times in a single component to call multiple functions on the same contract, but this ends up being hard to manage as the number of functions increases, especially when we also want to deal with loading & error states.

Luckily, to make this easier, we can use the useReadContracts Hook to call multiple functions in a single call.


read-contract.tsx

import { type BaseError, useReadContracts } from 'wagmi'

function ReadContract() {
  const { 
    data,
    error,
    isPending
  } = useReadContracts({ 
    contracts: [{ 
      ...wagmiContractConfig,
      functionName: 'balanceOf',
      args: ['0x03A71968491d55603FFe1b11A9e23eF013f75bCF'],
    }, { 
      ...wagmiContractConfig, 
      functionName: 'ownerOf', 
      args: [69n], 
    }, { 
      ...wagmiContractConfig, 
      functionName: 'totalSupply', 
    }] 
  }) 
  const [balance, ownerOf, totalSupply] = data || [] 

  if (isPending) return <div>Loading...</div>

  if (error)
    return (
      <div>
        Error: {(error as BaseError).shortMessage || error.message}
      </div>
    ) 

  return (
    <>
      <div>Balance: {balance?.toString()}</div>
      <div>Owner of Token 69: {ownerOf?.toString()}</div> 
      <div>Total Supply: {totalSupply?.toString()}</div> 
    </>
  )
}



Write to Contract
The useWriteContract Hook allows you to mutate data on a smart contract, from a payable or nonpayable (write) function. These types of functions require gas to be executed, hence a transaction is broadcasted in order to change the state.

In the guide below, we will teach you how to implement a "Mint NFT" form that takes in a dynamic argument (token ID) using Wagmi. The example below builds on the Connect Wallet guide and uses the useWriteContract & useWaitForTransaction hooks.

If you have already completed the Sending Transactions guide, this guide will look very similar! That's because writing to a contract internally broadcasts & sends a transaction.

Example
Feel free to check out the example before moving on:


Steps
1. Connect Wallet
Follow the Connect Wallet guide guide to get this set up.

2. Create a new component
Create your MintNFT component that will contain the Mint NFT logic.


mint-nft.tsx

import * as React from 'react'
 
export function MintNFT() {
  return (
    <form>
      <input name="tokenId" placeholder="69420" required />
      <button type="submit">Mint</button>
    </form>
  )
}
3. Add a form handler
Next, we will need to add a handler to the form that will send the transaction when the user hits "Mint". This will be a basic handler in this step.


mint-nft.tsx

import * as React from 'react'
 
export function MintNFT() {
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const tokenId = formData.get('tokenId') as string
  }

  return (
    <form>
    <form onSubmit={submit}>
      <input name="tokenId" placeholder="69420" required />
      <button type="submit">Mint</button>
    </form>
  )
}
4. Hook up the useWriteContract Hook
Now that we have the form handler, we can hook up the useWriteContract Hook to send the transaction.


mint-nft.tsx

abi.ts

import * as React from 'react'
import { useWriteContract } from 'wagmi'
import { abi } from './abi'
 
export function MintNFT() {
  const { data: hash, writeContract } = useWriteContract()

  async function submit(e: React.FormEvent<HTMLFormElement>) { 
    e.preventDefault() 
    const formData = new FormData(e.target as HTMLFormElement) 
    const tokenId = formData.get('tokenId') as string 
    writeContract({
      address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
      abi,
      functionName: 'mint',
      args: [BigInt(tokenId)],
    })
  } 

  return (
    <form onSubmit={submit}>
      <input name="tokenId" placeholder="69420" required />
      <button type="submit">Mint</button>
      {hash && <div>Transaction Hash: {hash}</div>}
    </form>
  )
}
5. Add loading state (optional)
We can optionally add a loading state to the "Mint" button while we are waiting confirmation from the user's wallet.


mint-nft.tsx

abi.ts

import * as React from 'react'
import { useWriteContract } from 'wagmi'
import { abi } from './abi'
 
export function MintNFT() {
  const { 
    data: hash, 
    isPending,
    writeContract 
  } = useWriteContract() 

  async function submit(e: React.FormEvent<HTMLFormElement>) { 
    e.preventDefault() 
    const formData = new FormData(e.target as HTMLFormElement) 
    const tokenId = formData.get('tokenId') as string 
    writeContract({
      address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
      abi,
      functionName: 'mint',
      args: [BigInt(tokenId)],
    })
  } 

  return (
    <form onSubmit={submit}>
      <input name="tokenId" placeholder="69420" required />
      <button 
        disabled={isPending}
        type="submit"
      >
        Mint
        {isPending ? 'Confirming...' : 'Mint'}
      </button>
      {hash && <div>Transaction Hash: {hash}</div>}
    </form>
  )
}
6. Wait for transaction receipt (optional)
We can also display the transaction confirmation status to the user by using the useWaitForTransactionReceipt Hook.


mint-nft.tsx

abi.ts

import * as React from 'react'
import { 
  useWaitForTransactionReceipt,
  useWriteContract 
} from 'wagmi'
import { abi } from './abi'
 
export function MintNFT() {
  const { 
    data: hash, 
    isPending, 
    writeContract 
  } = useWriteContract() 

  async function submit(e: React.FormEvent<HTMLFormElement>) { 
    e.preventDefault() 
    const formData = new FormData(e.target as HTMLFormElement) 
    const tokenId = formData.get('tokenId') as string 
    writeContract({
      address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
      abi,
      functionName: 'mint',
      args: [BigInt(tokenId)],
    })
  } 

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  return (
    <form onSubmit={submit}>
      <input name="tokenId" placeholder="69420" required />
      <button 
        disabled={isPending} 
        type="submit"
      >
        {isPending ? 'Confirming...' : 'Mint'} 
      </button>
      {hash && <div>Transaction Hash: {hash}</div>}
      {isConfirming && <div>Waiting for confirmation...</div>}
      {isConfirmed && <div>Transaction confirmed.</div>}
    </form>
  )
}
7. Handle errors (optional)
If the user rejects the transaction, or the contract reverts, we can display an error message to the user.


mint-nft.tsx

abi.ts

import * as React from 'react'
import { 
  type BaseError,
  useWaitForTransactionReceipt, 
  useWriteContract 
} from 'wagmi'
import { abi } from './abi'
 
export function MintNFT() {
  const { 
    data: hash,
    error,
    isPending, 
    writeContract 
  } = useWriteContract() 

  async function submit(e: React.FormEvent<HTMLFormElement>) { 
    e.preventDefault() 
    const formData = new FormData(e.target as HTMLFormElement) 
    const tokenId = formData.get('tokenId') as string 
    writeContract({
      address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
      abi,
      functionName: 'mint',
      args: [BigInt(tokenId)],
    })
  } 

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash, 
    }) 

  return (
    <form onSubmit={submit}>
      <input name="tokenId" placeholder="69420" required />
      <button 
        disabled={isPending} 
        type="submit"
      >
        {isPending ? 'Confirming...' : 'Mint'} 
      </button>
      {hash && <div>Transaction Hash: {hash}</div>}
      {isConfirming && <div>Waiting for confirmation...</div>} 
      {isConfirmed && <div>Transaction confirmed.</div>} 
      {error && (
        <div>Error: {(error as BaseError).shortMessage || error.message}</div>
      )}
    </form>
  )
}
8. Wire it up!
Finally, we can wire up our Mint NFT component to our application's entrypoint.


app.tsx

mint-nft.tsx

abi.ts

config.ts

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, useAccount } from 'wagmi'
import { config } from './config'
import { MintNft } from './mint-nft'

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}> 
        <MintNft />
      </QueryClientProvider> 
    </WagmiProvider>
  )
}


FAQ / Troubleshooting
Collection of frequently asked questions with ideas on how to troubleshoot and resolve them.

Type inference doesn't work
Check that you set up TypeScript correctly with "strict": true in your tsconfig.json (TypeScript docs)
Check that you const-asserted any ABIs or Typed Data you are using.
Restart your language server or IDE, and check for type errors in your code.
My wallet doesn't work
If you run into issues with a specific wallet, try another before opening up an issue. There are many different wallets and it's likely that the issue is with the wallet itself, not Wagmi. For example, if you are using Wallet X and sending a transaction doesn't work, try Wallet Y and see if it works.

BigInt Serialization
Using native BigInt with JSON.stringify will raise a TypeError as BigInt values are not serializable. There are two techniques to mitigate this:

Lossless serialization
Lossless serialization means that BigInt will be converted to a format that can be deserialized later (e.g. 69420n → "#bigint.69420"). The trade-off is that these values are not human-readable and are not intended to be displayed to the user.

Lossless serialization can be achieved with wagmi's serialize and deserialize utilities.


import { serialize, deserialize } from 'wagmi'

const serialized = serialize({ value: 69420n })
// '{"value":"#bigint.69420"}'

const deserialized = deserialize(serialized)
// { value: 69420n }
Lossy serialization
Lossy serialization means that the BigInt will be converted to a normal display string (e.g. 69420n → '69420'). The trade-off is that you will not be able to deserialize the BigInt with JSON.parse as it can not distinguish between a normal string and a BigInt.

This method can be achieved by modifying JSON.stringify to include a BigInt replacer:


const replacer = (key, value) =>
  typeof value === 'bigint' ? value.toString() : value

JSON.stringify({ value: 69420n }, replacer)
// '{"value":"69420"}'
How do I support the project?
Wagmi is an open source software project and free to use. If you enjoy using Wagmi or would like to support Wagmi development, you can:

Become a sponsor on GitHub
Send us crypto
Mainnet: 0x4557B18E779944BFE9d78A672452331C186a9f48
Multichain: 0xd2135CfB216b74109775236E36d4b433F1DF507B
Become a supporter on Drips
If you use Wagmi at work, consider asking your company to sponsor Wagmi. This may not be easy, but business sponsorships typically make a much larger impact on the sustainability of OSS projects than individual donations, so you will help us much more if you succeed.

Is Wagmi production ready?
Yes. Wagmi is very stable and is used in production by thousands of organizations, like Stripe, Shopify, Coinbase, Uniswap, ENS, Optimism.

Is Wagmi strict with semver?
Yes, Wagmi is very strict with semantic versioning and we will never introduce breaking changes to the runtime API in a minor version bump.

For exported types, we try our best to not introduce breaking changes in non-major versions, however, TypeScript doesn't follow semver and often introduces breaking changes in minor releases that can cause Wagmi type issues. See the TypeScript docs for more information.

How can I contribute to Wagmi?
The Wagmi team accepts all sorts of contributions. Check out the Contributing guide to get started. If you are interested in adding a new connector to Wagmi, check out the Creating Connectors guide.

Anything else you want to know?
Please create a new GitHub Discussion thread. You're also free to suggest changes to this or any other page on the site using the "Suggest changes to this page" button at the bottom of the page.

How does Wagmi work?
Until there's a more in-depth write-up about Wagmi internals, here is the gist:

Wagmi is essentially a wrapper around Viem and TanStack Query that adds connector and multichain support.
Connectors allow Wagmi and Ethereum accounts to communicate with each other.
The Wagmi Config manages connections established between Wagmi and Connectors, as well as some global state. Connections come with one or more addresses and a chain ID.
If there are connections, the Wagmi Config listens for connection changes and updates the chainId based on the "current" connection. (The Wagmi Config can have many connections established at once, but only one connection can be the "current" connection. Usually this is the connection from the last connector that is connected, but can change based on event emitted from other connectors or through the useSwitchAccount hook and switchAccount action.)
If there are no connections, the Wagmi Config defaults the global state chainId to the first chain it was created with or last established connection.
The global chainId can be changed directly using the useSwitchChain hook and switchChain action. This works when there are no connections as well as for most connectors (not all connectors support chain switching).
Wagmi uses the global chainId (from the "current" connection or global state) to internally create Viem Client's, which are used by hooks and actions.
Hooks are constructed by TanStack Query options helpers, exported by the '@wagmi/core/query' entrypoint, and some additional code to wire up type parameters, hook into React Context, etc.
There are three types of hooks: query hooks, mutation hooks, and config hooks. Query hooks, like useCall, generally read blockchain state and mutation hooks, like useSendTransaction, usually change state through sending transactions via the "current" connection. Config hooks are for getting data from and managing the Wagmi Config instance, e.g. useChainId and useSwitchAccount. Query and mutation hooks usually have corresponding Viem actions.


createConfig
Creates new Config object.

Import

import { createConfig } from 'wagmi'
Usage

import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http('https://mainnet.example.com'),
    [sepolia.id]: http('https://sepolia.example.com'),
  },
})
Integrating a Viem Client

Instead of using transports, it's possible to provide a function that returns a Viem Client via the client property for more fine-grained control over Wagmi's internal Client creation.


import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { createClient } from 'viem'

const config = createConfig({
  chains: [mainnet, sepolia],
  client({ chain }) {
    return createClient({ chain, transport: http() })
  },
})
Parameters

import { type CreateConfigParameters } from 'wagmi'
chains
readonly [Chain, ...Chain[]]

Chains used by the Config.
See Chains for more details about built-in chains and the Chain type.

import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

const config = createConfig({
  chains: [mainnet, sepolia], 
  transports: {
    [mainnet.id]: http('https://mainnet.example.com'),
    [sepolia.id]: http('https://sepolia.example.com'),
  },
})
connectors
CreateConnectorFn[] | undefined

Connectors used by the Config.


import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [injected()], 
  transports: {
    [mainnet.id]: http('https://mainnet.example.com'),
    [sepolia.id]: http('https://sepolia.example.com'),
  },
})
multiInjectedProviderDiscovery
boolean | undefined

Enables discovery of injected providers via EIP-6963 using the mipd library and converting to injected connectors.
Defaults to true.

import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

const config = createConfig({
  chains: [mainnet, sepolia],
  multiInjectedProviderDiscovery: false, 
  transports: {
    [mainnet.id]: http('https://mainnet.example.com'),
    [sepolia.id]: http('https://sepolia.example.com'),
  },
})
ssr
boolean | undefined

Flag to indicate if the config is being used in a server-side rendering environment. Defaults to false.


import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

const config = createConfig({
  chains: [mainnet, sepolia],
  ssr: true, 
  transports: {
    [mainnet.id]: http('https://mainnet.example.com'),
    [sepolia.id]: http('https://sepolia.example.com'),
  },
})
storage
Storage | null | undefined

Storage used by the config. Persists Config's State between sessions.
Defaults to createStorage({ storage: typeof window !== 'undefined' && window.localStorage ? window.localStorage : noopStorage }).

import { createConfig, createStorage, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

const config = createConfig({
  chains: [mainnet, sepolia],
  storage: createStorage({ storage: window.localStorage }), 
  transports: {
    [mainnet.id]: http('https://mainnet.example.com'),
    [sepolia.id]: http('https://sepolia.example.com'),
  },
})
syncConnectedChain
boolean | undefined

Keep the State['chainId'] in sync with the current connection.
Defaults to true.

import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

const config = createConfig({
  chains: [mainnet, sepolia],
  syncConnectedChain: false, 
  transports: {
    [mainnet.id]: http('https://mainnet.example.com'),
    [sepolia.id]: http('https://sepolia.example.com'),
  },
})
batch
{ multicall?: boolean | { batchSize?: number | undefined; wait?: number | undefined } | undefined } | { [_ in chains[number]["id"]]?: { multicall?: boolean | { batchSize?: number | undefined; wait?: number | undefined } | undefined } | undefined } | undefined

Batch settings. See Viem docs for more info.
Defaults to { multicall: true }.

import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

const config = createConfig({
  chains: [mainnet, sepolia],
  batch: { multicall: true }, 
  transports: {
    [mainnet.id]: http('https://mainnet.example.com'),
    [sepolia.id]: http('https://sepolia.example.com'),
  },
})
cacheTime
number | { [_ in chains[number]['id']]?: number | undefined } | undefined

Frequency in milliseconds for polling enabled features. See Viem docs for more info.
Defaults to pollingInterval or 4_000.

import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

const config = createConfig({
  chains: [mainnet, sepolia],
  cacheTime: 4_000, 
  transports: {
    [mainnet.id]: http('https://mainnet.example.com'),
    [sepolia.id]: http('https://sepolia.example.com'),
  },
})
pollingInterval
number | { [_ in chains[number]['id']]?: number | undefined } | undefined

Frequency in milliseconds for polling enabled features. See Viem docs for more info.
Defaults to 4_000.

import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

const config = createConfig({
  chains: [mainnet, sepolia],
  pollingInterval: 4_000, 
  transports: {
    [mainnet.id]: http('https://mainnet.example.com'),
    [sepolia.id]: http('https://sepolia.example.com'),
  },
})
transports
Record<chains[number]['id'], Transport>

Mapping of chain IDs to Transports. This mapping is used internally when creating chain-aware Viem Client objects. See the Transport docs for more info.


import { createConfig, fallback, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

const config = createConfig({
  chains: [mainnet, sepolia],
  transports: { 
    [mainnet.id]: fallback([ 
      http('https://...'), 
      http('https://...'), 
    ]), 
    [sepolia.id]: http('https://...'), 
  }, 
})
client
(parameters: { chain: chains[number] }) => Client<Transport, chains[number]>

Function for creating new Viem Client to be used internally. Exposes more control over the internal Client creation logic versus using the transports property.


import { createClient, http } from 'viem'
import { createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

const config = createConfig({
  chains: [mainnet, sepolia],
  client({ chain }) { 
    return createClient({ chain, transport: http('https://...') }) 
  }, 
})
WARNING

When using this option, you likely want to pass parameters.chain straight through to createClient to ensure the Viem Client is in sync with any active connections.

Return Type

import { type Config } from 'wagmi'
Config
Object responsible for managing Wagmi state and internals.


import { type Config } from 'wagmi'
chains
readonly [Chain, ...Chain[]]

chains passed to createConfig.

connectors
readonly Connector[]

Connectors set up from passing connectors and multiInjectedProviderDiscovery to createConfig.

state
State<chains>

The Config object's internal state. See State for more info.

storage
Storage | null

storage passed to createConfig.

getClient
(parameters?: { chainId?: chainId | chains[number]['id'] | undefined }): Client<transports[chainId], Extract<chains[number], { id: chainId }>>

Creates new Viem Client object.


index.ts

config.ts

import { config } from './config'

const client = config.getClient({ chainId: 1 })
setState
(value: State<chains> | ((state: State<chains>) => State<chains>)) => void

Updates the Config object's internal state. See State for more info.


index.ts

config.ts

import { mainnet } from 'wagmi/chains'
import { config } from './config'

config.setState((x) => ({
  ...x,
  chainId: x.current ? x.chainId : mainnet.id,
}))
WARNING

Exercise caution when using this method. It is intended for internal and advanced use-cases only. Manually setting state can cause unexpected behavior.

subscribe
(selector: (state: State<chains>) => state, listener: (selectedState: state, previousSelectedState: state) => void, options?: { emitImmediately?: boolean | undefined; equalityFn?: ((a: state, b: state) => boolean) | undefined } | undefined) => (() => void)

Listens for state changes matching the selector function. Returns a function that can be called to unsubscribe the listener.


index.ts

config.ts

import { config } from './config'

const unsubscribe = config.subscribe(
  (state) => state.chainId,
  (chainId) => console.log(`Chain ID changed to ${chainId}`),
)
unsubscribe()
State

import { type State } from 'wagmi'
chainId
chains[number]['id']

Current chain ID. When syncConnectedChain is true, chainId is kept in sync with the current connection. Defaults to first chain in chains.

connections
Map<string, Connection>

Mapping of unique connector identifier to Connection object.

current
string | undefined

Unique identifier of the current connection.

status
'connected' | 'connecting' | 'disconnected' | 'reconnecting'

Current connection status.

'connecting' attempting to establish connection.
'reconnecting' attempting to re-establish connection to one or more connectors.
'connected' at least one connector is connected.
'disconnected' no connection to any connector.
Connection

import { type Connection } from 'wagmi'
accounts
readonly [Address, ...Address[]]

Array of addresses associated with the connection.

chainId
number

Chain ID associated with the connection.

connector
Connector

Connector associated with the connection.

createStorage
Creates new Storage object.

Import

import { createStorage } from 'wagmi'
Usage

import { createStorage } from 'wagmi'

const storage = createStorage({ storage: localStorage })
Parameters

import { type CreateStorageParameters } from 'wagmi'
deserialize
(<T>(value: string) => T) | undefined

Function to deserialize data from storage.
Defaults to deserialize.

import { createStorage, deserialize } from 'wagmi'

const storage = createStorage({
  deserialize, 
  storage: localStorage,
})
WARNING

If you use a custom deserialize function, make sure it can handle bigint and Map values.

key
string | undefined

Key prefix to use when persisting data.
Defaults to 'wagmi'.

import { createStorage } from 'wagmi'

const storage = createStorage({
  key: 'my-app', 
  storage: localStorage,
})
serialize
(<T>(value: T) => string) | undefined

Function to serialize data for storage.
Defaults to serialize.

import { createStorage, serialize } from 'wagmi'

const storage = createStorage({
  serialize, 
  storage: localStorage,
})
WARNING

If you use a custom serialize function, make sure it can handle bigint and Map values.

storage
{ getItem(key: string): string | null | undefined | Promise<string | null | undefined>; setItem(key: string, value: string): void | Promise<void>; removeItem(key: string): void | Promise<void>; }

Storage interface to use for persisting data.
Defaults to localStorage.
Supports synchronous and asynchronous storage methods.

import { createStorage } from 'wagmi'
// Using IndexedDB via https://github.com/jakearchibald/idb-keyval
import { del, get, set } from 'idb-keyval'

const storage = createStorage({
  storage: { 
    async getItem(name) { 
      return get(name)
    }, 
    async setItem(name, value) { 
      await set(name, value) 
    }, 
    async removeItem(name) { 
      await del(name) 
    }, 
  }, 
})
Return Type

import { type Storage } from 'wagmi'
Storage
Object responsible for persisting Wagmi State and other data.


import { type Storage } from 'wagmi'
getItem
getItem(key: string, defaultValue?: value | null | undefined): value | null | Promise<value | null>


import { createStorage } from 'wagmi'

const storage = createStorage({ storage: localStorage })
const recentConnectorId = storage.getItem('recentConnectorId')
setItem
setItem(key: string, value: any): void | Promise<void>


import { createStorage } from 'wagmi'

const storage = createStorage({ storage: localStorage })
storage.setItem('recentConnectorId', 'foo')
removeItem
removeItem(key: string): void | Promise<void>


import { createStorage } from 'wagmi'

const storage = createStorage({ storage: localStorage })
storage.removeItem('recentConnectorId')

Chains
Viem Chain objects. More info at the Viem docs.

Import
Import via the 'wagmi/chains' entrypoint (proxies all chains from 'viem/chains').


import { mainnet } from 'wagmi/chains'
Available Chains
Chain definitions as of viem@2.23.5. For viem@latest, visit the Viem repo.

-
ETH
Create Chain
Import the Chain type from Viem and create a new object that is asserted as const and satisfies the type. You can also use the defineChain function from Viem.


as const satisfies Chain

defineChain

import { type Chain } from 'viem'

export const mainnet = {} as const satisfies Chain
Type '{}' does not satisfy the expected type 'Chain'. Type '{}' is missing the following properties from type 'Chain': id, name, nativeCurrency, rpcUrls
Now, add the missing required properties to the object until the error goes away.


as const satisfies Chain

defineChain

import { type Chain } from 'viem'

export const mainnet = {
  id: 1,
  name: 'Ethereum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://eth.merkle.io'] },
  },
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://etherscan.io' },
  },
  contracts: {
    ensRegistry: {
      address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    },
    ensUniversalResolver: {
      address: '0xE4Acdd618deED4e6d2f03b9bf62dc6118FC9A4da',
      blockCreated: 16773775,
    },
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 14353601,
    },
  },
} as const satisfies Chain
The more properties you add, the better the chain will be to use with Wagmi. Most of these attributes exist within the ethereum-lists/chains repository.

id: The chain ID for the network. This can be found by typing the network name into ChainList. Example: "Ethereum Mainnet" has a Chain ID of 1.
name: Human-readable name for the chain. Example: "Ethereum Mainnet"
nativeCurrency: The native currency of the chain. Found from ethereum-lists/chains.
rpcUrls: At least one public, credible RPC URL. Found from ethereum-lists/chains.
blockExplorers: A set of block explorers for the chain. Found from ethereum-lists/chains.
contracts: A set of deployed contracts for the chain. If you are deploying one of the following contracts yourself, make sure it is verified.
multicall3 is optional, but it's address is most likely 0xca11bde05977b3631167028862be2a173976ca11 – you can find the deployed block number on the block explorer. Check out mds1/multicall for more info.
ensRegistry is optional – not all Chains have a ENS Registry. See ENS Deployments for more info.
ensUniversalResolver is optional – not all Chains have a ENS Universal Resolver.
sourceId: Source Chain ID (e.g. the L1 chain).
testnet: Whether or not the chain is a testnet.

Connectors
Connectors for popular wallet providers and protocols.

Import
Import via the 'wagmi/connectors' entrypoint.


import { injected } from 'wagmi/connectors'
Available Connectors
coinbaseWallet
injected
metaMask
mock
safe
walletConnect

Transports
createConfig can be instantiated with a set of Transports for each chain. A Transport is the intermediary layer that is responsible for executing outgoing JSON-RPC requests to the RPC Provider (e.g. Alchemy, Infura, etc).

Import

import { http } from 'wagmi'
Built-In Transports
Available via the 'wagmi' entrypoint.

custom (EIP-1193)
fallback
http
unstable_connector
webSocket

WagmiProvider
React Context Provider for Wagmi.

Import

import { WagmiProvider } from 'wagmi'
Usage

app.tsx

config.ts

import { WagmiProvider } from 'wagmi'
import { config } from './config' 

function App() {
  return (
    <WagmiProvider config={config}> 
      {/** ... */}
    </WagmiProvider>
  )
}
Parameters

import { type WagmiProviderProps } from 'wagmi'
config
Config object to inject with context.


app.tsx

config.ts

import { WagmiProvider } from 'wagmi'
import { config } from './config' 

function App() {
  return (
    <WagmiProvider
      config={config}
    >
      {/** ... */}
    </WagmiProvider>
  )
}
initialState
State | undefined

Initial state to hydrate into the Wagmi Config. Useful for SSR.

app.tsx

config.ts

import { WagmiProvider } from 'wagmi'
import { config } from './config' 

function App() {
  return (
    <WagmiProvider
      config={config}
      initialState={/* ... /*}
    >
      {/** ... */}
    </WagmiProvider>
  )
}
reconnectOnMount
boolean | undefined

Whether or not to reconnect previously connected connectors on mount.
Defaults to true.

app.tsx

config.ts

import { WagmiProvider } from 'wagmi'
import { config } from './config' 

function App() {
  return (
    <WagmiProvider
      config={config}
      reconnectOnMount={false}
    >
      {/** ... */}
    </WagmiProvider>
  )
}
Context

import { type WagmiContext } from 'wagmi'


HOOKS