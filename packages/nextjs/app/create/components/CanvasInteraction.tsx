"use client";

import { useEffect, useRef, useState } from "react";

interface CanvasInteractionProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  pixelSize: number;
  pixels: number[][];
  onPixelUpdate: (row: number, col: number, colorIndex: number) => void;
  gridSize: number;
  setColoredPixelCount: React.Dispatch<React.SetStateAction<number>>;
  currentColorIndex: number;
}

const CanvasInteraction = ({
  canvasRef,
  pixelSize,
  pixels,
  onPixelUpdate,
  gridSize,
  setColoredPixelCount,
  currentColorIndex,
}: CanvasInteractionProps) => {
  const lastClickTimeRef = useRef<number>(0);
  const isDrawingRef = useRef<boolean>(false);
  const lastPixelRef = useRef<{ x: number; y: number } | null>(null);

  const getGridPosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: -1, y: -1 };

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / pixelSize);
    const y = Math.floor((e.clientY - rect.top) / pixelSize);

    // Ensure coordinates are within bounds
    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
      return { x, y };
    }
    return { x: -1, y: -1 };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Ignore right clicks
    if (e.button === 2) {
      return;
    }

    const { x, y } = getGridPosition(e);
    if (x === -1 || y === -1) return;

    const now = Date.now();
    const isDoubleClick = now - lastClickTimeRef.current < 300;
    lastClickTimeRef.current = now;

    // Double click: clear pixel (set to 0)
    if (isDoubleClick && pixels[y][x] !== 0) {
      onPixelUpdate(y, x, 0);
      setColoredPixelCount(prev => prev - 1);
    }
    // Single click: set to current color
    else if (!isDoubleClick && pixels[y][x] !== currentColorIndex) {
      // If changing from empty to colored, increment count
      if (pixels[y][x] === 0) {
        setColoredPixelCount(prev => prev + 1);
      }
      // If changing from one color to another, count stays the same
      onPixelUpdate(y, x, currentColorIndex);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Only start drawing with left mouse button
    if (e.button !== 0) return;

    isDrawingRef.current = true;
    const { x, y } = getGridPosition(e);
    if (x === -1 || y === -1) return;

    lastPixelRef.current = { x, y };

    // Paint the pixel if it's not already the current color
    if (pixels[y][x] !== currentColorIndex) {
      // If changing from empty to colored, increment count
      if (pixels[y][x] === 0) {
        setColoredPixelCount(prev => prev + 1);
      }
      onPixelUpdate(y, x, currentColorIndex);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;

    const { x, y } = getGridPosition(e);
    if (x === -1 || y === -1) return;

    // Don't update if we're still on the same pixel
    if (lastPixelRef.current && lastPixelRef.current.x === x && lastPixelRef.current.y === y) return;

    lastPixelRef.current = { x, y };

    // Paint the pixel if it's not already the current color
    if (pixels[y][x] !== currentColorIndex) {
      // If changing from empty to colored, increment count
      if (pixels[y][x] === 0) {
        setColoredPixelCount(prev => prev + 1);
      }
      onPixelUpdate(y, x, currentColorIndex);
    }
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
    lastPixelRef.current = null;
  };

  const handleMouseLeave = () => {
    isDrawingRef.current = false;
    lastPixelRef.current = null;
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Prevent the context menu from appearing on right-click
    e.preventDefault();
  };

  return {
    handleCanvasClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleContextMenu,
  };
};

export default CanvasInteraction;
