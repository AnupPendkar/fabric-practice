import { cloneDeep, generateUUID, isPropEmpty } from "../../utils/CommonUtils";
import {
  CanvasRefType,
  ContextMenu,
  ControllerObjectData,
  ControllerSettings,
  ObjectDim,
  ObjectTitleInstanceType,
  ObjectTitleType,
} from "../typings/platform-typings";
import { FactoryUtilsClass } from "../utils/factory-utils";
import { FabricImage, FabricObject } from "fabric";

export class ObjectStrategyBaseClass {
  private canvasRef!: CanvasRefType;
  private objects!: FabricObject;
  private origX: number;
  private origY: number;

  contextCallBack!: (type: string, event: any) => void;
  objectsEventCallBack!: (type: string, event: any) => void;
  private contextMenusInstances: FabricImage[] = [];
  private controllerSettings: ControllerSettings;

  private uuid!: string;
  private id!: string;
  isMutated = false;
  isRemoved = false;
  private colorCodeOrClassId = 0;

  private normalizedCoords!: ObjectDim;

  private title!: ObjectTitleType;
  private objectTitleInstance: ObjectTitleInstanceType = {
    objectTitleType: {
      text: "",
      visibilityCodes: [],
    },
    instances: [],
  };

  private isFadeOut!: boolean;

  private contextMenus: ContextMenu[] = [];
  private isObjectedCreated = false;
  private __pristineContextMenus: ContextMenu[] = [];

  constructor(
    canvasRef: CanvasRefType,
    origX: number,
    origY: number,
    controllerSettings: ControllerSettings
  ) {
    this.canvasRef = canvasRef;
    this.origX = origX;
    this.origY = origY;
    this.controllerSettings = controllerSettings;
  }

  setObject(
    object: FabricObject,
    callBack: (type: string, event: any) => void
  ): void {
    this.objects = object;
    this.objectsEventCallBack = callBack;
    this.uuid = generateUUID();
    (this.objects as any).__uuid = this.uuid;
    this.id = (this.objects as any).id;
    this.colorCodeOrClassId = (this.objects as any)?.classOrColorCode;
    this.title = (this.objects as any)?.title;
    this.isFadeOut = (this.objects as any)?.isFadeOut;

    // if first time drawn
    this.setMutation(object.dirty);
  }

  setObjectCreated(flag: boolean): void {
    this.isObjectedCreated = flag;
  }

  getObjectCreated(): boolean {
    return this.isObjectedCreated;
  }

  setRemove(flag: boolean): void {
    this.isRemoved = flag;
  }

  getIsFadeOut(): boolean {
    return this.isFadeOut;
  }

  setTitle(title: ObjectTitleType): void {
    this.title = title;
  }

  getTitle(): ObjectTitleType {
    return this.title;
  }

  getIsRemoved(): boolean {
    return this.isRemoved;
  }

  getColor(colorCode: number): string {
    return this.controllerSettings?.objectColorCodeStrategy?.find(
      (ll) => ll?.code === colorCode
    )?.color;
  }

  getClassOrColorCode(): number {
    return this.colorCodeOrClassId;
  }

  setClassOrColorCode(code: number): void {
    this.colorCodeOrClassId = code;
  }

  setNormalizedObjectDim(objectDim: ObjectDim): void {
    this.normalizedCoords = objectDim;
  }

  getNormalizedObjectDim(): ObjectDim {
    return this.normalizedCoords;
  }

  setContextMenus(
    contextMenus: ContextMenu[],
    callBack: (type: string, event: any) => void
  ): void {
    this.contextCallBack = callBack;
    this.contextMenus = contextMenus ?? [];
    this.__pristineContextMenus = cloneDeep(contextMenus);
  }

  setRerawContextMenu(contextMenus: ContextMenu[]): void {
    this.contextMenus = contextMenus ?? [];
  }

  setMutation(flag: boolean): void {
    this.isMutated = flag;
  }

  getMutation(): boolean {
    return this.isMutated;
  }

