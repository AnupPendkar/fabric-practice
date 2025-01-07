import React, { useEffect, useRef, useState } from "react";
import {
  ControllerSettings,
  ObjectTitleType,
  CanvasRefType,
  ControllerObjectData,
  ContextMenuAction,
  ControllerViewType,
} from "../typings/platform-typings";
import { ControllerGenericEventClass } from "../abstraction-handlers/controller-generic-evt.class";
import { FabricObject } from "fabric";
import { ObjectsGeneratorInstanceManageClass } from "../typings/base-typins";
import { ObjectStrategyBaseClass } from "../abstraction-handlers/object-strategy-base.class";
import { FactoryUtilsClass } from "../utils/factory-utils";
import * as d3 from "d3";
import { isPropEmpty } from "../../utils/CommonUtils";
import { ControllerCommonUtils } from "../utils/controller-utils";
import { ObjectGeneratorClass } from "../abstraction-handlers/object-generate-class";
import { ControllerRendererClass } from "../abstraction-handlers/controller-renderer";

export interface ComponentProps {
  eventChanges?: (event: ControllerGenericEventClass<any, any>) => void;
  controllerSettings?: ControllerSettings;
  canPan?: boolean;
  canZoom?: boolean;
  reload?: boolean;
  reDraw?: ControllerGenericEventClass<any, any>;
  canEdit?: boolean;
  canAdd?: boolean;
  removeInstance?: any | FabricObject;
  forceToRender?: boolean;
  objectTitleVisibilityCodes?: ObjectTitleType;
  hoverTextVisibilityCode?: number[];
  heatMapShown?: boolean;
  isHoverAllowed?: boolean;
  title?: string;
  currentBackgroundPath?: string;
  disabledObjects?: boolean;
  afterRenderingCompleted?: (canvasRef: CanvasRefType) => void;
}

