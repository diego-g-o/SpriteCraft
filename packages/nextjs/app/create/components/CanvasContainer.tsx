"use client";

import { useEffect, useState } from "react";
import React from "react";
import PixelCanvas, { ColorPalette } from "./Canvas";
import { usePixels } from "./PixelContext";
import { useTestMode } from "./TestModeContext";
import { useAddress } from "~~/components/Header";

// CHECKEAR. ES MAS FACIL HACER UN USECONTEXT?

// Fixed grayscale palette
const GRAYSCALE_PALETTE: ColorPalette = {
  colors: [
    "#000000", // Black
    "#262626", // Very dark gray
    "#4D4D4D", // Dark gray
    "#FFFFFF", // White
  ],
  name: "Grayscale",
  id: "grayscale",
};

// Fixed canvas resolution
const FIXED_RESOLUTION = 512;

interface CanvasRendererProps {
  walletAddress: string;
}

const CanvasRenderer: React.FC<CanvasRendererProps> = ({ walletAddress }) => {
  const [canvasSize, setCanvasSize] = useState(480);
  const [pixelSize, setPixelSize] = useState(30);
  const [subgridSize, setSubgridSize] = useState(8); // Default to 8x8 subgrid
  const { pixels, handlePixelUpdate } = usePixels();

  const calculateCanvasSize = () => {
    const container = document.querySelector(".canvas-container");
    if (!container) return 480; //CHECKEAR!

    const width = container.clientWidth;
    const height = container.clientHeight;
    const minDimension = Math.min(width, height) - 48; // Subtract padding

    return minDimension;
  };

  const calculatePixelSize = (containerSize: number) => {
    // Each pixel's size is determined by the container size divided by the grid size
    return containerSize / 16; // Using 16x16 grid
  };

  useEffect(() => {
    const handleResize = () => {
      const newCanvasSize = calculateCanvasSize();
      setCanvasSize(newCanvasSize);
      setPixelSize(calculatePixelSize(newCanvasSize));
    };

    // Initial calculation
    handleResize();

    // Add resize listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col space-y-4">
      <div className="canvas-container w-full md:w-2/3 bg-gray-100 p-6 rounded-lg shadow-md flex flex-col items-center justify-center mx-auto">
        <PixelCanvas
          pixelSize={pixelSize}
          canvasSize={canvasSize}
          glowIntensity={5}
          colorPalette={GRAYSCALE_PALETTE}
          walletAddress={walletAddress}
          resolution={FIXED_RESOLUTION}
          subgridSize={subgridSize}
        />
      </div>

      <div className="flex items-center justify-center space-x-4">
        <label htmlFor="subgrid-size" className="text-sm font-medium">
          Subgrid Size:
        </label>
        <select
          id="subgrid-size"
          value={subgridSize}
          onChange={e => setSubgridSize(Number(e.target.value))}
          className="px-2 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="4">4x4</option>
          <option value="8">8x8</option>
          <option value="16">16x16</option>
          <option value="32">32x32</option>
        </select>
      </div>

      <div className="hidden">
        <p>
          Resolution: {FIXED_RESOLUTION}×{FIXED_RESOLUTION}
        </p>
        <p>
          Canvas Size: {canvasSize}x{canvasSize}
        </p>
        <p>Pixel Size: {pixelSize.toFixed(1)}px</p>
        <p>
          Subgrid Size: {subgridSize}x{subgridSize}
        </p>
      </div>
    </div>
  );
};

const CanvasContainer = () => {
  // Import useAddress hook
  const { address: walletAddress } = useAddress();

  // Use the TestMode context instead of local state
  const { isTestModeActive, showPerlinNoise } = useTestMode();

  return (
    <div className="container mx-auto px-4 py-8">
      <CanvasRenderer walletAddress={walletAddress || ""} />
    </div>
  );
};

export default CanvasContainer;
