"use client";

import { useCallback, useMemo, useState } from "react";

/**
 * Interface for Perlin noise configuration
 */
export interface PerlinNoiseConfig {
  scale?: number;
  frequency?: number;
  contrast?: number;
  octaves?: number;
  persistence?: number;
  lacunarity?: number;
  debug?: boolean;
}

/**
 * Interface for Perlin noise debug information
 */
export interface PerlinNoiseDebugInfo {
  seed: number;
  coordinates: { x: number; y: number; scaledX: number; scaledY: number };
  octaveContributions: { octave: number; value: number; amplitude: number }[];
  rawValue: number;
  normalizedValue: number;
  finalValue: number;
  generationTimeMs: number;
  statistics?: {
    min: number;
    max: number;
    average: number;
    range: number;
  };
}

/**
 * Generates a numeric seed from a wallet address
 * @param address Ethereum wallet address
 * @returns Numeric seed value
 */
const generateSeedFromAddress = (address: string): number => {
  try {
    // Handle empty or invalid addresses
    if (!address || typeof address !== "string") {
      console.warn("Invalid wallet address provided for seed generation, using fallback seed");
      return 12345678; // Fallback seed
    }

    // Remove '0x' prefix if present
    const cleanAddress = address.startsWith("0x") ? address.slice(2) : address;

    // Take the first 8 characters and convert to a number
    const seedHex = cleanAddress.substring(0, 8);

    // Convert hex to decimal with error handling
    const seed = parseInt(seedHex, 16);
    return isNaN(seed) ? 12345678 : seed; // Use fallback if parsing fails
  } catch (error) {
    console.error("Error generating seed from address:", error);
    return 12345678; // Fallback seed
  }
};

/**
 * Custom hook that provides a Perlin noise function based on a wallet address
 * @param walletAddress Ethereum wallet address used as seed
 * @returns A function that generates Perlin noise values and debug utilities
 */
