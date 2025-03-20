"use client";

import { useEffect, useRef, useState } from "react";
import CanvasCore from "./CanvasCore";
import CanvasInteraction from "./CanvasInteraction";
import { usePerlinNoise } from "./PerlinNoise";
import PerlinNoiseControls from "./PerlinNoiseControls";
import { usePixels } from "./PixelContext";
import ReferenceImageUploader from "./ReferenceImageUploader";
import { useTestMode } from "./TestModeContext";

// New interface for color palette
export interface ColorPalette {
  colors: string[];
  name: string;
  id: string;
}

interface PixelCanvasProps {
  pixelSize: number;
  canvasSize: number;
  glowIntensity?: number; // Optional glow intensity parameter
  colorPalette: ColorPalette; // New required prop for color palette
  walletAddress: string; // New required prop for wallet address
  resolution: number; // Fixed resolution (512x512)
  subgridSize?: number; // Optional subgrid size, defaults to 32
}

const GRID_SIZE = 16;

const PixelCanvas = ({
  pixelSize,
  canvasSize,
  glowIntensity = 5, // Default glow intensity to 5
  colorPalette,
  walletAddress,
  resolution,
  subgridSize = 8, // Default to 8x8 subgrid (smaller than 32x32)
}: PixelCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [coloredPixelCount, setColoredPixelCount] = useState(0);
  const [currentColorIndex, setCurrentColorIndex] = useState(1); // Default to first color (index 1)
  const [devicePixelRatio, setDevicePixelRatio] = useState(1);
  const { pixels, handlePixelUpdate } = usePixels();

  // Get test mode context
  const { isTestModeActive, showPerlinNoise } = useTestMode();

  // Add state for Perlin noise parameters with higher default values
  const [perlinFrequency, setPerlinFrequency] = useState(3); // Higher frequency for more detail
  const [perlinContrast, setPerlinContrast] = useState(3); // Higher contrast for more visible patterns
  const [perlinScale, setPerlinScale] = useState(0.05); // Default scale
  const [perlinOctaves, setPerlinOctaves] = useState(3); // Default octaves
  const [perlinPersistence, setPerlinPersistence] = useState(0.5); // Default persistence

  // Get device pixel ratio on component mount
  useEffect(() => {
    setDevicePixelRatio(window.devicePixelRatio || 1);
  }, []);

  // Count colored pixels on component mount or when pixels change
  useEffect(() => {
    let count = 0;
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (pixels[y][x] !== 0) {
          // Count any non-zero (colored) pixel
          count++;
        }
      }
    }
    setColoredPixelCount(count);
  }, [pixels]);

  // Add debug logging for test mode state
  useEffect(() => {
    console.log("Test Mode State:", { isTestModeActive, showPerlinNoise });
  }, [isTestModeActive, showPerlinNoise]);

  // Get canvas interaction handlers
  const { handleCanvasClick, handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave, handleContextMenu } =
    CanvasInteraction({
      canvasRef,
      pixelSize,
      pixels,
      onPixelUpdate: handlePixelUpdate,
      gridSize: GRID_SIZE,
      setColoredPixelCount,
      currentColorIndex,
    });

  const handleClearCanvas = () => {
    // Implement clear canvas logic
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        handlePixelUpdate(y, x, 0);
      }
    }
    setColoredPixelCount(0);
  };

  // Add UI controls for Perlin noise parameters
  const handleFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPerlinFrequency(parseFloat(e.target.value));
  };

  const handleContrastChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPerlinContrast(parseFloat(e.target.value));
  };

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPerlinScale(parseFloat(e.target.value));
  };

  const handleOctavesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPerlinOctaves(parseInt(e.target.value));
  };

  const handlePersistenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPerlinPersistence(parseFloat(e.target.value));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        {/* Canvas container with relative positioning */}
        <div className="relative">
          {/* Reference image will be rendered by ReferenceImageUploader component */}
          <ReferenceImageUploader canvasSize={canvasSize} />

          {/* Canvas with transparent background */}
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onContextMenu={handleContextMenu}
            className="border border-gray-300 cursor-pointer relative z-10"
            aria-label="Pixel canvas"
            tabIndex={0}
          />

          {/* Canvas Core component for drawing logic */}
          <CanvasCore
            canvasRef={canvasRef}
            pixels={pixels}
            pixelSize={pixelSize}
            canvasSize={canvasSize}
            devicePixelRatio={devicePixelRatio}
            glowIntensity={glowIntensity}
            colorPalette={colorPalette}
            resolution={resolution}
            subgridSize={subgridSize}
            walletAddress={walletAddress}
            perlinFrequency={perlinFrequency}
            perlinContrast={perlinContrast}
            perlinScale={perlinScale}
            perlinOctaves={perlinOctaves}
            perlinPersistence={perlinPersistence}
          />
        </div>

        <div className="text-sm text-gray-600 mt-2">
          <p>
            Colored pixels: {coloredPixelCount}/{GRID_SIZE * GRID_SIZE}
          </p>
          <p className="text-xs truncate">Creator: {walletAddress}</p>
          <p className="text-xs">
            Resolution: {resolution}×{resolution}
          </p>
        </div>
      </div>

      {isTestModeActive && showPerlinNoise && (
        <PerlinNoiseControls
          perlinFrequency={perlinFrequency}
          perlinContrast={perlinContrast}
          perlinScale={perlinScale}
          perlinOctaves={perlinOctaves}
          perlinPersistence={perlinPersistence}
          handleFrequencyChange={handleFrequencyChange}
          handleContrastChange={handleContrastChange}
          handleScaleChange={handleScaleChange}
          handleOctavesChange={handleOctavesChange}
          handlePersistenceChange={handlePersistenceChange}
        />
      )}

      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={handleClearCanvas}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          aria-label="Clear canvas"
        >
          Clear Canvas
        </button>
      </div>
    </div>
  );
};

export default PixelCanvas;
