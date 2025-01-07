/* eslint-disable max-lines */
import {
  ObjectColorCodeStrategy,
  ControllerSettings,
  ControllerObjectData,
  ContextMenuAction,
  ControllerViewType,
} from "../overlay-controller/typings/platform-typings";
import {
  ContainerSideInfo,
  ContainerSideSegmentInfo,
  DamageCategory,
  DamageConfig,
  DamageInfo,
  Damagetype,
  LegendsColor,
  SegmentInfo,
  SegmentPoints,
} from "../typings/damage-controller.typing";
import { color } from "d3";
import { cloneDeep, isPropEmpty } from "../utils/CommonUtils";

export class SegmentParserClass {
  MINOR_CODES = [
    Damagetype.MINOR_WARP,
    Damagetype.MINOR_SCRATCH,
    Damagetype.MINOR_RUST,
  ];

  legendsList: ObjectColorCodeStrategy[] = [
    {
      code: 0,
      color: LegendsColor.MinorWarp,
      text: "Minor Warp",
    },
    {
      code: 1,
      color: LegendsColor.Warp,
      text: "Warp",
    },
    {
      code: 2,
      color: LegendsColor.Minor_Scratch,
      text: "Minor Scratch",
    },
    {
      code: 3,
      color: LegendsColor.MinorRust,
      text: "Minor Rust",
    },
    {
      code: 3,
      color: LegendsColor.MinorRust,
      text: "Minor Rust",
    },
    {
      code: 4,
      color: LegendsColor.Rust,
      text: "Rust",
    },
    {
      code: 5,
      color: LegendsColor.CutHole,
      text: "Cut Hole",
    },
    {
      code: 6,
      color: LegendsColor.Welded,
      text: "Weld",
    },
    {
      code: 10,
      color: LegendsColor.PILLAR_DAMAGE,
      text: "Pillar Damage",
    },
    {
      code: 8,
      color: LegendsColor.ADD_NEW,
    },
    {
      code: 9,
      color: LegendsColor.HAS_MAJOR,
    },
    {
      code: 12,
      color: LegendsColor.HAS_MINOR,
    },
    {
      code: 11,
      color: LegendsColor.PATCH,
      text: "Patch",
    },
    {
      code: 14,
      color: LegendsColor.HAS_NO_DAMAGE,
    },
  ];

  getImageDim(src: string): Promise<Array<number>> {
    return new Promise((resolve, reject) => {
      if (!src) {
        reject(new Error("Image path is Empty"));
      }

      const image = new Image();

      image.onerror = (err) => {
        reject(err);
      };

      image.onload = () => {
        resolve([image.width, image.height]);
      };

      image.src = src;
    });
  }

  isValidImage(src: string): Promise<boolean> {
    return new Promise((rv, rj) => {
      const img = new Image();
      img.onerror = (err) => {
        rj(err);
      };

      img.onload = () => {
        rv(null);
      };
      img.src = src;
    });
  }

  findMissingSegments(
    boxWidth: number,
    segments: SegmentInfo[]
  ): SegmentInfo[] {
    const missingSegments = [];
    const cloned = cloneDeep(segments);
    cloned.sort((a, b) => a.segment_start - b.segment_start); // Sort cloned by start point

    let lastEnd = 0;
    let missingIndex = 0; // Initialize missing segment index counter

    // eslint-disable-next-line no-restricted-syntax
    for (const segment of cloned) {
      if (segment.segment_start > lastEnd) {
        missingSegments.push({
          segment_index: missingIndex,
          segment_start: lastEnd,
          segment_end: segment.segment_start,
          segment_image_path: "",
          damage_info: {},
          isFadeOut: true,
        });
        missingIndex += 1; // Increment index only when a missing segment is added
      }
      lastEnd = Math.max(lastEnd, segment.segment_end);
    }

    // Calculate the starting index for missing cloned
    const lastIndex =
      cloned.length > 0 ? cloned[cloned.length - 1].segment_index + 1 : 0;

    if (lastEnd < boxWidth) {
      missingSegments.push({
        segment_index: lastIndex,
        segment_start: lastEnd,
        segment_end: boxWidth,
        segment_image_path: "",
        damage_info: {},
        isFadeOut: true,
      });
    }

    return missingSegments;
  }