export const usePerlinNoise = (walletAddress: string) => {
  // Generate a seed from the wallet address
  const seed = useMemo(() => generateSeedFromAddress(walletAddress), [walletAddress]);

  // State for statistics tracking
  const [noiseStatistics, setNoiseStatistics] = useState<{
    min: number;
    max: number;
    sum: number;
    count: number;
  }>({
    min: 1,
    max: 0,
    sum: 0,
    count: 0,
  });

  // Create permutation table based on the seed
  const permTable = useMemo(() => {
    try {
      const perm = Array(512).fill(0);
      const p = Array(256)
        .fill(0)
        .map((_, i) => i);

      // Fisher-Yates shuffle with seed
      let rng = seed;
      for (let i = 255; i > 0; i--) {
        // Simple LCG random number generator
        rng = (rng * 1664525 + 1013904223) % 4294967296;
        const j = Math.floor((rng / 4294967296) * (i + 1));
        [p[i], p[j]] = [p[j], p[i]]; // Swap
      }

      // Extend and duplicate the permutation table
      for (let i = 0; i < 256; i++) {
        perm[i] = perm[i + 256] = p[i];
      }

      return perm;
    } catch (error) {
      console.error("Error creating permutation table:", error);
      // Return a simple fallback permutation table
      return Array(512)
        .fill(0)
        .map((_, i) => i % 256);
    }
  }, [seed]);

  // Fade function for Perlin noise (smoothing)
  const fade = useCallback((t: number): number => {
    // Bounds check
    if (t < 0) return 0;
    if (t > 1) return 1;
    return t * t * t * (t * (t * 6 - 15) + 10);
  }, []);

  // Linear interpolation with bounds checking
  const lerp = useCallback((a: number, b: number, t: number): number => {
    // Clamp t to [0, 1]
    const clampedT = Math.max(0, Math.min(1, t));
    return a + clampedT * (b - a);
  }, []);

  // Gradient function with error handling
  const grad = useCallback((hash: number, x: number, y: number, z: number): number => {
    try {
      const h = hash & 15;
      const u = h < 8 ? x : y;
      const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
      return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    } catch (error) {
      console.error("Error in gradient function:", error);
      return 0; // Fallback value
    }
  }, []);

  // Core Perlin noise function (3D) with error handling
  const noise = useCallback(
    (x: number, y: number, z: number = 0): number => {
      try {
        // Find unit cube that contains the point
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        // Find relative x, y, z of point in cube
        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        // Compute fade curves for each of x, y, z
        const u = fade(x);
        const v = fade(y);
        const w = fade(z);

        // Hash coordinates of the 8 cube corners
        const A = permTable[X] + Y;
        const AA = permTable[A % 512] + Z; // Ensure index is in bounds
        const AB = permTable[(A + 1) % 512] + Z;
        const B = permTable[(X + 1) % 512] + Y;
        const BA = permTable[B % 512] + Z;
        const BB = permTable[(B + 1) % 512] + Z;

        // Add blended results from 8 corners of cube
        const result = lerp(
          lerp(
            lerp(grad(permTable[AA % 512], x, y, z), grad(permTable[BA % 512], x - 1, y, z), u),
            lerp(grad(permTable[AB % 512], x, y - 1, z), grad(permTable[BB % 512], x - 1, y - 1, z), u),
            v,
          ),
          lerp(
            lerp(grad(permTable[(AA + 1) % 512], x, y, z - 1), grad(permTable[(BA + 1) % 512], x - 1, y, z - 1), u),
            lerp(
              grad(permTable[(AB + 1) % 512], x, y - 1, z - 1),
              grad(permTable[(BB + 1) % 512], x - 1, y - 1, z - 1),
              u,
            ),
            v,
          ),
          w,
        );

        // Return result normalized to [-1, 1]
        return result;
      } catch (error) {
        console.error("Error calculating noise:", error);
        return 0; // Fallback value
      }
    },
    [fade, lerp, grad, permTable],
  );

  // Fractal Brownian Motion (fBm) implementation with error handling and debugging
  const fbm = useCallback(
    (
      x: number,
      y: number,
      octaves: number,
      persistence: number,
      lacunarity: number,
      debug: boolean = false,
    ): { value: number; octaveContributions?: { octave: number; value: number; amplitude: number }[] } => {
      try {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;
        const octaveContributions: { octave: number; value: number; amplitude: number }[] = [];

        // Clamp octaves to reasonable range
        const clampedOctaves = Math.max(1, Math.min(8, octaves));

        for (let i = 0; i < clampedOctaves; i++) {
          const noiseValue = noise(x * frequency, y * frequency) * amplitude;
          total += noiseValue;
          maxValue += amplitude;

          if (debug) {
            octaveContributions.push({
              octave: i,
              value: noiseValue,
              amplitude,
            });
          }

          amplitude *= persistence;
          frequency *= lacunarity;
        }

        // Normalize the result
        const normalizedValue = maxValue > 0 ? total / maxValue : 0;

        return {
          value: normalizedValue,
          octaveContributions: debug ? octaveContributions : undefined,
        };
      } catch (error) {
        console.error("Error calculating fBm:", error);
        return { value: 0 }; // Fallback value
      }
    },
    [noise],
  );

  // Function to reset statistics
  const resetStatistics = useCallback(() => {
    setNoiseStatistics({
      min: 1,
      max: 0,
      sum: 0,
      count: 0,
    });
  }, []);

  // Main noise function with all configurable parameters and debugging
  const getNoiseValue = useCallback(
    (
      x: number,
      y: number,
      scale: number = 0.1,
      frequency: number = 3.0,
      contrast: number = 3.0,
      octaves: number = 3,
      persistence: number = 0.5,
      lacunarity: number = 2.0,
      updateStats: boolean = true,
      debug: boolean = false,
    ): number => {
      try {
        const startTime = debug ? performance.now() : 0;

        // Apply scaling and frequency
        const scaledX = x * scale * frequency;
        const scaledY = y * scale * frequency;

        // Debug information object
        let debugInfo: PerlinNoiseDebugInfo | undefined;

        if (debug) {
          debugInfo = {
            seed,
            coordinates: { x, y, scaledX, scaledY },
            octaveContributions: [],
            rawValue: 0,
            normalizedValue: 0,
            finalValue: 0,
            generationTimeMs: 0,
          };
        }

        // Generate raw noise value using fBm
        const fbmResult = fbm(scaledX, scaledY, octaves, persistence, lacunarity, debug);
        let value = fbmResult.value;

        if (debug && debugInfo && fbmResult.octaveContributions) {
          debugInfo.octaveContributions = fbmResult.octaveContributions;
          debugInfo.rawValue = value;
        }

        // Normalize from [-1, 1] to [0, 1]
        value = (value + 1) * 0.5;

        if (debug && debugInfo) {
          debugInfo.normalizedValue = value;
        }

        // Apply contrast adjustment
        value = 0.5 + (value - 0.5) * contrast;

        // Clamp the result to [0, 1]
        value = Math.max(0, Math.min(1, value));

        if (debug && debugInfo) {
          debugInfo.finalValue = value;
          debugInfo.generationTimeMs = performance.now() - startTime;

          // Log debug information
          console.log("Perlin Noise Debug Info:", debugInfo);
        }

        // Update statistics if requested
        if (updateStats) {
          setNoiseStatistics(prev => {
            return {
              min: Math.min(prev.min, value),
              max: Math.max(prev.max, value),
              sum: prev.sum + value,
              count: prev.count + 1,
            };
          });
        }

        return value;
      } catch (error) {
        console.error("Error generating noise value:", error);
        return 0.5; // Fallback to mid-gray
      }
    },
    [fbm, seed],
  );

  // Function to generate a noise field for visualization and statistics
  const generateNoiseField = useCallback(
    (
      width: number,
      height: number,
      config: PerlinNoiseConfig = {},
    ): { field: number[][]; statistics: { min: number; max: number; average: number; range: number } } => {
      const { scale = 0.1, frequency = 3.0, contrast = 3.0, octaves = 3, persistence = 0.5, lacunarity = 2.0 } = config;

      const field: number[][] = [];
      let min = 1;
      let max = 0;
      let sum = 0;
      let count = 0;

      for (let y = 0; y < height; y++) {
        const row: number[] = [];
        for (let x = 0; x < width; x++) {
          const noiseValue = getNoiseValue(x, y, scale, frequency, contrast, octaves, persistence, lacunarity, false);

          row.push(noiseValue);

          // Update statistics
          min = Math.min(min, noiseValue);
          max = Math.max(max, noiseValue);
          sum += noiseValue;
          count++;
        }
        field.push(row);
      }

      return {
        field,
        statistics: {
          min,
          max,
          average: count > 0 ? sum / count : 0,
          range: max - min,
        },
      };
    },
    [getNoiseValue],
  );

  // Return the main noise function and utilities
  return {
    // Main noise generation function
    getNoise: getNoiseValue,

    // Utility functions
    getSeed: () => seed,
    resetStatistics,
    getStatistics: () => ({
      min: noiseStatistics.min,
      max: noiseStatistics.max,
      average: noiseStatistics.count > 0 ? noiseStatistics.sum / noiseStatistics.count : 0,
      range: noiseStatistics.max - noiseStatistics.min,
    }),
    generateNoiseField,
  };
};

