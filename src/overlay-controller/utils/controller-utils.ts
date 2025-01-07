import { ObjectsGeneratorInstanceManageClass } from "../typings/base-typins";
import { ObjectGeneratorClass } from "../abstructions-handlers/object-generate-class";
import { FabricObject } from "fabric";
import {
  CanvasRefType,
  ObjectDim,
  ObjectTitleType,
} from "../typings/platform-typings";
import { isPropEmpty } from "../../utils/CommonUtils";

export class ControllerCommonUtils {
  static getAllObjectByUUID(
    uuid: string,
    canvasRef: CanvasRefType
  ): FabricObject[] {
    return canvasRef?._objects?.filter((d) => (d as any)?.__uuid === uuid);
  }

  static removeObjectByUUid(uuid: string, canvasRef: CanvasRefType): void {
    const findObjectsByUUID = ControllerCommonUtils.getAllObjectByUUID(
      uuid,
      canvasRef
    );
    findObjectsByUUID?.forEach((ins) => {
      canvasRef?.remove(ins);
    });

    canvasRef.renderAll();
  }

  static validateRedrawExtras = (value: any) => {
    if (isPropEmpty(value?.extras)) {
      console.error("Redraw =>  object extras not provided...");
    }
    return value;
  };

  static getAllUUIDFromCanvas(canvasRef: CanvasRefType): Array<string> {
    const objects = canvasRef?._objects?.reduce(
      (acc, val) => acc.concat((val as any)?.__uuid),
      []
    ) as Array<string>;

    return objects;
  }

  static removeObjectInstance<T extends FabricObject>(
    object: T,
    convasRef?: CanvasRefType
  ): void {
    const uuid = (object as any)?.target?.__uuid;
    const canvas = (object as any)?.target?.canvas;
    ControllerCommonUtils.removeObjectByUUid(uuid, convasRef ?? canvas);
  }

  static getActiveObjectUUID(canvasRef: CanvasRefType): string {
    return (canvasRef?.getActiveObject() as any)?.__uuid as string;
  }

  static getUUIDByObject(objects: FabricObject): string {
    return (
      ((objects as any)?.__uuid as string) ?? ((objects as any)?.id as string)
    );
  }

  static getDimOfActivatedObject(canvasRef: CanvasRefType): any {
    const zoomScaled = canvasRef?.getZoom();
    let dim: ObjectDim = canvasRef?.getActiveObject()?.getBoundingRect();
    const h = Math.floor(dim?.height ?? 0 / zoomScaled);
    const w = Math.floor(dim?.width ?? 0 / zoomScaled);

    dim = Object?.assign(!dim ? {} : dim, { width: w, height: h }) as any;

    return dim;
  }

  static removeObjectsForceFully(canvasRef: CanvasRefType): void {
    const activatedRectDim =
      ControllerCommonUtils.getDimOfActivatedObject(canvasRef);
    if (activatedRectDim.width < 12 || activatedRectDim.height < 12) {
      const acivatedUUID = ControllerCommonUtils.getActiveObjectUUID(canvasRef);
      ControllerCommonUtils.removeObjectByUUid(acivatedUUID, canvasRef);
      canvasRef.renderAll();
      canvasRef.requestRenderAll();
    }
  }

  /**
   * This function is usefull if you wanted to remove any user interaction with specfic object based on the property on it, or force to all objects if based the below agrs
   * 1. managerClass: holds of current canvas and rendered objects
   * 2. key: property exists on object
   * 2. forceAll: force to all object;
   * @param canvasRef
   * @param key
   */
  static forceToPreventObjectMovementByInstace(
    managerClass: ObjectsGeneratorInstanceManageClass,
    key: string,
    forceAll = false
  ): void {
    const allInstance = managerClass?.instanceList;

    const stopMovement = (obj: FabricObject) => {
      obj.lockMovementX = true;
      obj.lockMovementY = true;
      obj.hasControls = false;
      // obj.canvas.discardActiveObject();
      obj.canvas?.renderAll();
    };

    allInstance.forEach((ins) => {
      const objIns = ins.instance?.getClonedRenderedInstance()?.getInstance();

      if (forceAll) {
        stopMovement(objIns);
      } else {
        const pristineID = objIns?.[key];
        if (!isPropEmpty(pristineID)) {
          stopMovement(objIns);
        }
      }
    });
  }