  mergeSegmentsWithMissingSegments(
    segments: SegmentInfo[],
    missingSegments: SegmentInfo[]
  ): SegmentInfo[] {
    // Concatenate the missing segments with the original segments
    const mergedSegments = [
      ...segments.sort((a, b) => +a.segment_index - +b?.segment_index),
      ...missingSegments,
    ];

    // Sort the merged list based on the segment_start property
    // mergedSegments.sort((a, b) => a.segment_start - b.segment_start);

    // // Adjust the segment_index property for each segment
    // for (let i = 0; i < mergedSegments.length; i++) {
    //   mergedSegments[i].segment_index = i;
    // }

    return mergedSegments;
  }

  normalizedSegmentCoords(
    containerSideInfo: ContainerSideInfo
  ): Promise<Array<SegmentPoints>> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise((resolve, reject) => {
      try {
        if (isPropEmpty(containerSideInfo)) {
          return;
        }

        this.getImageDim(containerSideInfo?.stitched_image_path)?.then(
          (imgDim) => {
            const resSegments = this.findMissingSegments(
              imgDim[0],
              containerSideInfo?.segment_info
            );
            const finalSegments = this.mergeSegmentsWithMissingSegments(
              containerSideInfo?.segment_info,
              resSegments
            );
            const parsedNormizedList: SegmentPoints[] = [];

            // eslint-disable-next-line no-restricted-syntax
            for (const segment of finalSegments) {
              const normalizedCoords: SegmentPoints = {
                x: segment.segment_start / imgDim[0],
                y: 0,
                w: (segment.segment_end - segment.segment_start) / imgDim[0],
                h: 1,
                id: segment?.segment_index,
                colorCode: 2 ?? 0,
                isFadeOut: segment?.isFadeOut,
              };
              parsedNormizedList?.push(normalizedCoords);
            }

            resolve(parsedNormizedList);
          }
        );
      } catch {
        reject(new Error("Someting went worng...."));
      }
    });
  }

  // Temp generate the dummy data for testing
  generateSegments(
    containerSideInfo: ContainerSideInfo,
    damageConfig: DamageConfig[]
  ): ControllerSettings {
    const clonedContainer = cloneDeep(containerSideInfo);

    const controllerObjectDataList: ControllerObjectData[] = [];
    const heatMapDataList = [];
    const getHoverTextDynamic = (damageInfo: DamageInfo) => {
      const hoverTexts = [];
      damageConfig.forEach((config) => {
        if (config.is_configured) {
          hoverTexts.push({
            color: config.color_code,
            text: !isPropEmpty(damageInfo)
              ? `${config?.damage_name}(${damageInfo[config?.damage_name]})`
              : undefined,
            count: !isPropEmpty(damageInfo)
              ? damageInfo[config?.damage_name]
              : undefined,
            colorCode: config?.type_of_damage === DamageCategory.MAJOR ? 9 : 12,
          });
        }
      });
      return hoverTexts?.filter((ht) => ht?.count > 0);
    };

    this.normalizedSegmentCoords(clonedContainer)?.then((segmentsList) => {
      for (let i = 0; i < segmentsList?.length; i += 1) {
        const damageInfo = containerSideInfo?.segment_info?.find(
          (damgeInfo) => damgeInfo?.segment_index === segmentsList[i]?.id
        )?.damage_info;
        const hasMajor = getHoverTextDynamic(damageInfo)?.filter(
          (d) => !this.MINOR_CODES.includes(d.type)
        );
        const hasMinor = getHoverTextDynamic(damageInfo)?.filter((d) =>
          this.MINOR_CODES.includes(d.type)
        );
        const isMinorOnly = hasMajor.length === 0 && hasMinor.length !== 0;
        const isMajorOnly = hasMajor.length !== 0;
        const isNoDamage = hasMajor.length === 0 && hasMinor?.length === 0;
        let text = "";
        let codes = [];
        let colorCode = 0;
        if (isMinorOnly) {
          text = "Minor Damage";
          codes = [
            DamageCategory.MINOR,
            DamageCategory.NO_DAMGE,
            DamageCategory.MAJOR,
          ];
          colorCode = 12;
        }
        if (isMajorOnly) {
          text = "Major Damage";
          codes = [DamageCategory.MAJOR];
          colorCode = 9;
        }
        if (isNoDamage) {
          text = "No Damage";
          codes = [DamageCategory.NO_DAMGE];
          colorCode = 14;
        }

        controllerObjectDataList?.push({
          x: segmentsList?.[i].x,
          y: segmentsList?.[i].y,
          w: segmentsList?.[i].w,
          h: segmentsList?.[i].h,
          strokeWidth: 1, // Random stroke width between 1 and 5
          strokeColor: "#FFFFFF", // Random stroke color
          id: segmentsList?.[i]?.id,
          title: {
            text,
            visibilityCodes: codes,
          },
          contextMenu: [
            {
              imagePath: "assets/images/controllers/controller_cancel.svg",
              name: ContextMenuAction.DELETE,
              visibility: true,
            },
            {
              imagePath: "assets/images/controllers/controller_save.svg",
              name: ContextMenuAction.SAVE,
              visibility: true,
            },
          ], // Empty context menu for now
          mutated: Math.random() < 0.5, // Randomly set mutated property to true or false
          hasControl: false,
          hoverText: getHoverTextDynamic(damageInfo),
          classOrColorCode: colorCode,
          isFadeOut: segmentsList?.[i]?.isFadeOut,
          confidence: segmentsList?.[i]?.confidence,
        });
      }
    });

    this.heatMapCords(clonedContainer)?.then((segmentsList) => {
      for (let i = 0; i < segmentsList?.length; i += 1) {
        const damageInfo = containerSideInfo?.segment_info?.find(
          (damgeInfo) => damgeInfo?.segment_index === segmentsList[i]?.id
        )?.damage_info;
        const hasMajor = getHoverTextDynamic(damageInfo)?.filter(
          (d) => !this.MINOR_CODES.includes(d.type)
        );
        const hasMinor = getHoverTextDynamic(damageInfo)?.filter((d) =>
          this.MINOR_CODES.includes(d.type)
        );
        const isMinorOnly = hasMajor.length === 0 && hasMinor.length !== 0;
        const isMajorOnly = hasMajor.length !== 0;
        const isNoDamage = hasMajor.length === 0 && hasMinor?.length === 0;
        let text = "";
        let codes = [];
        if (isMinorOnly) {
          text = "Minor Damage";
          codes = [
            DamageCategory.MINOR,
            DamageCategory.NO_DAMGE,
            DamageCategory.MAJOR,
          ];
        }
        if (isMajorOnly) {
          text = "Major Damage";
          codes = [DamageCategory.MAJOR];
        }
        if (isNoDamage) {
          text = "No Damage";
          codes = [DamageCategory.NO_DAMGE];
        }
        heatMapDataList?.push({
          x: segmentsList?.[i].x,
          y: segmentsList?.[i].y,
          w: segmentsList?.[i].w,
          h: segmentsList?.[i].h,
          strokeWidth: 2, // Random stroke width between 1 and 5
          strokeColor: hasMajor ? "red" : "yellow", // Random stroke color
          id: segmentsList?.[i]?.id,
          title: {
            text,
            visibilityCodes: codes,
          },
          contextMenu: [
            {
              imagePath: "assets/images/controllers/controller_cancel.svg",
              name: ContextMenuAction.DELETE,
              visibility: false,
            },
            {
              imagePath: "assets/images/controllers/controller_save.svg",
              name: ContextMenuAction.SAVE,
              visibility: false,
            },
          ], // Empty context menu for now
          mutated: Math.random() < 0.5, // Randomly set mutated property to true or false
          hasControl: false,
          hoverText: getHoverTextDynamic(damageInfo),
          classOrColorCode: segmentsList?.[i]?.colorCode,
          confidence: segmentsList?.[i]?.confidence,
        });
      }
    });

    const settings: ControllerSettings = {
      objectsData: controllerObjectDataList,
      heatMapData: heatMapDataList,
      controllerView: ControllerViewType.OVERLAY_VIEW_MODE,
      viewImage: {
        path: clonedContainer?.stitched_image_path,
        heatmap_image_path: clonedContainer?.heatmap_image_path,
        isFitToView: true,
      },
      alphaOnHover: true,
      objectColorCodeStrategy: this.legendsList,
      stitched_image_predictions: containerSideInfo?.stitched_image_predictions,
    };

    return settings;
  }

  normalizedDamagesCoors(
    containerSideSegmentInfo: ContainerSideSegmentInfo
  ): Promise<Array<SegmentPoints>> {
    return new Promise((resolve, reject) => {
      try {
        if (isPropEmpty(containerSideSegmentInfo)) {
          return;
        }

        this.getImageDim(containerSideSegmentInfo?.segment_image_path)?.then(
          (imgDim) => {
            const parsedNormizedList: SegmentPoints[] = [];

            for (
              let i = 0;
              i < containerSideSegmentInfo.damages?.length;
              i += 1
            ) {
              const segment = containerSideSegmentInfo.damages?.[i];
              const transFormedH = segment?.height * imgDim[1];
              const transformedW = segment?.width * imgDim[0];
              const exactX = segment.cx * imgDim[0] - transformedW / 2;
              const exactY = segment.cy * imgDim[1] - transFormedH / 2;

              const normalizedCoords: SegmentPoints = {
                x: exactX / imgDim[0],
                y: exactY / imgDim[1],
                w: segment?.width,
                h: segment?.height,
                id: segment?.id,
                colorCode: segment?.class_id,
                confidence: segment?.confidence,
              };

              parsedNormizedList?.push(normalizedCoords);
            }

            resolve(parsedNormizedList);
          }
        );
      } catch {
        reject(new Error("Someting went worng...."));
      }
    });
  }

  heatMapCords(
    containerSideSegmentInfo: ContainerSideInfo
  ): Promise<Array<SegmentPoints>> {
    return new Promise((resolve, reject) => {
      try {
        if (isPropEmpty(containerSideSegmentInfo)) {
          return;
        }

        this.getImageDim(containerSideSegmentInfo?.stitched_image_path)?.then(
          (imgDim) => {
            const parsedNormizedList: SegmentPoints[] = [];

            for (
              let i = 0;
              i < containerSideSegmentInfo?.stitched_image_predictions?.length;
              i += 1
            ) {
              const segment =
                containerSideSegmentInfo?.stitched_image_predictions?.[i];
              // eslint-disable-next-line max-lines
              const transFormedH = segment?.height * imgDim[1];
              const transformedW = segment?.width * imgDim[0];
              const exactX = segment.cx * imgDim[0] - transformedW / 2;
              const exactY = segment.cy * imgDim[1] - transFormedH / 2;

              const normalizedCoords: SegmentPoints = {
                x: exactX / imgDim[0],
                y: exactY / imgDim[1],
                w: segment?.width,
                h: segment?.height,
                id: segment?.id,
                colorCode: segment?.class_id,
                confidence: segment?.confidence,
              };

              parsedNormizedList?.push(normalizedCoords);
            }

            resolve(parsedNormizedList);
          }
        );
      } catch {
        reject(new Error("Someting went worng...."));
      }
    });
  }

  getObjectColorCallBack(colorCode: number): string {
    return this.legendsList.find((ll) => ll.code === colorCode).color;
  }

  generateSegment(
    containerSideSegmentInfo: ContainerSideSegmentInfo,
    ll?: ObjectColorCodeStrategy[]
  ): ControllerSettings {
    const clonedContainer = cloneDeep(containerSideSegmentInfo);
    const controllerObjectDataList = [];

    this.normalizedDamagesCoors(containerSideSegmentInfo).then(
      (segmentsList) => {
        for (let i = 0; i < segmentsList?.length; i += 1) {
          controllerObjectDataList?.push({
            x: segmentsList?.[i].x,
            y: segmentsList?.[i].y,
            h: segmentsList?.[i].h,
            w: segmentsList?.[i].w,
            strokeWidth: 2, // Random stroke width between 1 and 5
            strokeColor: `#${Math.floor(Math.random() * 16777215).toString(
              16
            )}`, // Random stroke color
            id: segmentsList?.[i]?.id,
            title: undefined,
            contextMenu: [
              {
                imagePath: "assets/images/controllers/Delete.svg",
                name: ContextMenuAction.DELETE,
                visibility: false,
              },
              {
                imagePath: "assets/images/controllers/Edit.svg",
                name: ContextMenuAction.SAVE,
                visibility: false,
              },
            ], // Empty context menu for now
            mutated: false, // Randomly set mutated property to true or false
            hasControl: false,
            classOrColorCode: segmentsList?.[i]?.colorCode,
            confidence: segmentsList?.[i]?.confidence,
          });
        }
      }
    );

    const settings: ControllerSettings = {
      objectsData: controllerObjectDataList,
      controllerView: ControllerViewType.DRAWING_MODE,
      viewImage: {
        path: clonedContainer.segment_image_path,
        heatmap_image_path: null,
        isFitToView: true,
      },
      alphaOnHover: false,
      objectColorCodeStrategy: ll ?? this.legendsList,
    };
    return settings;
  }
}
