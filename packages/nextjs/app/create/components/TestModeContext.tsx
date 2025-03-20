"use client";

import { ReactNode, createContext, useContext, useState } from "react";

interface TestModeContextType {
  isTestModeActive: boolean;
  showPerlinNoise: boolean;
  setIsTestModeActive: (value: boolean) => void;
  setShowPerlinNoise: (value: boolean) => void;
}

const TestModeContext = createContext<TestModeContextType | undefined>(undefined);

export const TestModeProvider = ({ children }: { children: ReactNode }) => {
  const [isTestModeActive, setIsTestModeActive] = useState(true);
  const [showPerlinNoise, setShowPerlinNoise] = useState(false);

  return (
    <TestModeContext.Provider
      value={{
        isTestModeActive,
        showPerlinNoise,
        setIsTestModeActive,
        setShowPerlinNoise,
      }}
    >
      {children}
    </TestModeContext.Provider>
  );
};

export const useTestMode = () => {
  const context = useContext(TestModeContext);
  if (context === undefined) {
    throw new Error("useTestMode must be used within a TestModeProvider");
  }
  return context;
};
