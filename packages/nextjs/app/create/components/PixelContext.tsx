"use client";

import { ReactNode, createContext, useContext, useState } from "react";

// Define the context type
interface PixelContextType {
  pixels: number[][];
  setPixels: (pixels: number[][]) => void;
  handlePixelUpdate: (row: number, col: number, colorIndex: number) => void;
}

// Create the context with a default value
const PixelContext = createContext<PixelContextType | undefined>(undefined);

// Provider component
export const PixelProvider = ({ children }: { children: ReactNode }) => {
  // Initialize a 16x16 grid with all pixels set to white (0)
  const [pixels, setPixels] = useState(
    Array(16)
      .fill(0)
      .map(() => Array(16).fill(0)),
  );

  // Function to update a specific pixel in the array
  const handlePixelUpdate = (row: number, col: number, colorIndex: number) => {
    setPixels(prevPixels => {
      const newPixels = [...prevPixels];
      newPixels[row] = [...newPixels[row]];
      newPixels[row][col] = colorIndex;
      return newPixels;
    });
  };

  return <PixelContext.Provider value={{ pixels, setPixels, handlePixelUpdate }}>{children}</PixelContext.Provider>;
};

// Custom hook to use the pixel context
export const usePixels = () => {
  const context = useContext(PixelContext);
  if (context === undefined) {
    throw new Error("usePixels must be used within a PixelProvider");
  }
  return context;
};
