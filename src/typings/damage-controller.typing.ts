export type ContainerViewPerception = {
  sides: Array<ContainerPerspectiveType>;
};

export enum ContainerSideEnum {
  FRONT = 1,
  BACK = 2,
  RIGHT = 3,
  LEFT = 4,
  TOP = 5,
  BOTTOM = 6,
}

export type ContainerPerspectiveType = {
  side_id: ContainerSideEnum;
  perspectives: string[];
};

export enum Perspectives {
  FRONT_LEFT = "FTLT",
  FRONT_RIGHT = "FTRT",
  BACK_MAIN = "BK",
  RIGHT_MAIN = "RT",
  RIGHT_FRONT = "RTFT",
  RIGHT_BACK = "RTBK",
  LEFT_MAIN = "LT",
  LEFT_FRONT = "LTFT",
  TOP_MAIN = "TP",
}

export type ContainerSideSegmentInfo = {
  segment_index: number;
  segment_start: number;
  segment_end: number;
  segment_image_path: string;
  damages: Damages[];
};

export type Damages = {
  id?: string;
  class_id: Damagetype;
  cx: number;
  cy: number;
  width: number;
  height: number;
  confidence: number;
};

export type DamageRequestParams = {
  transaction_id?: string;
  container_number: string;
  entity_id: string;
  side: string | ContainerPerspectiveType;
  segment_id?: number;
  side_id?: string;
  is_minor_enabled?: boolean;
};

export enum Damagetype {
  MINOR_WARP = 0,
  WARP = 1,
  MINOR_SCRATCH = 2,
  MINOR_RUST = 3,
  RUST = 4,
  CUT_HOLE = 5,
  WELDED = 6,
  PILLAR_DAMAGE = 10,
  PATCH = 11,
}

export enum DamageCategory {
  MAJOR = 1,
  MINOR = 2,
  NO_DAMGE = 3,
}

export enum LegendsColor {
  MinorRust = "#0545e8",
  Rust = "#3ae805",
  MinorWarp = "#05e8d1",
  Warp = "#e80505",
  Minor_Scratch = "#e805d5",
  Welded = "#d1e805",
  CutHole = "#5a1d80",
  PILLAR_DAMAGE = "white",
  ADD_NEW = "#191919",
  HAS_MAJOR = "#FD8D82",
  HAS_MINOR = "#FFD973",
  HAS_NO_DAMAGE = "#C0C0C0",
  PATCH = "#A67B5B",
}

export type ContainerSideInfo = {
  stitched_image_path: string;
  stitched_image_predictions: Array<Damages>;
  container_level: number;
  container_position: number;
  side: number;
  meta_data: DamageMetaData[];
  segment_info: SegmentInfo[];
  heatmap_image_path: string;
  major_heatmap_image_path: string;
};

export type SegmentInfo = {
  segment_index: number;
  segment_start: number;
  segment_end: number;
  segment_image_path: string;
  damage_info: DamageInfo;
  isFadeOut?: boolean;
};

export type DamageInfo = {
  DAMAGE_COUNT: number;
  MINOR_WARP: number;
  WARP: number;
  MINOR_SCRATCH: number;
  MINOR_RUST: number;
  RUST: number;
  CUT_HOLE: number;
  WELD: number;
  PILLAR_DAMAGE: number;
  PATCH: number;
};

export type DamageMetaData = {
  container_no: string;
  container_damage_info: ContainerDamageInfo;
  side_damage_info: SideDamageInfo;
};

export type ContainerDamageInfo = {
  total_damage_count: number;
  minor_damages: number;
  major_damages: number;
};

export type SideDamageInfo = {
  side_damage_count: number;
  minor_warp: number;
  wrap: number;
  minor_scratch: number;
  minor_rust: number;
  rust: number;
  cut_hole: number;
  welded: number;
  pillar_damage: number;
  patch: number;
};

export type DamagePayload = DamageRequestParams & {
  damages?: Damages[];
};

export type SideViewParams = {
  entity_id: string;
  transaction_id: string;
  container_number: string;
};

export type SegmentPoints = {
  x: number;
  y: number;
  w: number;
  h: number;
  id?: number | string;
  colorCode: number;
  isFadeOut?: boolean;
  confidence?: number;
};

export enum DamageTypeEnum {
  MINOR_DAMAGE = 0,
  MAJOR_DAMAGE = 1,
}

export type DamageConfigTableType = {
  damage_name: string;
  damage_id: DamageTypeEnum;
  is_configured: boolean;
  is_notified: boolean;
  type_of_damage: number;
  color_code: string;
  created_timestamp?: number;
  dynamicClassList: Array<string>;
};

export type DamageConfigResponse = {
  notification?: Notifications;
  damage?: DamageConfig[];
};

export type DamageConfig = {
  damage_name: string;
  damage_id: DamageTypeEnum;
  is_configured: boolean;
  is_notified: boolean;
  type_of_damage: number;
  color_code: string;
};

export type Email = {
  is_enabled: boolean;
  data: EmailData[];
};

export type Notifications = {
  email: Email;
  dashboard: DashboardNotification;
};

export type EmailData = {
  id?: number;
  name: string;
  email_address: string;
  is_active?: boolean;
};

export type DashboardNotification = {
  is_enabled: boolean;
};

export type DamageDetailsType = {
  transaction_id: string;
  entity_id: string;
  container_number: string;
};

export enum DamageModuleEnum {
  VIEW,
  ADD_DAMAGES,
  ADD_HEATMAP,
}
