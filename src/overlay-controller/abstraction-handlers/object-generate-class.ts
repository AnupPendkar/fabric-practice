import * as d3 from "d3";
import { ObjectStrategyBaseClass } from "./object-strategy-base.class";
import {
  CanvasRefType,
  ControllerObjectData,
  ControllerSettings,
  ControllerViewType,
  HoverText,
  RedrawExtras,
} from "../typings/platform-typings";
import { FactoryUtilsClass } from "../utils/factory-utils";
import { FabricObject } from "fabric";
import { isPropEmpty } from "../../utils/CommonUtils";

export class ObjectGeneratorClass {
  private objectsStrategyClass: ObjectStrategyBaseClass;
  private settings!: ControllerSettings;

  // ! cloned instances
  private clonedOverlayInstance: FabricObject[] = [];
  private clonedRenderedInstance!: ObjectStrategyBaseClass;

  constructor(instances?: ObjectStrategyBaseClass) {
    // ! Initialize objectsStrategyClassList properly
    this.objectsStrategyClass = instances;
  }

  setInstance(instance: ObjectStrategyBaseClass, ...arg: unknown[]): void {
    this.settings = arg[0] as ControllerSettings;
    this.objectsStrategyClass = instance;
  }

  /**
   * ! 1. Render the object
   * ? 2. Register the Listeners
   * * 3. tracks the instanses and assign them to variables which we can expose to the out world
   * @returns
   */
  onRenderInstance(): void {
    // * Ensure objectsStrategyClassList is initialized as an array

    const popInstance = this.objectsStrategyClass;

    // * Check for undefined properly
    if (!popInstance || isPropEmpty(popInstance)) {
      return;
    }
    popInstance?.onGenerate();
    popInstance?.onCleanAndReRenderTitle();

    popInstance.getInstance().on("selected", (e) => {
      if (this.settings?.alphaOnHover && !popInstance.getIsFadeOut()) {
        this.removeObjectsOverlay(popInstance);
      }
      popInstance?.objectsEventCallBack("click", e);
    });

    popInstance.getCanvasRef().on("mouse:out", (e) => {
      d3.select(".toolTipClass").style("display", "none");
      this.removeObjectsOverlay(popInstance);
    });

    popInstance.getInstance().on("mousemove", (e) => {
      this.removeObjectsOverlay(popInstance);
      if (this.settings?.alphaOnHover && !popInstance.getIsFadeOut()) {
        this.addObjectOverlay(popInstance);
      }
      popInstance?.objectsEventCallBack("move", e);
    });

    popInstance.getInstance().on("modified", (e) => {
      if (this.settings.controllerView === ControllerViewType.DRAWING_MODE) {
        // Update the Visibility of the object
        popInstance.getContextMenuPristine().forEach((v) => {
          v.visibility = true;
        });
        popInstance.setMutation(true);
        popInstance.setRerawContextMenu(popInstance.getContextMenuPristine());
        this.onRemoveAndRenderContext(e, popInstance);
      }
    });

    this.clonedRenderedInstance = popInstance;
  }

  /**
   *! A most important function to re-draw the objects, its associated context menus actions buttons , and even you add more to it
   * @param uuid
   */
  reDrawSelfWithExtra(uuid: string, extras: RedrawExtras): void {
    const objIns = this.clonedRenderedInstance?.getInstance();
    objIns.dirty = true;
    objIns.set({
      stroke: this.clonedRenderedInstance?.getColor(extras?.classOrColorCode),
      strokeWidth: extras?.strokeWidth ?? 2,
    });
    this.clonedRenderedInstance?.setClassOrColorCode(extras?.classOrColorCode);
    this.clonedRenderedInstance.setMutation(true);
    this.clonedRenderedInstance.setRerawContextMenu(
      extras.contextMenu.length > 0
        ? extras?.contextMenu
        : this.clonedRenderedInstance.getContextMenuPristine()
    );
    this.onRemoveAndRenderContext(
      null,
      this.clonedRenderedInstance,
      true,
      uuid
    );
    this.clonedRenderedInstance.getCanvasRef().renderAll();
  }

