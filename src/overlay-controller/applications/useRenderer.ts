// function useRenderer() {
// //   viewCanvasRef: ElementRef<HTMLCanvasElement>;
// //   constrollerSettings: ControllerSettings;
// //   objectsGeneratorInstanceManageClass = new ObjectsGeneratorInstanceManageClass();

// //   isZoomEnabled: boolean;

// //   backGroundImageRef: fabric.Image;
// //   heapMapBackgroundRef: fabric.Image;

// //   delta = new fabric.Point(0, 0);
//   constructor() {
//     super();
//   }
//   // fabric constructor

//   get getCustomCanvasConfig(): CustomCanvasConfig {
//     const config: CustomCanvasConfig = {
//       canvas_id: '12',
//       canvasHeight: this.canvasWrapperRef?.nativeElement?.offsetHeight,
//       canvasWidth: this.canvasWrapperRef?.nativeElement?.offsetWidth,
//       canvasBackground: 'red',
//     };

//     this.canvasConfig = config;

//     return config;
//   }

//   // Just for callbacks
//   onAfterMouseChange(): void {}
//   onAfterCanvasInit(): void {}

//   registerMouseMove(): void {
//     this.canvasRef?.on('mouse:move', (e) => {
//       requestAnimationFrame(() => {
//         if (this.isPanEnabled) {
//           this.onPanCanvas(e);
//         }
//         if (this.isAddRectBox) {
//           this.onCanvasMouseMove(e);
//         }
//       });
//     });
//   }

//   // Init the Canvas
//   init(canvasWrapperRef: ElementRef<HTMLDivElement>, canvasRef: ElementRef<HTMLCanvasElement>, settings?: ControllerSettings, context?: any): void {
//     this.canvasWrapperRef = canvasWrapperRef;
//     this.viewCanvasRef = canvasRef;
//     this.initialZoom = 0;
//     this.pausePanning = false;
//     this.zoomStartScale = 0;
//     this.constrollerSettings = settings;

//     const ref = setTimeout(() => {
//       this.onSetCanvasConfigAndRender(settings?.viewImage);
//       clearTimeout(ref);
//     }, 100);
//   }

//   setOverlayBackground(ctrBGView: CtrBGView): void {
//     fabric.Image.fromURL(ctrBGView?.path, (image) => {
//       let scaleX = this.canvasRef.width / image.width;
//       let scaleY = this.canvasRef.height / image.height;
//       let X = 0;
//       let Y = 0;

//       if (this.constrollerSettings.controllerView === ControllerViewType.OVERLAY_VIEW_MODE) {
//         const isFit = true;
//         if (isFit) {
//           const scaleXToFit = this.canvasRef.width / image.width;
//           const scaleYToFit = this.canvasRef.height / image.height;
//           const minScaleToFit = Math.min(scaleXToFit, scaleYToFit);
//           scaleX = minScaleToFit;
//           scaleY = minScaleToFit;
//         }
//         X = (this.canvasRef.width - image.width * scaleX) / 2;
//         Y = (this.canvasRef.height - image.height * scaleY) / 2;
//       }

//       this.canvasRef?.setBackgroundImage(
//         image,
//         () => {
//           this.backGroundImageRef = image;
//           this.registerCanvasEvents();
//           this.onAfterCanvasInit();
//           this.canvasRef.requestRenderAll();
//         },
//         {
//           hoverCursor: 'pointer',
//           moveCursor: 'pointer',
//           originX: 'left',
//           originY: 'top',
//           top: X,
//           left: Y,
//           scaleX,
//           scaleY,
//         }
//       );
//     });
//   }

//   setToggleBackground(ctrBGView: CtrBGView, path: string): void {
//     fabric.Image.fromURL(path, (image) => {
//       let scaleX = this.canvasRef?.width / image.width;
//       let scaleY = this.canvasRef?.height / image.height;
//       let X = 0;
//       let Y = 0;

//       if (this.constrollerSettings?.controllerView === ControllerViewType.OVERLAY_VIEW_MODE) {
//         const isFit = true;
//         if (isFit) {
//           const scaleXToFit = this.canvasRef?.width / image.width;
//           const scaleYToFit = this.canvasRef?.height / image.height;
//           const minScaleToFit = Math.min(scaleXToFit, scaleYToFit);
//           scaleX = minScaleToFit;
//           scaleY = minScaleToFit;
//         }
//         X = (this.canvasRef?.width - image.width * scaleX) / 2;
//         Y = (this.canvasRef?.height - image.height * scaleY) / 2;
//       }