const Controller: React.FC<ComponentProps> = (props: ComponentProps) => {
  const objectsGeneratorInstanceManageClass = useRef(null);

  const rendererClass = useRef(null);

  const currentStrategyBaseClassInstance =
    useRef<ObjectStrategyBaseClass | null>(null);
  const CanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const toolTipRef = useRef<HTMLDivElement>(null);

  //   const backGroundImageRef = useRef<any>(null);
  //   const heatmapInstance = useRef<any>(null);
  //   const [getFreezeObjects, setFreezeObjects] = useState(false);
  //   const [firstTime, setFirstTime] = useState(true);
  //   const [origX, setOrigX] = useState(0);
  //   const [origY, setOrigY] = useState(0);

  useEffect(() => {
    objectsGeneratorInstanceManageClass.current =
      new ObjectsGeneratorInstanceManageClass();
    rendererClass.current = new ControllerRendererClass(onAfterCanvasInit);

    console.log(
      objectsGeneratorInstanceManageClass.current,
      rendererClass.current
    );

    return () => {
      console.log("destroyed");
      rendererClass.current?.clean();
    };
  }, []);

  useEffect(() => {
    cleanAndRender();
  }, [props.controllerSettings]);

  useEffect(() => {
    currentStrategyBaseClassInstance.current = null;
    rendererClass.current.setCanAddRect(!props.canPan);
    rendererClass.current.setPanEnabled(props.canPan);
  }, [props.canPan]);

  useEffect(() => {
    rendererClass.current.setZoomEnabled(props.canZoom);
  }, [props.canZoom]);

  useEffect(() => {
    onReDraw();
  }, [props.reDraw]);

  useEffect(() => {
    removeInstanceByInstance(props.removeInstance as any);
  }, [props.removeInstance]);

  useEffect(() => {
    ControllerCommonUtils.forceToPreventObjectMovementByInstace(
      objectsGeneratorInstanceManageClass.current,
      "id",
      true
    );
  }, [props.disabledObjects]);

  useEffect(() => {
    onChangeCanvasBackground(props.heatMapShown);
    setChangeObjectsTitleVisibilityBasedOnCodes();
  }, [props.objectTitleVisibilityCodes]);

  useEffect(() => {
    onChangeCanvasBackground(props.heatMapShown);
  }, [props.heatMapShown]);

  function setChangeObjectsTitleVisibilityBasedOnCodes(): void {
    if (!isPropEmpty(props.objectTitleVisibilityCodes)) {
      ControllerCommonUtils.forceToHandleObjectTitleVisibility(
        objectsGeneratorInstanceManageClass.current,
        props.objectTitleVisibilityCodes as ObjectTitleType
      );
    }
  }

  /**
   * ?  Safe way first remove the rendered canvas and then again initialized the rendering
   */
  function cleanAndRender(): void {
    objectsGeneratorInstanceManageClass.current?.clearInstanceCollection();
    rendererClass.current.clean();
    cleanHeatMap();
    setTimeout(() => {
      rendererClass.current.init(
        canvasWrapperRef.current,
        CanvasRef.current,
        props.controllerSettings
      );
    }, 10);
  }

  function cleanHeatMap(): void {
    // const canvasElement = heatmapInstance?._renderer?.canvas;
    // if (canvasElement && canvasElement?.parentNode) {
    //   canvasElement?.parentNode?.removeChild(canvasElement);
    // }
  }

  /**
   * ! from external world if we wanted to remove the any object so have to call this
   * @returns
   */
  function removeInstanceByInstance(removeInstance: FabricObject): void {
    if (isPropEmpty(removeInstance)) {
      return;
    }

    ControllerCommonUtils.removeObjectInstance<any>(
      removeInstance as FabricObject,
      null
    );
    const uuid = ControllerCommonUtils.getUUIDByObject(
      (props.removeInstance as any).target
    );

    objectsGeneratorInstanceManageClass.current?.dropInstanceByUUID(uuid);
  }

  /**
   * ! This helper is Allow/Disallow to edit the objects
   */
  function updateObjectsFreezingState(flag: boolean): void {
    ControllerCommonUtils.forceToAllowObjectMovementByInstace(
      objectsGeneratorInstanceManageClass.current,
      "id",
      flag
    );
  }

  /**
   *  ! It fires when you mousedown on the Canvas , just use to start drawing the objects
   */
  function onAfterMouseChange(): void {
    // ! if edit env then do not allow to use add the new object but can update existing one
    // ! make Sure if if you are in edit mode the you can not add new object to the canvas
    // ! if none of option like (canEdit and canAdd are being false) so even can not add any object

    if (!props.canAdd) {
      return;
    }

    if (props.disabledObjects) {
      return;
    }

    currentStrategyBaseClassInstance.current = null;

    const raqInput: ControllerObjectData = {
      x: rendererClass.current.origX,
      y: rendererClass.current.origY,
      w: 0,
      h: 0,
      strokeWidth: 2,
      strokeColor: "#191919",
      id: undefined,
      title: undefined,
      contextMenu: [
        {
          imagePath: "assets/images/controllers/Delete.svg",
          name: ContextMenuAction.DELETE,
          visibility: true,
        },
        {
          imagePath: "assets/images/controllers/Edit.svg",
          name: ContextMenuAction.SAVE,
          visibility: true,
        },
      ],
      mutated: true,
      hasControl: true,
      hoverText: [],
      classOrColorCode: 1,
    };

    currentStrategyBaseClassInstance.current = null;
    onDrawRect(raqInput, true);
  }

  /**
   * * This call back fires when Canvas Rendering is completed
   */
  function onAfterCanvasInit(): void {
    console.log('onAfterCanvasInit')
    FactoryUtilsClass.generateAndAdjustObjectsDim(
      rendererClass.current.canvasRef,
      props.controllerSettings,
      rendererClass.current.backGroundImageRef
    ).then((transformSettings) => {
      onRenderObjects(transformSettings);
      if (
        [
          ControllerViewType.DRAW_HEATMAP_MODE,
          ControllerViewType.OVERLAY_VIEW_MODE,
        ].includes(rendererClass.current.constrollerSettings.controllerView)
      ) {
        onChangeCanvasBackground(props.heatMapShown);
      }
    });
    setTimeout(() => {
      ControllerCommonUtils.forceToHandleObjectTitleVisibility(
        objectsGeneratorInstanceManageClass.current,
        props.objectTitleVisibilityCodes
      );
    }, 10);

    // Emit after rendering completed
    // afterRenderingCompleted.emit(canvasRef);

    // Fire the
    rendererClass.current.canvasRef.on("mouse:up", (e) => {
      if (
        !isPropEmpty(currentStrategyBaseClassInstance) &&
        !currentStrategyBaseClassInstance.current?.getObjectCreated()
      ) {
        cleanAndRaisedEvent(
          "mouseup",
          e,
          currentStrategyBaseClassInstance.current
        );
        currentStrategyBaseClassInstance.current.setObjectCreated(true);
      }
    });
  }

  function onRenderObjects(transformSettings: ControllerSettings): void {
    transformSettings?.objectsData?.forEach((d) => {
      onDrawRect(d);
      currentStrategyBaseClassInstance.current = null;
    });
  }

  function onChangeCanvasBackground(status: boolean): void {
    if (status && props.currentBackgroundPath) {
      rendererClass.current.canvasRef?.remove(
        rendererClass.current.backGroundImageRef
      );
      rendererClass.current.setToggleBackground(
        props.controllerSettings.viewImage,
        props.currentBackgroundPath
      );
    } else {
      rendererClass.current.canvasRef?.remove(
        rendererClass.current.heapMapBackgroundRef
      );
      rendererClass.current.setToggleBackground(
        props.controllerSettings.viewImage,
        props.controllerSettings.viewImage.path
      );
    }
  }

  function cleanAndRaisedEvent(
    type: string,
    e: any,
    objectStrategyBaseClass: ObjectStrategyBaseClass
  ): void {
    const canvasRenderedUUId = ControllerCommonUtils.getAllUUIDFromCanvas(
      rendererClass.current.canvasRef
    );

    const removedFromCanvas =
      objectsGeneratorInstanceManageClass.current?.instanceList?.filter(
        (ins) => !canvasRenderedUUId?.includes(ins?.uuid)
      );

    // if add mode and instances were removed from canvas then remove them from Objects manager class as well, because it should should not emit to make our changes deduction's fool
    if (!isPropEmpty(removedFromCanvas)) {
      for (let i = 0; i < removedFromCanvas?.length; i += 1) {
        const uuid = removedFromCanvas?.[i].uuid;
        objectsGeneratorInstanceManageClass.current?.dropInstanceByUUID(uuid);

        if (i === removedFromCanvas?.length - 1) {
          console.log(
            "Unwanted Objects Removed , do not dispatched any events"
          );
        }
      }
      // raised events
    } else {
      raisedEvent(
        type,
        e,
        objectsGeneratorInstanceManageClass.current,
        objectStrategyBaseClass
      );
    }
  }
  /**
   * ! This function  helps to start the rendering rects and events registerations and listing those events.
   * @param rawInput
   */
  function onDrawRect(rawInput: ControllerObjectData, isNew = false): void {
    console.log(rawInput);
    const factoryRect = FactoryUtilsClass.generateRect(rawInput);
    // if Drawind Mode the set it as Active else not
    if (isNew) {
      rendererClass.current.canvasRef.setActiveObject(factoryRect);
    }

    const objectGeneratorClass = new ObjectGeneratorClass();

    const objectStrategyBaseClass = new ObjectStrategyBaseClass(
      rendererClass.current.canvasRef,
      rawInput?.x,
      rawInput?.y,
      rendererClass.current.constrollerSettings
    );

    // Object Event Listening
    objectStrategyBaseClass.setObject(factoryRect, (type: string, e: any) => {
      // On every Event Save the Normaizled Coords
      objectStrategyBaseClass.setNormalizedObjectDim(
        FactoryUtilsClass.getObjDimRespectiveTarget(
          e as unknown as any,
          objectStrategyBaseClass.getInstance(),
          rendererClass.current.backGroundImageRef,
          rendererClass.current.canvasRef
        )
      );

      // Clean And Raised Event to external world
      cleanAndRaisedEvent(type, e, objectStrategyBaseClass);

      // ? If there are any overlays on objects just call function and everyting will be cleaned , happy path always
      // ? Only things is every instances are present in only our manager class do whatever you want but carefully work with the manager class
      ControllerCommonUtils.forceToRemoveTheOveloayOnInstance(
        objectsGeneratorInstanceManageClass.current
      );

      // if object selected and also edit mode then clear the other context menus and just show for the current instance
      // if user does rendered the canvas again need to allowed the movements of objects in edit mode
      if (type === "click" && props.canEdit) {
        if (!props.disabledObjects) {
          updateObjectsFreezingState(true);
          ControllerCommonUtils.forceToSetContextMenusVisibilities(
            objectsGeneratorInstanceManageClass.current,
            objectGeneratorClass,
            true
          );
        }
      }

      if (type === "click" && props.canAdd) {
        if (!props.disabledObjects) {
          updateObjectsFreezingState(true);
          ControllerCommonUtils.forceToSetContextMenusVisibilities(
            objectsGeneratorInstanceManageClass.current,
            objectGeneratorClass,
            true
          );
        }
      }
      if (type === "move") {
        onAddObjectToolTip(e, objectStrategyBaseClass);
        ControllerCommonUtils.forceToHandleOverlayObjectVisibility(
          objectsGeneratorInstanceManageClass.current,
          objectGeneratorClass,
          props.hoverTextVisibilityCode
        );
      }

      // ! Force to render the titles for objects on every events based on the visibilities codes
      ControllerCommonUtils.forceToRenderTitleOnInstance(
        objectsGeneratorInstanceManageClass.current
      );
      ControllerCommonUtils.forceToHandleObjectTitleVisibility(
        objectsGeneratorInstanceManageClass.current,
        props.objectTitleVisibilityCodes
      );
    });

    // Context Menu Event Listining
    objectStrategyBaseClass.setContextMenus(
      rawInput?.contextMenu,
      (type: string, e: FabricObject) => {
        // ! Set  the Normalized coordinates of each object whenever any contextMenu event Changes to the Base class, that can be usefull to send to backend
        objectStrategyBaseClass.setNormalizedObjectDim(
          FactoryUtilsClass.getObjDimRespectiveTarget(
            e as unknown as any,
            objectStrategyBaseClass.getInstance(),
            rendererClass.current.backGroundImageRef,
            rendererClass.current.canvasRef
          )
        );

        currentStrategyBaseClassInstance.current = null;

        // Off the Mouse Up event when on context menu clicked
        // canvasRef.off('mouse:up');

        // raised the context menus events
        raisedEvent(
          type,
          e,
          objectsGeneratorInstanceManageClass.current,
          objectStrategyBaseClass
        );
      }
    );

    // This is an small strategy patterns followed,  set to the generator
    objectGeneratorClass.setInstance(
      objectStrategyBaseClass,
      props.controllerSettings
    );
    objectGeneratorClass.onRenderInstance();
    currentStrategyBaseClassInstance.current = objectStrategyBaseClass;
    // if one of the flag true then allow edit and delete
    if (!props.disabledObjects) {
      ControllerCommonUtils.forceToSetContextMenusVisibilities(
        objectsGeneratorInstanceManageClass.current,
        objectGeneratorClass,
        true
      );
    }

    // ? Push the Instance of every new created object
    objectsGeneratorInstanceManageClass.current.pushInstance(
      objectGeneratorClass,
      objectStrategyBaseClass.getUUID()
    );
  }

  /**
   * ?Re-draw the object from the outer world with extras , because some objects are required some state/properties modifictions
   */
  function onReDraw(): void {
    const uuid = (props?.reDraw?.event as any)?.target?.__uuid;
    const getInstanceByUUID =
      objectsGeneratorInstanceManageClass.current?.getInstanceByUUID(uuid);

    getInstanceByUUID?.instance?.reDrawSelfWithExtra(uuid, props.reDraw.extras);
  }

  function onAddObjectToolTip(
    e: any,
    popInstance: ObjectStrategyBaseClass
  ): void {
    if (!props.isHoverAllowed) {
      return;
    }

    const coords = e.pointer;

    const getText = props.controllerSettings?.objectColorCodeStrategy?.find(
      (ins) => +ins?.code === +popInstance.getClassOrColorCode()
    );
    d3.select(".toolTipClass")
      .html(`${getText?.text ?? popInstance.getClassOrColorCode()}`)
      .style("position", "fixed")
      .style("display", "block")
      .transition()
      .ease(d3.easeBackOut)
      .style("top", `${coords?.y - 20}px`)
      .style("left", `${coords?.x + 60}px`);
  }

  /**
   * ?Raised Event to Out World
   * @param type
   * @param e
   * @param data
   */
  function raisedEvent(
    type: string,
    e: any | FabricObject,
    data: unknown,
    baseClassInstance?: ObjectStrategyBaseClass
  ): void {
    const gec = new ControllerGenericEventClass();
    gec.data = data;
    gec.event = e;
    gec.type = type;
    gec.baseClassInstance = baseClassInstance;
    props.eventChanges.emit(gec);
  }

  return (
    <div
      ref={canvasWrapperRef}
      className="position-relative grid justify-center"
      style={{ width: "100%", height: "100%" }}
    >
      <canvas ref={CanvasRef} id="canvas" />

      <div
        ref={toolTipRef}
        className="position-absolute toolTipClass tool-tip font-ib"
      ></div>
    </div>
  );
};

export default Controller;