  // ? This Function called when there are no extras but objects
  reDrawSelfContextMenu(visibility = true): void {
    if (this.settings.controllerView === ControllerViewType.DRAWING_MODE) {
      const contextMenu = this.clonedRenderedInstance.getContextMenus();
      contextMenu.forEach((m) => {
        m.visibility = visibility;
      });
      this.clonedRenderedInstance.setRerawContextMenu(contextMenu);
      this.onRemoveAndRenderContext(
        null,
        this.clonedRenderedInstance,
        true,
        this.clonedRenderedInstance.getUUID()
      );
      this.clonedRenderedInstance?.getCanvasRef()?.renderAll();
    }
  }

  /**
   * ? Helps to remove the Object Overlay
   * @param popInstance
   * @returns
   */
  private removeObjectsOverlay(popInstance: ObjectStrategyBaseClass) {
    popInstance?.getCanvasRef()?._objects?.forEach((obj) => {
      if (!(obj as any)?.isTitleInstance && !(obj as any)?.isFadeOut) {
        obj.set({
          fill: "transparent",
          opacity: 1,
          hoverCursor: popInstance?.getIsFadeOut() ? "default" : "pointer",
        });
      }
    });

    if (isPropEmpty(this.clonedOverlayInstance)) {
      return;
    }
    this.clonedOverlayInstance?.forEach((ins) => {
      popInstance.getCanvasRef().remove(ins);
    });

    this.clonedOverlayInstance = [];
  }

  /**
   * ? Add a Overlay over the Rendered Object and also the some Hover Text (like legends)
   * @param popInstance
   */
  private addObjectOverlay(popInstance: ObjectStrategyBaseClass) {
    popInstance.getInstance().set({
      fill: "#191919",
      opacity: 0.3,
      hoverCursor: popInstance?.getIsFadeOut() ? "default" : "pointer",
    });

    popInstance.getCanvasRef().renderTop();
  }
  /**
   * ! This handler will grap the HoverText and generate the Overlay(currently overlay is rect in future it may  the other object), and also tracked the clonedOverlay instances to avoid again render over the object, please put some attentins before going to do any changes here.
   * @param popInstance
   */
  addHoverTextOverObjectsOverlay(
    popInstance: ObjectStrategyBaseClass,
    hoverTextVisibilityCode: number[]
  ): void {
    const grapHoverText = (popInstance.getInstance() as any)
      ?.hoverText as HoverText[];
    const coords = popInstance?.getInstance()?.getBoundingRect();
    const exactY = coords?.height + coords.top;
    const exactX = coords?.left;
    grapHoverText?.forEach((ht, i) => {
      if (!hoverTextVisibilityCode.includes(ht?.colorCode)) {
        return;
      }
      const hoveText: ControllerObjectData = {
        x: exactX + 20,
        y: exactY + i * -25 - 40,
        w: 15,
        h: 15,
        strokeWidth: 2,
        strokeColor: ht?.color,
        fillColor: ht?.color,
        id: ht?.colorCode + "",
        title: ht?.text as any,
        contextMenu: [],
        mutated: false,
        hasControl: false,
        hoverText: [],
      };
      const generateRect = FactoryUtilsClass.generateRect(hoveText);
      hoveText.x += hoveText.w + 70;
      hoveText.w = 120;
      hoveText.y += 10;
      hoveText.strokeColor = "#ffffff";
      const generateText = FactoryUtilsClass.generateText(hoveText);
      popInstance.getCanvasRef().add(generateText, generateRect);
      this.clonedOverlayInstance?.push(generateText, generateRect);
    });
  }

  /**
   * ! A object can have the Conext Menus to Put some customize actions, so exactly this handler take care of that, it handle the remove and re-draw the Context Menus
   * @param e
   * @param popInstance
   * @param addMenu
   */
  private onRemoveAndRenderContext(
    e: any,
    popInstance: ObjectStrategyBaseClass,
    addMenu = true,
    __uuid?: string
  ): void {
    const uuid = (e?.target as any)?.__uuid ?? __uuid;
    const findAllAssociatedInstances = popInstance
      .getContextMenusInstances()
      .filter((ins) => (ins as any)?.__uuid === uuid);

    findAllAssociatedInstances?.forEach((d) => {
      popInstance.getCanvasRef().remove(d);
    });

    if (addMenu) {
      popInstance?.addContextMenus();
    }
  }

  getClonedRenderedInstance(): ObjectStrategyBaseClass {
    return this.clonedRenderedInstance;
  }
  getOverlayInstances(): FabricObject[] {
    return this.clonedOverlayInstance;
  }

  getCanvasRef(): CanvasRefType {
    return this.objectsStrategyClass.getCanvasRef();
  }
}