//       this.canvasRef?.setBackgroundImage(
//         image,
//         () => {
//           this.heapMapBackgroundRef = image;
//           this.backGroundImageRef = image;
//           this.canvasRef.requestRenderAll();
//         },
//         {
//           hoverCursor: 'pointer',
//           moveCursor: 'pointer',
//           originX: 'left',
//           originY: 'top',
//           top: Y,
//           left: X,
//           scaleX,
//           scaleY,
//         }
//       );
//     });
//   }

//   setZoomEnabled(f: boolean): void {
//     this.isZoomEnabled = f;
//   }

//   setPanEnabled(f: boolean): void {
//     this.isPanEnabled = f;
//   }

//   setCanAddRect(f: boolean): void {
//     this.isAddRectBox = f;
//   }

//   clean(): void {
//     if (!this.canvasRef) {
//       return;
//     }

//     this.canvasRef?.dispose();
//   }

//   onMouseMoveEnd(arg0: unknown): void {}
//   requestRenderAll(): void {}

//   onSetCanvasConfigAndRender(background?: CtrBGView): void {
//     this.canvasRef = new fabric.Canvas(this.viewCanvasRef?.nativeElement, {
//       preserveObjectStacking: true,
//       selection: false,
//       controlsAboveOverlay: true,
//       centeredScaling: true,
//       allowTouchScrolling: true,
//       hoverCursor: 'pointer',
//       moveCursor: 'pointer',
//       // renderOnAddRemove: false,
//     });
//     this.setOverlayBackground(background);

//     // Set canvas dimensions to fit the container
//     const containerWidth = this.getCustomCanvasConfig?.canvasWidth;
//     const containerHeight = this.getCustomCanvasConfig?.canvasHeight; // Assuming you also have a height for the container
//     this.canvasRef.setDimensions({ width: containerWidth, height: containerHeight });

//     // Calculate the initial zoom level to fit the canvas in the container
//     const canvasWidth = this.canvasRef.getWidth();
//     const canvasHeight = this.canvasRef.getHeight();
//     const ratio = canvasWidth / canvasHeight;
//     const scale = canvasWidth / containerWidth;
//     const zoom = scale;

//     // Set the viewport transform to adjust zoom level and center the canvas
//     this.canvasRef.setViewportTransform([zoom, 0, 0, zoom, 0, 0]);
//     this.canvasRef.calcOffset();

//     // Set background overlay

//     // Enable object caching
//     fabric.Object.prototype.objectCaching = true;
//   }

//   registerCanvasEvents(): void {
//     this.canvasRef.setCursor('pointer');
//     this.onRegisterMobileGuesturesEvents();

//     this.canvasRef.on('mouse:wheel', (e) => {
//       requestAnimationFrame(() => {
//         this.onTransformCanvas(e?.e);
//       });
//     });

//     this.canvasRef.on('selection:created', (e) => {
//       this.pausePanning = true;
//     });

//     this.canvasRef.on('selection:cleared', (e) => {
//       this.pausePanning = false;
//     });

//     this.canvasRef.on('mouse:down', (e) => {
//       this.onCanvasMouseDown(e);
//     });

//     this.canvasRef.on('object:moving', (e) => {
//       this._avoidObjectMovingOutsideOfBoundaries(e);
//     });

//     this.canvasRef.on('object:scaling', (e) => {
//       this._avoidObjectMovingOutsideOfBoundaries(e);
//     });

//     this.canvasRef.on('mouse:up', (e: fabric.IEvent<MouseEvent>) => {
//       this.onCanvasMouseUp();
//       this.lastX = e.e.x;
//       this.lastY = e.e.y;
//     });
//   }

//   onCanvasMouseDown(e: fabric.IEvent<MouseEvent>): void {
//     const pointer = this.canvasRef?.getPointer(e.e);
//     this.origX = pointer.x;
//     this.origY = pointer.y;
//     this.lastClientX = pointer.x;
//     this.lastClientY = pointer.y;

//     if (this.constrollerSettings.controllerView === ControllerViewType.OVERLAY_VIEW_MODE) {
//       this.registerMouseMove();
//       this.isAddRectBox = false;
//     }

//     if (this.constrollerSettings.controllerView === ControllerViewType.DRAWING_MODE) {
//       // If Pan Enabled But Add Damage Mode so just allow the pan do not allow to add new object ok , be careful
//       if (this.isPanEnabled) {
//         this.registerMouseMove();
//         this.isAddRectBox = false;
//         return;
//       }

