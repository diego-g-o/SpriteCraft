"use client";

import React, { useEffect, useRef } from "react";
import p5 from "p5";

const P5Canvas = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const sketch = (p: p5) => {
      p.setup = () => {
        const canvas = p.createCanvas(512, 512);
        canvas.parent(canvasRef.current!);
        p.noLoop();
        drawGrid(p);
      };

      const drawGrid = (p: p5) => {
        const gridSize = 8;
        const cellSize = p.width / gridSize;

        p.background(255);
        p.stroke(200);
        p.strokeWeight(1);

        for (let i = 0; i < gridSize; i++) {
          for (let j = 0; j < gridSize; j++) {
            p.rect(i * cellSize, j * cellSize, cellSize, cellSize);
          }
        }
      };
    };

    const p5Instance = new p5(sketch);

    return () => {
      p5Instance.remove();
    };
  }, []);

  return <div ref={canvasRef} aria-label="Art canvas" tabIndex={0} role="img" className="w-full h-full" />;
};

export default P5Canvas;
