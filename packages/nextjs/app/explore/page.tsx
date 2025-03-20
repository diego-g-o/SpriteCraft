"use client";

import React from "react";
import P5Canvas from "./components/P5Canvas";

const ExplorePage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center p-8">
      {/* Title at the top */}
      <div className="w-full max-w-4xl mb-4 text-center">
        <h1 className="text-6xl font-bold">Create new art</h1>
      </div>

      {/* Main content container */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8">
        {/* Art Container */}
        <div className="w-full md:w-[512px] h-[512px] bg-gray-100 shadow-md">
          <P5Canvas />
        </div>

        {/* Information Container */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold mb-4">Piece #0xABCD</h1>
          <div className="w-full space-y-4">
            {/* Resolution Selector */}
            <div className="flex flex-col gap-2">
              <label htmlFor="resolution" className="text-sm font-medium text-gray-700">
                Resolution
              </label>
              <select
                id="resolution"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                defaultValue="1x1"
              >
                <option value="1x1">1x1</option>
                <option value="2x2">2x2</option>
                <option value="4x4">4x4</option>
                <option value="8x8">8x8</option>
              </select>
            </div>

            {/* Seed Input */}
            <div className="flex flex-col gap-2">
              <label htmlFor="seed" className="text-sm font-medium text-gray-700">
                Seed
              </label>
              <input
                id="seed"
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter seed"
              />
            </div>

            {/* Climate Type Selector */}
            <div className="flex flex-col gap-2">
              <label htmlFor="climate" className="text-sm font-medium text-gray-700">
                Climate Type
              </label>
              <select
                id="climate"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                defaultValue="dayAndNight"
              >
                <option value="dayAndNight">Day and Night</option>
                <option value="seasons">Seasons</option>
                <option value="heavyChanges">Heavy Changes</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
