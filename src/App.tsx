/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from "react";
import { Canvas, FabricImage, Rect } from "fabric";
import "./App.css";

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);

  function initCanvas() {
    if (!canvasRef.current) return;
    canvas?.dispose();

    const mainCanvas = new Canvas(canvasRef.current, {
      backgroundColor: "#1A1A1A",
      width: 1200,
      height: 600,
    });

    setCanvas(mainCanvas);
    return mainCanvas;
  }

  function placeImgInCanvas():
    | Promise<{ imgW: number; imgH: number }>
    | undefined {
    return new Promise((resolve, reject) => {
      if (!canvas) {
        reject(new Error("Canvas not initialized"));
        return;
      }

      FabricImage.fromURL("container.jpg").then((img) => {
        if (!img) {
          reject(new Error("Failed to load image"));
          return;
        }

        const scaledWidth = img.getScaledWidth();
        const scaledHeight = img.getScaledHeight();
        console.log(scaledHeight, scaledWidth);

        const imgWidth = 800;
        const imgHeight = 220;

        img.scaleToWidth(imgWidth);
        img.selectable = false;

        canvas.add(img);
        resolve({ imgW: imgWidth, imgH: imgHeight });
      });
    });
  }

  function drawSegments(imgW: number, imgH: number, segCt: number) {
    if (!canvas) {
      return;
    }

    const segmentWidth = imgW / segCt;
    const segmentHeight = imgH;

    for (let col = 0; col < segCt; col++) {
      const segment = new Rect({
        left: col * segmentWidth,
        top: 0,
        width: segmentWidth,
        height: segmentHeight,
        fill: "transparent",
        stroke: "red",
        strokeWidth: 2,
        selectable: true, // Changed to true
        evented: true,
        lockMovementX: true,
        lockMovementY: true,
      });

      segment.on("mouseover", (e) => {
        segment.set({
          fill: "black",
          opacity: 0.3,
        });
        canvas.renderAll();
      });
      segment.on("mouseout", (e) => {
        segment.set({
          fill: "transparent",
          opacity: 1,
        });
        canvas.renderAll();
      });

      canvas.add(segment);
    }
  }

  useEffect(() => {
    if (canvas) {
      placeImgInCanvas()
        ?.then(({ imgW, imgH }) => {
          drawSegments(imgW, imgH, 6);
        })
        .catch(console.error);
    }
  }, [canvas]);

  useEffect(() => {
    const newCanvas = initCanvas();

    return () => {
      canvas?.dispose();
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        id="canvas"
        style={{ border: "1px solid black" }}
      />
    </>
  );
}

export default App;
