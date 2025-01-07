import { InstanceCollection } from "../abstraction-handlers/object-Instance.class";
import { ObjectGeneratorClass } from "../abstraction-handlers/object-generate-class";
import { ObjectStrategyBaseClass } from "../abstraction-handlers/object-strategy-base.class";
import {
  CanvasRefType,
  CustomCanvasConfig,
  ObjectTypeEnum,
} from "./platform-typings";
import { FabricObject } from "fabric";

export interface ControllerBaseInterface {
  output: any;
  selection: boolean;
  canvasRef: CanvasRefType;
  canvasWrapperRef: React.RefObject<HTMLDivElement>;
  canvasConfig: CustomCanvasConfig;
  initialZoom: number;
  pausePanning: boolean;
  zoomStartScale: number;
  currentX: number;
  currentY: number;
  xChange: number;
  yChange: number;

  onSetCanvasConfigAndRender(): void;
  onRegisterMobileGuesturesEvents(): void;
  registerCanvasEvents(): void;
  onMouseMoveEnd(arg0: any): void;
  requestRenderAll(): void;
  onTransformCanvas(e: WheelEvent): void;
  init(
    canvasWrapperRef: React.RefObject<HTMLDivElement>,
    canvasRef: React.RefObject<HTMLCanvasElement>
  ): void;
  clean(): void;
}

export interface ControllerBaseOverlayInterface {
  addObject(objectTypeEnum: ObjectTypeEnum, object: FabricObject): void;
  removeObject(object: FabricObject): void;
  removeSelfInstance(): void;
}

export interface ObjectInstanceType<T> {
  instance: T;
  uuid?: string;
  parentId?: string;
}

export class ObjectsGeneratorInstanceManageClass extends InstanceCollection<ObjectGeneratorClass> {}
export class ObjectsStrategyInstanceManageClass extends InstanceCollection<ObjectStrategyBaseClass> {}
