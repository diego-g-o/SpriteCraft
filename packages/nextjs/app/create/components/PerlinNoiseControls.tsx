import React from "react";

interface PerlinNoiseControlsProps {
  perlinFrequency: number;
  perlinContrast: number;
  perlinScale: number;
  perlinOctaves: number;
  perlinPersistence: number;
  handleFrequencyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleContrastChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleScaleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleOctavesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePersistenceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PerlinNoiseControls: React.FC<PerlinNoiseControlsProps> = ({
  perlinFrequency,
  perlinContrast,
  perlinScale,
  perlinOctaves,
  perlinPersistence,
  handleFrequencyChange,
  handleContrastChange,
  handleScaleChange,
  handleOctavesChange,
  handlePersistenceChange,
}) => {
  return (
    <div className="space-y-2 p-3 border border-gray-200 rounded-md bg-gray-50">
      <h3 className="text-sm font-semibold">Perlin Noise Controls</h3>

      <div className="flex items-center space-x-2">
        <label htmlFor="frequency" className="text-sm font-medium w-28">
          Frequency: {perlinFrequency.toFixed(1)}
        </label>
        <input
          id="frequency"
          type="range"
          min="0.5"
          max="5"
          step="0.1"
          value={perlinFrequency}
          onChange={handleFrequencyChange}
          className="flex-grow"
          aria-label="Adjust perlin noise frequency"
        />
      </div>

      <div className="flex items-center space-x-2">
        <label htmlFor="contrast" className="text-sm font-medium w-28">
          Contrast: {perlinContrast.toFixed(1)}
        </label>
        <input
          id="contrast"
          type="range"
          min="0.5"
          max="5"
          step="0.1"
          value={perlinContrast}
          onChange={handleContrastChange}
          className="flex-grow"
          aria-label="Adjust perlin noise contrast"
        />
      </div>

      <div className="flex items-center space-x-2">
        <label htmlFor="scale" className="text-sm font-medium w-28">
          Scale: {perlinScale.toFixed(3)}
        </label>
        <input
          id="scale"
          type="range"
          min="0.01"
          max="0.2"
          step="0.01"
          value={perlinScale}
          onChange={handleScaleChange}
          className="flex-grow"
          aria-label="Adjust perlin noise scale"
        />
      </div>

      <div className="flex items-center space-x-2">
        <label htmlFor="octaves" className="text-sm font-medium w-28">
          Octaves: {perlinOctaves}
        </label>
        <input
          id="octaves"
          type="range"
          min="1"
          max="8"
          step="1"
          value={perlinOctaves}
          onChange={handleOctavesChange}
          className="flex-grow"
          aria-label="Adjust perlin noise octaves"
        />
      </div>

      <div className="flex items-center space-x-2">
        <label htmlFor="persistence" className="text-sm font-medium w-28">
          Persistence: {perlinPersistence.toFixed(2)}
        </label>
        <input
          id="persistence"
          type="range"
          min="0.1"
          max="1.0"
          step="0.05"
          value={perlinPersistence}
          onChange={handlePersistenceChange}
          className="flex-grow"
          aria-label="Adjust perlin noise persistence"
        />
      </div>
    </div>
  );
};

export default PerlinNoiseControls;
