import { ControllerBaseInterface } from '../typings/base-typins';
import { CanvasRefType, CustomCanvasConfig } from '../typings/platform-typings';

export abstract class ControllerBaseClass implements ControllerBaseInterface {
  zoomStartScale: number;
  currentX: number;
  currentY: number;
  xChange: number;
  yChange: number;
  canvasWrapperRef: any;
  output: any;
  selection: boolean;
  canvasRef: CanvasRefType;
  canvasConfig: CustomCanvasConfig;
  initialZoom: number;
  pausePanning: boolean;
  lastX: number;
  lastY: number;
  origX = 0;
  origY = 0;
  currentW = 0;
  currentH = 0;
  lastClientX = 0;
  lastClientY = 0;
  isPanEnabled = false;
  isAddRectBox = true;

  constructor() {
    this.origX = 0;
    this.origY = 0;
    this.lastClientX = 0;
    this.lastClientY = 0;
    this.isPanEnabled = false;
    this.isAddRectBox = true;
  }

  abstract onSetCanvasConfigAndRender(): void;
  abstract onRegisterMobileGuesturesEvents(): void;
  abstract registerCanvasEvents(): void;
  abstract onMouseMoveEnd(arg0: unknown): void;
  abstract requestRenderAll(): void;
  abstract onTransformCanvas(e: WheelEvent): void;
  abstract init(canvasWrapperRef: any, canvasRef: any): void;
  abstract clean(): void;
}
