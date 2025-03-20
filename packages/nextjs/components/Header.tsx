"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { hardhat } from "viem/chains";
import { useAccount } from "wagmi";
import { AddressInput, FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

// Create a context to share the address with other components
export const AddressContext = createContext<{
  address: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
  isWalletConnected: boolean;
  setIsWalletConnected: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  address: "",
  setAddress: () => {},
  isWalletConnected: false,
  setIsWalletConnected: () => {},
});

// Custom hook to use the address context
export const useAddress = () => useContext(AddressContext);

/**
 * Site header
 */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const [address, setAddress] = useState<string>("");
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);

  // Get the connected account from wagmi
  const { address: connectedAddress, isConnected } = useAccount();

  // Update the address and connection status when the wallet connection changes
  useEffect(() => {
    if (isConnected && connectedAddress) {
      setAddress(connectedAddress);
      setIsWalletConnected(true);
    } else {
      setIsWalletConnected(false);
    }
  }, [connectedAddress, isConnected]);

  // Handle address change only when wallet is not connected
  const handleAddressChange = (newAddress: string) => {
    if (!isWalletConnected) {
      setAddress(newAddress);
    }
  };

  return (
    <AddressContext.Provider value={{ address, setAddress, isWalletConnected, setIsWalletConnected }}>
      <div className="sticky lg:static top-0 navbar bg-base-100 min-h-0 flex-shrink-0 justify-between z-20 shadow-md shadow-secondary px-0 sm:px-2">
        <div className="navbar-start w-auto flex-grow">
          <div className="w-full max-w-xl text-left">
            <AddressInput
              value={address}
              onChange={handleAddressChange}
              placeholder="Paste address (0x...)"
              aria-label="Enter wallet address"
              disabled={isWalletConnected}
            />
          </div>
        </div>
        <div className="navbar-end flex-none">
          <RainbowKitCustomConnectButton />
          {isLocalNetwork && <FaucetButton />}
        </div>
      </div>
    </AddressContext.Provider>
  );
};
