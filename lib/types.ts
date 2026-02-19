export type Category = "landing" | "banner" | "detail" | "editorial" | "app";
export type Preset = "stable" | "bold" | "experimental";
export type Mode = "draft" | "live";
export type Importance = "primary" | "secondary" | "minor";
export type BlockType = "image" | "text";
export type Ratio = "1:1" | "4:3" | "16:9" | "3:4";

export type Block = {
  id: string;
  type: BlockType;
  importance: Importance;
  dummy?: boolean;
  ratio?: Ratio;
  textLines?: number;
  content?: string;
  fileUrl?: string;
  fileMeta?: { width: number; height: number } | null;
};

export type LayoutInput = {
  blocks: Block[];
  category: Category;
  preset: Preset;
  mode: Mode;
  stressTest: boolean;
  lockLayout: boolean;
  lockedPlacements?: Placement[];
};

export type GridSpec = {
  columns: number;
  gap: number;
  outerMargin: number;
};

export type Placement = {
  id: string;
  colStart: number;
  colSpan: number;
  rowStart: number;
  rowSpan: number;
  minHeight: number;
  order: number;
};

export type LayoutSpec = {
  grid: GridSpec;
  placements: Placement[];
  typography: { base: number; lineHeight: number; scale: number[] };
  meta: {
    rationale: string[];
    rulesApplied: string[];
    detectedIssues: string[];
  };
};