  /**
   * This function is usefull if you wanted to allow any user interaction with specfic object based on the property on it, or force to all objects if based the below agrs
   * 1. managerClass: holds of current canvas and rendered objects
   * 2. key: property exists on object
   * 2. forceAll: force to all object;
   * @param canvasRef
   * @param key
   */
  static forceToAllowObjectMovementByInstace(
    managerClass: ObjectsGeneratorInstanceManageClass,
    key: string,
    forceAll = false
  ): void {
    const allInstance = managerClass.instanceList;

    const stopMovement = (obj: FabricObject) => {
      obj.lockMovementX = false;
      obj.lockMovementY = false;
      obj.hasControls = true;
      obj.canvas?.renderAll();
    };

    allInstance.forEach((ins) => {
      const objIns = ins?.instance?.getClonedRenderedInstance()?.getInstance();

      if (forceAll) {
        stopMovement(objIns);
      } else {
        const pristineID = objIns?.[key];
        if (!isPropEmpty(pristineID)) {
          stopMovement(objIns);
        }
      }
    });
  }

  static forceToRemoveTheOveloayOnInstance(
    managerClass: ObjectsGeneratorInstanceManageClass
  ): void {
    managerClass?.instanceList?.forEach((ins) => {
      ins.instance.getOverlayInstances().forEach((object) => {
        ins.instance.getCanvasRef().remove(object);
      });
    });
  }

  static forceToRenderTitleOnInstance(
    managerClass: ObjectsGeneratorInstanceManageClass
  ): void {
    managerClass?.instanceList?.forEach((ins) => {
      ins.instance.getClonedRenderedInstance().onCleanAndReRenderTitle();
    });
  }

  // Under tetsting
  static forceToSetContextMenusVisibilities(
    managerClass: ObjectsGeneratorInstanceManageClass,
    currentInstance: ObjectGeneratorClass,
    allowedOnlyNew = false,
    forceAll = false
  ): void {
    if (allowedOnlyNew) {
      if (currentInstance) {
        currentInstance?.reDrawSelfContextMenu(true);
        return;
      }
      return;
    }

    if (forceAll) {
      const allInstance = managerClass?.instanceList;
      allInstance?.forEach((ins) => {
        ins?.instance?.reDrawSelfContextMenu(forceAll);
      });
    }
  }

  static forceToHandleObjectTitleVisibility(
    managerClass: ObjectsGeneratorInstanceManageClass,
    objectTitle: ObjectTitleType
  ): void {
    if (isPropEmpty(objectTitle)) {
      return;
    }

    managerClass?.instanceList?.forEach((inst) => {
      const titleInstances = inst?.instance
        ?.getClonedRenderedInstance()
        ?.getObjectTitleInstances();
      const isMatched = titleInstances?.objectTitleType?.visibilityCodes?.every(
        (code) => objectTitle?.visibilityCodes?.includes(code)
      );

      if (!isMatched) {
        titleInstances?.instances?.forEach((ins) => {
          ins.visible = false;
          inst?.instance?.getCanvasRef()?.renderAll();
        });
      } else {
        titleInstances?.instances?.forEach((ins) => {
          ins.visible = true;
          inst?.instance?.getCanvasRef()?.renderAll();
        });
      }
    });
  }

  static forceToHandleOverlayObjectVisibility(
    managerClass: ObjectsGeneratorInstanceManageClass,
    currentInstance: ObjectGeneratorClass,
    hoverTextVisibilityCode: number[]
  ): void {
    currentInstance.addHoverTextOverObjectsOverlay(
      currentInstance.getClonedRenderedInstance(),
      hoverTextVisibilityCode
    );
  }
}
