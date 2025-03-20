"use client";

import CanvasContainer from "./components/CanvasContainer";
import { PixelProvider } from "./components/PixelContext";
import { TestMode } from "./components/TestMode";
import { TestModeProvider } from "./components/TestModeContext";
import { useAccount } from "wagmi";

export default function CreatePage() {
  // Get wallet address directly from wagmi
  const { address, isConnected } = useAccount();

  return (
    <TestModeProvider>
      <PixelProvider>
        <div className="flex flex-col items-center min-h-screen p-8">
          {/* Title */}
          <h1 className="text-6xl font-bold mb-8">Create</h1>

          {/* Two boxes layout */}
          <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl">
            {/* Canvas Box - now takes 2/3 of width */}
            <CanvasContainer />

            {/* Information Box - now takes 1/3 of width */}
            <div className="w-full md:w-1/3 bg-gray-100 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Information</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Wallet Details</h3>
                  <p className="text-sm text-gray-600">
                    {address ? (
                      <span className="font-mono">{`${address.substring(0, 6)}...${address.substring(address.length - 4)}`}</span>
                    ) : (
                      "Connect your wallet to view details"
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Art Details</h3>
                  <p className="text-sm text-gray-600">Artpiece #0000</p>
                  <p className="text-sm text-gray-600">Resolution: 512×512</p>
                </div>
                <div className="space-y-2">
                  <button
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    disabled={!isConnected}
                  >
                    Update my available pixels
                  </button>
                  <button
                    className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                    disabled={!isConnected}
                  >
                    Pre-mint NFT
                  </button>
                  <button
                    className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
                    disabled={!isConnected}
                  >
                    Mint NFT
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Test Mode Indicator */}
          <TestMode />
        </div>
      </PixelProvider>
    </TestModeProvider>
  );
}
