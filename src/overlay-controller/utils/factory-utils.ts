import { Textbox, FabricImage, Rect, FabricObject } from "fabric";
import { cloneDeep } from "../../utils/CommonUtils";
import {
  CanvasRefType,
  ControllerSettings,
  ControllerViewType,
  CtrBGView,
  ControllerObjectData,
  ObjectDim,
} from "../typings/platform-typings";

export class FactoryUtilsClass {
  static generateAndAdjustObjectsDim(
    canvasRef: CanvasRefType,
    settings: ControllerSettings,
    backImage?: FabricObject
  ): Promise<ControllerSettings> {
    return new Promise(async (resolve, reject) => {
      try {
        const canvasWidth = canvasRef?.width;
        const canvasHeight = canvasRef?.height;
        const settingsCloned = cloneDeep(settings);

        const imageWith = await this.getImageDim(settings.viewImage);
        let scaleX = canvasWidth / imageWith[0];
        let scaleY = canvasHeight / imageWith[1];

        let X = 0;
        let Y = 0;

        if (settings.controllerView === ControllerViewType.OVERLAY_VIEW_MODE) {
          const isFit = true;
          if (isFit) {
            const scaleXToFit = canvasRef.width / imageWith[0];
            const scaleYToFit = canvasRef.height / imageWith[1];
            const minScaleToFit = Math.min(scaleXToFit, scaleYToFit);
            scaleX = minScaleToFit;
            scaleY = minScaleToFit;
            X = (canvasRef.width - scaleX * imageWith[0]) / 2;
            Y = (canvasRef.height - scaleX * imageWith[1]) / 2;
          }
        }

        settingsCloned?.objectsData?.forEach((seg) => {
          const exactW = scaleX * imageWith[0];
          const exactX = seg.x * imageWith[0] * scaleX + X;
          const exactH = imageWith[1] * scaleY;
          const exactY = seg.y * imageWith[1] * scaleY + Y;
          seg.w *= exactW;
          seg.x = exactX;
          seg.h *= exactH;
          seg.y = 0;
        });

        resolve(settingsCloned);
      } catch (error) {
        reject(error);
      }
    });
  }

  static getImageDim(ctrVBGView: CtrBGView): Promise<Array<number>> {
    return new Promise((resolved, rejected) => {
      try {
        FabricImage.fromURL(ctrVBGView.path).then((image) =>
          resolved([image.width, image.height])
        );
      } catch (e) {
        rejected(e);
      }
    });
  }

  static generateRect(rawInput: ControllerObjectData): Rect {
    const rect = new Rect({
      left: rawInput?.x ?? 0,
      top: rawInput?.y ?? 0,
      width: rawInput?.w ?? 0,
      height: rawInput?.h ?? 0,
      strokeWidth: rawInput?.strokeWidth ?? 2,
      stroke: rawInput?.strokeColor,
      fill: rawInput?.fillColor ?? "transparent",
      selectable: true,
      hasBorders: true,
      hasControls: rawInput?.hasControl,
      hasRotatingPoint: false,
      lockScalingFlip: true,
      lockSkewingX: true,
      lockSkewingY: true,
      lockMovementX: !rawInput?.hasControl,
      lockMovementY: !rawInput?.hasControl,
      rotatingPointOffset: 0,
      lockRotation: true,
      originX: "left",
      originY: "top",
      hoverCursor: !rawInput?.hasControl ? "pointer" : "default",
      dirty: rawInput?.mutated,
    });
    if (rawInput?.isFadeOut) {
      rect.fill = "#dddddd";
      rawInput.title = "";
      rect.opacity = 0.4;
      rect.hasControls = false;
      rect.selectable = false;
      rect.moveCursor = "default";
      rect.hoverCursor = "default";
    }
    (rect as any).hoverText = rawInput?.hoverText;
    (rect as any).title = rawInput?.title;
    (rect as any).id = rawInput?.id;
    (rect as any).classOrColorCode = rawInput?.classOrColorCode;
    (rect as any).isFadeOut = rawInput?.isFadeOut;
    return rect;
  }

  static generateText(rawInput: ControllerObjectData, align?: string): Textbox {
    const df = 4 * (rawInput?.w ?? 0 / rawInput?.h ?? 0);
    const text = new Textbox(rawInput?.title as unknown as string, {
      left: rawInput?.x ?? 0,
      top: rawInput?.y ?? 0,
      fontSize: df > 12 ? 12 : df,
      fontStyle: "normal",
      width: rawInput?.w ?? 0,
      height: rawInput?.h ?? 0,
      fontFamily: "Inter Regular",
      fontWeight: "Bold",
      textAlign: align ?? "justify-left",
      fill: rawInput?.strokeColor,
      selectable: true,
      hasBorders: true,
      hasControls: rawInput?.hasControl,
      hasRotatingPoint: false,
      lockScalingFlip: true,
      lockSkewingX: true,
      lockSkewingY: true,
      lockMovementX: !rawInput?.hasControl,
      lockMovementY: !rawInput?.hasControl,
      rotatingPointOffset: 0,
      lockRotation: true,
      originX: "center",
      originY: "center",
      hoverCursor: !rawInput?.hasControl ? "pointer" : "default",
    });

    return text;
  }

  static getObjDimRespectiveTarget(
    event: any,
    object: FabricObject,
    target: FabricObject,
    canvasRef: CanvasRefType
  ): ObjectDim {
    const targetPoints = target.getPointByOrigin("left", "top");
    const objectPoints = object.getPointByOrigin("left", "top");

    const objectBoundingBox = object.getBoundingRect();
    const generalizedX = (objectPoints.x - targetPoints?.x) / canvasRef.width;
    const generalizedY = (objectPoints.y - targetPoints?.y) / canvasRef.height;
    const h =
      objectBoundingBox.height / (canvasRef.getZoom() * canvasRef.height);
    const w = objectBoundingBox.width / (canvasRef.getZoom() * canvasRef.width);

    const objectDim: ObjectDim = {
      top: generalizedY + h / 2,
      width: w,
      left: generalizedX + w / 2,
      height: h,
    };

    return objectDim;
  }
}
