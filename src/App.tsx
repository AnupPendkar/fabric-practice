/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from "react";
import { Canvas, FabricImage, Rect } from "fabric";
import "./App.css";
import Controller from "./overlay-controller/applications/Controller";
import { ControllerViewType } from "./overlay-controller/typings/platform-typings";
import { SegmentParserClass } from "./parsing-handlers/segment-parse";
import { isPropEmpty } from "./utils/CommonUtils";

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [controlSetting, setControlSetting] = useState();

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
        hasBorders: true,
        selectable: true, // Changed to true
        evented: true,
        lockMovementX: true,
        lockMovementY: true,
        lockScalingFlip: true,
        lockSkewingX: true,
        lockSkewingY: true,
        rotatingPointOffset: 0,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,

        originX: "left",
        originY: "top",
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

    const clonedRes = {
      stitched_image_path: "http://172.16.120.69:7005/media/1734436738/stitched/LEFT.jpg",
      heatmap_image_path: null,
      major_heatmap_image_path: null,
      stitched_image_predictions: [
        {
          cx: 0.22648610020646417,
          cy: 0.8285495865853938,
          duplicate: 0.0,
          confidence: 0.71,
          class_id: 6,
          height: 0.2404272338049231,
          width: 0.3382383575086084,
        },
        {
          cx: 0.4427638254321708,
          cy: 0.6165965525349324,
          duplicate: 0.0,
          confidence: 0.54,
          class_id: 4,
          height: 0.2564932850280468,
          width: 0.3556117665668817,
        },
      ],
      container_level: 1,
      container_position: {
        x: 1,
        y: 1,
        z: 1,
      },
      side: 4,
      segment_info: [
        {
          segment_index: 1,
          segment_start: 0.0,
          segment_end: 499.0,
          damage_info: {
            WARP: 0,
            MINOR_SCRATCH: 0,
            RUST: 0,
            CUT_HOLE: 0,
            WELD: 1,
            PILLAR_DAMAGE: 0,
            PATCH: 0,
          },
        },
        {
          segment_index: 2,
          segment_start: 500.0,
          segment_end: 999.0,
          damage_info: {
            WARP: 1,
            MINOR_SCRATCH: 0,
            RUST: 0,
            CUT_HOLE: 0,
            WELD: 1,
            PILLAR_DAMAGE: 0,
            PATCH: 0,
          },
        },
        {
          segment_index: 3,
          segment_start: 1000.0,
          segment_end: 1499.0,
          damage_info: {
            WARP: 1,
            MINOR_SCRATCH: 1,
            RUST: 0,
            CUT_HOLE: 0,
            WELD: 0,
            PILLAR_DAMAGE: 0,
            PATCH: 0,
          },
        },
        {
          segment_index: 4,
          segment_start: 1500.0,
          segment_end: 1999.0,
          damage_info: {
            WARP: 0,
            MINOR_SCRATCH: 0,
            RUST: 0,
            CUT_HOLE: 0,
            WELD: 0,
            PILLAR_DAMAGE: 0,
            PATCH: 0,
          },
        },
      ],
      meta_data: [
        {
          container_no: "NOFU1006135",
          container_damage_info: {
            minor_damages: 6,
            major_damages: 17,
          },
          side_damage_info: {
            WARP: 2,
            MINOR_SCRATCH: 1,
            RUST: 0,
            CUT_HOLE: 0,
            WELD: 2,
            PILLAR_DAMAGE: 0,
            PATCH: 0,
          },
        },
      ],
    };
    const damageConfig = [
      {
        damage_name: "MINOR_WARP",
        damage_id: 0,
        is_configured: false,
        is_notified: false,
        type_of_damage: 0,
        color_code: "#ffdb58",
      },
      {
        damage_name: "WARP",
        damage_id: 1,
        is_configured: true,
        is_notified: true,
        type_of_damage: 1,
        color_code: "#adbbad",
      },
      {
        damage_name: "MINOR_SCRATCH",
        damage_id: 2,
        is_configured: true,
        is_notified: false,
        type_of_damage: 0,
        color_code: "#151515",
      },
      {
        damage_name: "MINOR_RUST",
        damage_id: 3,
        is_configured: false,
        is_notified: false,
        type_of_damage: 0,
        color_code: "#ff7f7f",
      },
      {
        damage_name: "RUST",
        damage_id: 4,
        is_configured: true,
        is_notified: true,
        type_of_damage: 1,
        color_code: "#9c27b0",
      },
      {
        damage_name: "CUT_HOLE",
        damage_id: 5,
        is_configured: true,
        is_notified: false,
        type_of_damage: 1,
        color_code: "#483248",
      },
      {
        damage_name: "WELD",
        damage_id: 6,
        is_configured: true,
        is_notified: false,
        type_of_damage: 1,
        color_code: "#40e0d0",
      },
      {
        damage_name: "PILLAR_DAMAGE",
        damage_id: 10,
        is_configured: true,
        is_notified: false,
        type_of_damage: 1,
        color_code: "#ff7d29",
      },
      {
        damage_name: "PATCH",
        damage_id: 11,
        is_configured: true,
        is_notified: false,
        type_of_damage: 0,
        color_code: "#373a40",
      },
    ];

    const data = new SegmentParserClass().generateSegments(
      clonedRes as any,
      damageConfig
    );

    console.log(data);
    setControlSetting(data as any);

    return () => {
      canvas?.dispose();
    };
  }, []);

  return (
    <>
      {/* <canvas
        ref={canvasRef}
        id="canvas"
        style={{ border: "1px solid black" }}
      /> */}
      <div style={{ height: "80vh" }}>
        {!isPropEmpty(controlSetting) && (
          <Controller
            controllerSettings={controlSetting}
            canPan={false}
            canZoom={false}
            heatMapShown={true}
            isHoverAllowed={false}
            objectTitleVisibilityCodes={{
              text: "Minor",
              visibilityCodes: [2, 3, 1],
            }}
            hoverTextVisibilityCode={[9, 11, 12]}
            currentBackgroundPath={null}
          />
        )}
      </div>
    </>
  );
}

export default App;
