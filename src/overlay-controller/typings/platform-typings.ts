import { Canvas, FabricObject, Rect, TPointerEvent, TPointerEventInfo } from "fabric";
import { LegendsColor, Damages } from "../../typings/damage-controller.typing";

export type SN = string | number;

export interface CustomObject {
  id: SN;
}

export interface CustomCanvasConfig {
  canvas_id: SN;
  canvasHeight: number;
  canvasWidth: number;
  canvasBackground: string;
}

// All Fabric Objects Custom Typings
export type CustomRectangleConfig = Rect & CustomObject;
export type CustomObjectType = FabricObject;

export type CanvasRefType = Canvas;

export enum ObjectTypeEnum {
  Image = "image",
  Text = "text",
  Rect = "rect",
}

export type ObjectDim = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export enum ContextMenuAction {
  SAVE = "save",
  DELETE = "delete",
}

export type RedrawExtras = {
  contextMenu?: ContextMenu[];
  strokeWidth?: number;
  strokeColor?: string;
  [key: string]: any;
};

export interface ControllerGenericEventType<T, K> {
  type: K;
  event?: TPointerEventInfo<TPointerEvent> | FabricObject;
  data?: T | null;
  extras?: RedrawExtras | null;
}

export enum ControllerViewType {
  OVERLAY_VIEW_MODE = 1,
  DRAWING_MODE = 2,
  DRAW_HEATMAP_MODE = 3,
}

export type ObjectTitleInstanceType = {
  objectTitleType: ObjectTitleType;
  instances: FabricObject[];
};

export type ObjectTitleType = {
  text: string;
  visibilityCodes: number[];
};

export type ControllerObjectData = {
  x: number;
  y: number;
  w: number;
  h: number;
  strokeWidth: number;
  strokeColor: string;
  id: string | number;
  title: ObjectTitleType | string;
  contextMenu: ContextMenu[];
  mutated: boolean;
  hasControl: boolean;
  hoverText: HoverText[];
  fillColor?: string;
  classOrColorCode?: number;
  confidence?: number;
  isFadeOut?: boolean;
};

export type HoverText = {
  color: string;
  text: string;
  count?: number;
  type?: number;
  colorCode?: number;
};

export type ContextMenu = {
  imagePath: string;
  name: string;
  visibility: boolean;
};

export type CtrBGView = {
  path: string;
  heatmap_image_path: string;
  isFitToView: boolean;
};

export type ObjectColorCodeStrategy = {
  code: number;
  color: LegendsColor;
  text?: string;
};

export type ControllerSettings = {
  title?: string;
  objectsData: Array<ControllerObjectData>;
  heatMapData?: Array<ControllerObjectData>;
  controllerView: ControllerViewType;
  viewImage: CtrBGView;
  alphaOnHover: boolean;
  objectColorCodeStrategy?: ObjectColorCodeStrategy[];
  getColor?(colorCode: number): string;
  stitched_image_predictions?: Array<Damages>;
  scale?: number[];
};