  /**
   * ! Generate the any object based
   * @param object
   * @param callBack
   */
  onGenerate(): void {
    // ? ovverride the Controls  visibility
    this.objects.setControlsVisibility({
      bl: true,
      br: true,
      mb: true,
      ml: true,
      mr: true,
      mt: true,
      tl: true,
      tr: true,
      mtr: false,
    });

    this.objects.dirty = true;
    this.canvasRef?.add(this.objects);
    if (!this.controllerSettings.alphaOnHover) {
      this.objects.set({ stroke: this.getColor(this.colorCodeOrClassId) });
    }
    this.canvasRef.requestRenderAll();
  }

  onGenerateTitle(): void {
    if (isPropEmpty(this.getTitle())) {
      return;
    }
    const coords = this.objects?.getBoundingRect();
    const exactY = coords.top;
    const exactX = coords?.left;
    const hoveText: ControllerObjectData = {
      x: exactX,
      y: exactY,
      w: coords.width - coords.width / 2,
      h: 30,
      strokeWidth: 2,
      strokeColor: this.getColor(this.colorCodeOrClassId),
      fillColor: this.getColor(this.colorCodeOrClassId),
      id: this.getPristineId(),
      title: this.getTitle()?.text,
      contextMenu: [],
      mutated: false,
      hasControl: false,
      hoverText: [],
    };
    const generateRect = FactoryUtilsClass.generateRect(hoveText);
    hoveText.strokeColor = "#191919";
    hoveText.x += hoveText.w / 2;
    hoveText.y += hoveText.h / 2;
    (generateRect as any).isTitleInstance = true;
    const generateText = FactoryUtilsClass.generateText(
      hoveText,
      "justify-center"
    );
    (generateText as any).isTitleInstance = true;

    this.getCanvasRef().add(generateRect, generateText);
    this.objectTitleInstance.instances = [generateRect, generateText];
    this.objectTitleInstance.objectTitleType = this.getTitle();
  }

  onCleanAndReRenderTitle(): void {
    this.getObjectTitleInstances().instances?.forEach((d) => {
      this.getCanvasRef().remove(d);
    });

    this.objectTitleInstance.instances = [];
    this.objectTitleInstance.objectTitleType = null;

    this.onGenerateTitle();
  }

  getObjectTitleInstances(): ObjectTitleInstanceType {
    return this.objectTitleInstance;
  }

  addContextMenus(): void {
    const menu = this.getContextMenus();
    const ins = this.getInstance();
    const matrix = ins?.calcTransformMatrix();

    if (isPropEmpty(menu)) {
      return;
    }

    // now render the all menus for objects
    menu?.forEach((ctxm, i) => {
      if (!ctxm.visibility) {
        return;
      }
      // eslint-disable-next-line no-new, new-cap
      FabricImage?.fromURL(`${ctxm?.imagePath}`).then((img) => {
        (img as any).__uuid = (this?.getInstance() as any)?.__uuid;

        img.hasControls = false;
        img.lockMovementX = true;
        img.lockMovementY = true;
        img.hoverCursor = "pointer";
        const imgModified = img.set({
          left: matrix[4] + ins?.getScaledWidth() / 2 + i * -25 - img?.width,
          top: matrix[5] - ins?.getScaledHeight() / 2 - img?.height,
          width: 18 / img.scaleX,
          height: 18 / img.scaleY,
        });

        imgModified.on("selected", (e) =>
          this?.contextCallBack(`${ctxm?.name}`, e)
        );

        this.contextMenusInstances?.push(imgModified as any);
        this?.getCanvasRef()?.add(imgModified);
        this?.getCanvasRef().renderAll();
      });
    });
  }

  setCleanContextMenusInstances(): void {
    this.contextMenusInstances = [];
  }

  getContextMenusInstances(): FabricImage[] {
    return this.contextMenusInstances;
  }

  getInstance(): FabricObject {
    return this.objects;
  }

  getContextMenus(): ContextMenu[] {
    return this.contextMenus;
  }

  getContextMenuPristine(): ContextMenu[] {
    return this.__pristineContextMenus;
  }

  getCanvasRef(): CanvasRefType {
    return this.canvasRef;
  }

  getUUID(): string {
    return this.uuid;
  }

  getPristineId(): string {
    return this.id;
  }
}
