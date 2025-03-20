"use client";

import React from "react";
import { useTestMode } from "./TestModeContext";

export const TestMode: React.FC = () => {
  const { isTestModeActive, showPerlinNoise, setIsTestModeActive, setShowPerlinNoise } = useTestMode();

  if (!isTestModeActive) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 p-4 rounded-lg shadow-md border border-yellow-300">
      <h3 className="text-lg font-bold text-yellow-800 mb-2">Test Mode Active</h3>
      <div className="flex flex-col space-y-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showPerlinNoise}
            onChange={e => setShowPerlinNoise(e.target.checked)}
            className="form-checkbox"
            aria-label="Toggle Perlin Noise"
          />
          <span className="text-sm text-yellow-800">Show Perlin Noise</span>
        </label>
        <button
          onClick={() => setIsTestModeActive(false)}
          className="bg-yellow-500 text-white px-2 py-1 rounded text-sm hover:bg-yellow-600 transition-colors"
          aria-label="Disable Test Mode"
        >
          Disable Test Mode
        </button>
      </div>
    </div>
  );
};
