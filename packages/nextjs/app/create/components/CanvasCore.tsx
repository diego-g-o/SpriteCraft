import { RefObject, useEffect } from "react";
import { ColorPalette } from "./Canvas";
import { usePerlinNoise } from "./PerlinNoise";
import { useTestMode } from "./TestModeContext";

interface CanvasCoreProps {
  canvasRef: RefObject<HTMLCanvasElement>;
  pixels: number[][];
  pixelSize: number;
  canvasSize: number;
  devicePixelRatio: number;
  glowIntensity: number;
  colorPalette: ColorPalette;
  resolution: number;
  subgridSize: number;
  walletAddress: string;
  perlinFrequency: number;
  perlinContrast: number;
  perlinScale: number;
  perlinOctaves: number;
  perlinPersistence: number;
}

const GRID_SIZE = 16;

const CanvasCore = ({
  canvasRef,
  pixels,
  pixelSize,
  canvasSize,
  devicePixelRatio,
  glowIntensity,
  colorPalette,
  resolution,
  subgridSize,
  walletAddress,
  perlinFrequency,
  perlinContrast,
  perlinScale,
  perlinOctaves,
  perlinPersistence,
}: CanvasCoreProps) => {
  // Get the Perlin noise function
  const { getNoise } = usePerlinNoise(walletAddress);

  // Get test mode context
  const { isTestModeActive, showPerlinNoise } = useTestMode();

  // Draw horizontal grid lines
  const drawHorizontalGridLines = (ctx: CanvasRenderingContext2D, gridSize: number, pixelSize: number) => {
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1 / devicePixelRatio; // Adjust line width based on device pixel ratio

    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * pixelSize);
      ctx.lineTo(gridSize * pixelSize, i * pixelSize);
      ctx.stroke();
    }
  };

  // Draw vertical grid lines
  const drawVerticalGridLines = (ctx: CanvasRenderingContext2D, gridSize: number, pixelSize: number) => {
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1 / devicePixelRatio; // Adjust line width based on device pixel ratio

    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * pixelSize, 0);
      ctx.lineTo(i * pixelSize, gridSize * pixelSize);
      ctx.stroke();
    }
  };

  // Updated drawPixels function to log a color map
  const drawPixels = (ctx: CanvasRenderingContext2D, pixels: number[][], gridSize: number, pixelSize: number) => {
    // Apply glow effect if intensity is greater than 0
    if (glowIntensity > 0) {
      ctx.shadowBlur = glowIntensity;
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    } else {
      ctx.shadowBlur = 0;
    }

    const subpixelSize = pixelSize / subgridSize;
    const borderWidth = 0.5;

    // Create a 16x16 array to store color values for visualization
    const colorMap: string[][] = Array(gridSize)
      .fill(0)
      .map(() => Array(gridSize).fill(""));

    // Sequential rendering: row by row, left to right
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        // First fill the entire block with white (for borders)
        ctx.fillStyle = "white";
        ctx.fillRect(x * pixelSize + 1, y * pixelSize + 1, pixelSize - 1, pixelSize - 1);

        if (isTestModeActive && showPerlinNoise) {
          // When in Perlin noise mode, show noise in all pixels regardless of the pixel array
          for (let sy = 0; sy < subgridSize; sy++) {
            for (let sx = 0; sx < subgridSize; sx++) {
              // Calculate the position of this subpixel in the canvas
              const subpixelX = x * pixelSize + sx * subpixelSize + 1;
              const subpixelY = y * pixelSize + sy * subpixelSize + 1;

              // Debug: Log inputs to noise function for a sample pixel
              const debugPixel = x === 0 && y === 0 && sx === 0 && sy === 0;

              // Track intermediate values for debugging
              let debugValues: {
                inputs?: {
                  x: number;
                  y: number;
                  scale: number;
                  frequency: number;
                  contrast: number;
                };
                rawNoiseValue?: number;
                grayscaleValue?: number;
                subpixelColor?: string;
              } = {};

              if (debugPixel) {
                debugValues = {
                  inputs: {
                    x: x * subgridSize + sx,
                    y: y * subgridSize + sy,
                    scale: 0.05,
                    frequency: perlinFrequency,
                    contrast: perlinContrast,
                  },
                };
                console.log("Perlin noise inputs:", debugValues.inputs);
              }

              // Use Perlin noise with enhanced parameters
              const noiseValue = getNoise(
                x * subgridSize + sx,
                y * subgridSize + sy,
                perlinScale,
                perlinFrequency,
                perlinContrast,
                perlinOctaves,
                perlinPersistence,
              );

              if (debugPixel) {
                debugValues.rawNoiseValue = noiseValue;
                console.log("Raw noise value:", noiseValue);
              }

              // Convert noise value (0-1) to grayscale color
              const grayscaleValue = Math.floor(noiseValue * 255);
              const subpixelColor = `rgb(${grayscaleValue}, ${grayscaleValue}, ${grayscaleValue})`;

              if (debugPixel) {
                debugValues.grayscaleValue = grayscaleValue;
                debugValues.subpixelColor = subpixelColor;
                console.log("Final pixel values:", debugValues);
              }

              // Store the color of the first subpixel in each grid cell
              if (sx === 0 && sy === 0) {
                colorMap[y][x] = subpixelColor;
              }

              ctx.fillStyle = subpixelColor;

              // Draw the subpixel with a white border
              ctx.fillRect(
                subpixelX + borderWidth,
                subpixelY + borderWidth,
                subpixelSize - borderWidth * 2,
                subpixelSize - borderWidth * 2,
              );
            }
          }
        } else {
          // Normal rendering mode - use the pixel array
          const colorIndex = pixels[y][x];

          if (colorIndex === 0) {
            // Background/empty color - already filled with white above
          } else {
            // Get color from palette, fallback to black if index is invalid
            const blockColor = colorPalette.colors[colorIndex - 1] || "black";

            // Render the subgrid within this block using the configurable size
            for (let sy = 0; sy < subgridSize; sy++) {
              for (let sx = 0; sx < subgridSize; sx++) {
                // Calculate the position of this subpixel in the canvas
                const subpixelX = x * pixelSize + sx * subpixelSize + 1;
                const subpixelY = y * pixelSize + sy * subpixelSize + 1;

                ctx.fillStyle = blockColor;

                // Draw the subpixel with a white border
                ctx.fillRect(
                  subpixelX + borderWidth,
                  subpixelY + borderWidth,
                  subpixelSize - borderWidth * 2,
                  subpixelSize - borderWidth * 2,
                );
              }
            }
          }
        }
      }
    }

    // Log the color map when in Perlin noise mode
    if (isTestModeActive && showPerlinNoise) {
      console.log("Perlin Noise Color Map (16x16):");

      // Format the color map for better visualization in console
      const formattedMap = colorMap.map(row =>
        row.map(color => {
          // Extract the grayscale value from the rgb string
          const match = color.match(/rgb\((\d+),\s*\d+,\s*\d+\)/);
          return match ? match[1].padStart(3, " ") : "???";
        }),
      );

      console.table(formattedMap);

      // Also log the raw color values
      console.log("Raw RGB Values:");
      console.table(colorMap);

      // Calculate and log statistics
      const allValues = colorMap.flat().map(color => {
        const match = color.match(/rgb\((\d+),\s*\d+,\s*\d+\)/);
        return match ? parseInt(match[1], 10) : 0;
      });

      const min = Math.min(...allValues);
      const max = Math.max(...allValues);

      console.log("Color Value Statistics:", {
        min,
        max,
        range: max - min,
        average: allValues.reduce((sum, val) => sum + val, 0) / allValues.length,
      });
    }
  };

  // Update the useEffect to include all dependencies
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions with device pixel ratio for sharper rendering
    const scaledWidth = canvasSize * devicePixelRatio;
    const scaledHeight = canvasSize * devicePixelRatio;

    canvas.width = scaledWidth;
    canvas.height = scaledHeight;

    // Set display size (css pixels)
    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Scale all drawing operations by the device pixel ratio
    ctx.scale(devicePixelRatio, devicePixelRatio);

    // Clear canvas
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw grid using our new functions
    drawHorizontalGridLines(ctx, GRID_SIZE, pixelSize);
    drawVerticalGridLines(ctx, GRID_SIZE, pixelSize);

    // Draw pixels with optional glow
    drawPixels(ctx, pixels, GRID_SIZE, pixelSize);
  }, [
    canvasRef,
    pixels,
    pixelSize,
    canvasSize,
    devicePixelRatio,
    glowIntensity,
    colorPalette,
    resolution,
    subgridSize,
    isTestModeActive,
    showPerlinNoise,
    perlinFrequency,
    perlinContrast,
    perlinScale,
    perlinOctaves,
    perlinPersistence,
  ]);

  return null; // This is a logic-only component, it doesn't render anything
};

export default CanvasCore;