/**
 * Component for Perlin noise visualization and controls
 */
export const PerlinNoiseVisualizer: React.FC<{
  walletAddress: string;
  width?: number;
  height?: number;
  onConfigChange?: (config: PerlinNoiseConfig) => void;
}> = ({ walletAddress, width = 256, height = 256, onConfigChange }) => {
  // Perlin noise configuration state
  const [config, setConfig] = useState<PerlinNoiseConfig>({
    scale: 0.1,
    frequency: 3.0,
    contrast: 3.0,
    octaves: 3,
    persistence: 0.5,
    lacunarity: 2.0,
  });

  // Visualization mode
  const [visualizationMode, setVisualizationMode] = useState<"grayscale" | "color" | "raw">("grayscale");

  // Get Perlin noise utilities
  const { getNoise, getSeed, getStatistics, generateNoiseField } = usePerlinNoise(walletAddress);

  // Generate noise field for visualization
  const { field, statistics } = useMemo(
    () => generateNoiseField(width, height, config),
    [generateNoiseField, width, height, config],
  );

  // Handle configuration changes
  const handleConfigChange = useCallback(
    (key: keyof PerlinNoiseConfig, value: number) => {
      const newConfig = { ...config, [key]: value };
      setConfig(newConfig);
      if (onConfigChange) {
        onConfigChange(newConfig);
      }
    },
    [config, onConfigChange],
  );

  // Color mapping function
  const getColor = useCallback(
    (value: number): string => {
      if (visualizationMode === "grayscale") {
        const v = Math.floor(value * 255);
        return `rgb(${v}, ${v}, ${v})`;
      } else if (visualizationMode === "color") {
        // Simple rainbow color mapping
        const h = value * 360;
        return `hsl(${h}, 100%, 50%)`;
      } else {
        // Raw mode - use a gradient from blue (low) to red (high)
        return `rgb(${Math.floor(value * 255)}, 0, ${Math.floor((1 - value) * 255)})`;
      }
    },
    [visualizationMode],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        {/* Canvas for noise visualization */}
        <div
          className="border border-gray-300"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            display: "grid",
            gridTemplateColumns: `repeat(${width}, 1px)`,
          }}
        >
          {field.map((row, y) =>
            row.map((value, x) => (
              <div
                key={`${x}-${y}`}
                style={{
                  width: "1px",
                  height: "1px",
                  backgroundColor: getColor(value),
                }}
                title={`Value: ${value.toFixed(3)}`}
              />
            )),
          )}
        </div>

        {/* Seed and statistics display */}
        <div className="text-sm text-gray-600 mt-2">
          <p>
            Seed: {getSeed()} (from wallet: {walletAddress.substring(0, 6)}...
            {walletAddress.substring(walletAddress.length - 4)})
          </p>
          <p>
            Statistics: Min: {statistics.min.toFixed(3)}, Max: {statistics.max.toFixed(3)}, Avg:{" "}
            {statistics.average.toFixed(3)}, Range: {statistics.range.toFixed(3)}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-2">
        {/* Visualization mode selector */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Visualization:</label>
          <select
            value={visualizationMode}
            onChange={e => setVisualizationMode(e.target.value as any)}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="grayscale">Grayscale</option>
            <option value="color">Color Map</option>
            <option value="raw">Raw Values</option>
          </select>
        </div>

        {/* Frequency slider */}
        <div className="flex items-center space-x-2">
          <label htmlFor="frequency" className="text-sm font-medium w-24">
            Frequency: {config.frequency?.toFixed(1)}
          </label>
          <input
            id="frequency"
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={config.frequency}
            onChange={e => handleConfigChange("frequency", parseFloat(e.target.value))}
            className="flex-grow"
          />
        </div>

        {/* Contrast slider */}
        <div className="flex items-center space-x-2">
          <label htmlFor="contrast" className="text-sm font-medium w-24">
            Contrast: {config.contrast?.toFixed(1)}
          </label>
          <input
            id="contrast"
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={config.contrast}
            onChange={e => handleConfigChange("contrast", parseFloat(e.target.value))}
            className="flex-grow"
          />
        </div>

        {/* Octaves slider */}
        <div className="flex items-center space-x-2">
          <label htmlFor="octaves" className="text-sm font-medium w-24">
            Octaves: {config.octaves}
          </label>
          <input
            id="octaves"
            type="range"
            min="1"
            max="8"
            step="1"
            value={config.octaves}
            onChange={e => handleConfigChange("octaves", parseInt(e.target.value))}
            className="flex-grow"
          />
        </div>

        {/* Persistence slider */}
        <div className="flex items-center space-x-2">
          <label htmlFor="persistence" className="text-sm font-medium w-24">
            Persistence: {config.persistence?.toFixed(2)}
          </label>
          <input
            id="persistence"
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={config.persistence}
            onChange={e => handleConfigChange("persistence", parseFloat(e.target.value))}
            className="flex-grow"
          />
        </div>

        {/* Lacunarity slider */}
        <div className="flex items-center space-x-2">
          <label htmlFor="lacunarity" className="text-sm font-medium w-24">
            Lacunarity: {config.lacunarity?.toFixed(2)}
          </label>
          <input
            id="lacunarity"
            type="range"
            min="1.0"
            max="3.0"
            step="0.1"
            value={config.lacunarity}
            onChange={e => handleConfigChange("lacunarity", parseFloat(e.target.value))}
            className="flex-grow"
          />
        </div>

        {/* Scale slider */}
        <div className="flex items-center space-x-2">
          <label htmlFor="scale" className="text-sm font-medium w-24">
            Scale: {config.scale?.toFixed(3)}
          </label>
          <input
            id="scale"
            type="range"
            min="0.01"
            max="0.5"
            step="0.01"
            value={config.scale}
            onChange={e => handleConfigChange("scale", parseFloat(e.target.value))}
            className="flex-grow"
          />
        </div>
      </div>
    </div>
  );
};