//       // if No Pan Enabled then just and also someting object is selected to then allow to draw the new objects
//       if (!this.canvasRef.getActiveObject()) {
//         // Have to give some delay to start the object drawing helps to capture the first component input binded values instead the canvas event , so we can allowed or disallowed the paiting
//         setTimeout(() => {
//           this.onAfterMouseChange();
//           this.registerMouseMove();
//         }, 10);
//       }
//     }
//   }
//   onCanvasMouseUp(): void {
//     this.pausePanning = false;
//     this.canvasRef.off('mouse:move');
//   }
//   onCanvasMouseMove(e: fabric.IEvent<MouseEvent>): void {
//     const pointer = this.canvasRef.getPointer(e.e);
//     const activeObject = this.canvasRef.getActiveObject() as fabric.Rect;
//     if (activeObject) {
//       const width = pointer.x - activeObject.left;
//       const height = pointer.y - activeObject.top;
//       this.currentH = height;
//       this.currentW = width;

//       activeObject.set({ width, height });
//       this.canvasRef.renderAll();
//     }
//   }
//   onTransformCanvas(e: WheelEvent): void {
//     if (!this.isZoomEnabled) {
//       return;
//     }
//     this.canvasRef.setCursor('pointer');
//     const delta = e?.deltaY;
//     let zoom = this.canvasRef.getZoom();
//     if (zoom < 1) {
//       zoom = 1;
//     }
//     zoom *= 0.999 ** delta;
//     this.canvasRef.zoomToPoint({ x: e.offsetX, y: e.offsetY }, zoom);
//     this.initialZoom = zoom;
//     e?.preventDefault();
//     e?.stopPropagation();
//     this.canvasRef.renderAll();
//   }
//   onPanCanvas(e: fabric.IEvent<MouseEvent>): void {
//     this.currentX = e.e.x;
//     this.currentY = e.e.y;
//     this.xChange = this.currentX - this.lastX;
//     this.yChange = this.currentY - this.lastY;

//     const canvas = this.canvasRef ?? null;
//     if (canvas) {
//       if (Math.abs(this.currentX - this.lastX) <= 100 && Math.abs(this.currentY - this.lastY) <= 100) {
//         this.delta.x = this.xChange;
//         this.delta.y = this.yChange;
//         canvas.relativePan(this.delta);
//       }
//     }

//     this.lastX = e.e.x;
//     this.lastY = e.e.y;
//   }
//   onRegisterMobileGuesturesEvents(): void {
//     // tslint:disable-next-line:variable-name
//     this.canvasRef.on('touch:gesture', (e) => {
//       const evt = e as any;
//       if (evt?.e?.touches && evt?.e?.touches.length === 2) {
//         this.pausePanning = true;
//         const point = new fabric.Point(evt.self?.x, evt.self?.y);
//         if (evt.self?.state === 'start') {
//           this.zoomStartScale = this.canvasRef.getZoom();
//         }
//         const delta = this.zoomStartScale * evt?.self?.scale;
//         this.canvasRef.zoomToPoint(point, delta);

//         this.pausePanning = false;
//       }
//     });

//     this.canvasRef.on('touch:drag', (e) => {
//       const evt = e as any;
//       if (this.pausePanning === false && undefined !== evt.self.x && undefined !== evt.self.y) {
//         this.currentX = evt.self.x;
//         this.currentY = evt.self.y;
//         this.xChange = this.currentX - this.lastX;
//         this.yChange = this.currentY - this.lastY;

//         if (Math.abs(this.currentX - this.lastX) <= 120 && Math.abs(this.currentY - this.lastY) <= 120) {
//           const delta = new fabric.Point(this.xChange, this.yChange);
//           this.canvasRef?.relativePan(delta);
//         }

//         this.lastX = evt.self.x;
//         this.lastY = evt.self.y;
//       }
//     });
//   }
//   private _avoidObjectMovingOutsideOfBoundaries(e: fabric.IEvent<Event>): void {
//     const obj = e.target;

//     obj.setCoords();
//     const curZoom = obj.canvas.getZoom();

//     //
//     // if object is too big ignore
//     if (obj.getScaledHeight() > obj.canvas.height || obj.getScaledWidth() > obj.canvas.width) {
//       return;
//     }

//     // top-left  corner
//     if (obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0) {
//       obj.top = Math.max(obj.top * curZoom, obj.top * curZoom - obj.getBoundingRect().top) / curZoom;
//       obj.left = Math.max(obj.left * curZoom, obj.left * curZoom - obj.getBoundingRect().left) / curZoom;
//     }
//     // bot-right corner
//     if (obj.getBoundingRect().top + obj.getBoundingRect().height > obj.canvas.height || obj.getBoundingRect().left + obj.getBoundingRect().width > obj.canvas.width) {
//       obj.top = Math.min(obj.top * curZoom, obj.canvas.height - obj.getBoundingRect().height + obj.top * curZoom - obj.getBoundingRect().top) / curZoom;
//       obj.left = Math.min(obj.left * curZoom, obj.canvas.width - obj.getBoundingRect().width + obj.left * curZoom - obj.getBoundingRect().left) / curZoom;
//     }
//   }
// }

// export default useRenderer;
