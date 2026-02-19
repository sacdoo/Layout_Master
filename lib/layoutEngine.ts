import {
  Block,
  Category,
  LayoutInput,
  LayoutSpec,
  Placement,
  Preset
} from "./types";

const baselineScale = [8, 16, 24, 32, 48, 64];

const ratioToNumber = (ratio: Block["ratio"]) => {
  switch (ratio) {
    case "1:1":
      return 1;
    case "4:3":
      return 4 / 3;
    case "16:9":
      return 16 / 9;
    case "3:4":
      return 3 / 4;
    default:
      return 1;
  }
};

const getColumns = (category: Category, preset: Preset) => {
  if (category === "banner") return preset === "stable" ? 6 : 8;
  if (category === "editorial") return 6;
  if (category === "app") return 4;
  return 12;
};

const getGap = (category: Category, preset: Preset) => {
  if (category === "app") return 12;
  if (preset === "stable") return 16;
  if (preset === "bold") return 20;
  return 24;
};

const outerMarginFromColumns = (columns: number) =>
  Math.min(96, Math.max(24, columns * 4 + 8));

const getTypography = (category: Category) => {
  if (category === "editorial") {
    return { base: 16, lineHeight: 1.6, scale: [16, 20, 28, 40, 56] };
  }
  if (category === "app") {
    return { base: 14, lineHeight: 1.5, scale: [14, 16, 20, 24, 32] };
  }
  return { base: 16, lineHeight: 1.55, scale: [16, 20, 28, 36, 48] };
};

const spanByImportance = (
  category: Category,
  preset: Preset,
  importance: Block["importance"]
) => {
  const table: Record<Category, Record<Preset, Record<Block["importance"], number>>> = {
    landing: {
      stable: { primary: 8, secondary: 4, minor: 3 },
      bold: { primary: 9, secondary: 4, minor: 2 },
      experimental: { primary: 6, secondary: 5, minor: 3 }
    },
    banner: {
      stable: { primary: 4, secondary: 3, minor: 2 },
      bold: { primary: 6, secondary: 4, minor: 2 },
      experimental: { primary: 5, secondary: 3, minor: 2 }
    },
    detail: {
      stable: { primary: 7, secondary: 5, minor: 3 },
      bold: { primary: 7, secondary: 5, minor: 3 },
      experimental: { primary: 6, secondary: 6, minor: 3 }
    },
    editorial: {
      stable: { primary: 4, secondary: 3, minor: 2 },
      bold: { primary: 4, secondary: 3, minor: 2 },
      experimental: { primary: 3, secondary: 3, minor: 2 }
    },
    app: {
      stable: { primary: 4, secondary: 2, minor: 2 },
      bold: { primary: 4, secondary: 2, minor: 2 },
      experimental: { primary: 4, secondary: 2, minor: 2 }
    }
  };

  return table[category][preset][importance];
};

const estimateRowSpan = (
  block: Block,
  stressTest: boolean,
  lockLayout: boolean
) => {
  let base = block.type === "image" ? 4 : 2;
  if (block.type === "text") {
    if ((block.textLines ?? 2) > 4) base += 1;
    if (stressTest) base += 1;
  }
  if (block.type === "image") {
    const ratio = block.ratio ? ratioToNumber(block.ratio) : 1;
    if (ratio < 1) base += 1;
    if (stressTest) base += 1;
  }
  if (lockLayout) base = Math.max(2, Math.min(base, 5));
  return base;
};

const estimateMinHeight = (block: Block, rowSpan: number) => {
  const base = block.type === "image" ? 120 : 80;
  return base + rowSpan * 18;
};

const layoutSequential = (
  blocks: Block[],
  columns: number,
  stressTest: boolean,
  lockLayout: boolean,
  category: Category,
  preset: Preset
) => {
  const placements: Placement[] = [];
  let currentCol = 1;
  let currentRow = 1;
  let rowMaxSpan = 0;

  const hasPrimaryImage =
    category === "detail" && blocks.some((block) => block.type === "image");

  blocks.forEach((block, index) => {
    let colSpan = spanByImportance(category, preset, block.importance);

    if (category === "detail" && hasPrimaryImage) {
      if (block.type === "image" && block.importance === "primary") {
        colSpan = 7;
      }
      if (block.type === "text" && block.importance === "primary") {
        colSpan = 5;
      }
    }

    colSpan = Math.min(columns, colSpan);

    if (currentCol + colSpan - 1 > columns) {
      currentRow += Math.max(1, rowMaxSpan);
      currentCol = 1;
      rowMaxSpan = 0;
    }

    const rowSpan = estimateRowSpan(block, stressTest, lockLayout);
    rowMaxSpan = Math.max(rowMaxSpan, rowSpan);

    placements.push({
      id: block.id,
      colStart: currentCol,
      colSpan,
      rowStart: currentRow,
      rowSpan,
      minHeight: estimateMinHeight(block, rowSpan),
      order: index
    });

    currentCol += colSpan;
    if (currentCol > columns) {
      currentRow += Math.max(1, rowMaxSpan);
      currentCol = 1;
      rowMaxSpan = 0;
    }
  });

  return placements;
};

export const layoutEngine = (input: LayoutInput): LayoutSpec => {
  const { blocks, category, preset, stressTest, lockLayout, lockedPlacements } =
    input;
  const columns = getColumns(category, preset);
  const gap = getGap(category, preset);
  const outerMargin = outerMarginFromColumns(columns);
  const typography = getTypography(category);

  const meta = {
    rationale: [] as string[],
    rulesApplied: [] as string[],
    detectedIssues: [] as string[]
  };

  meta.rationale.push(
    `${category} 카테고리는 기본 ${columns}컬럼 그리드를 사용합니다.`
  );
  meta.rationale.push(
    `preset ${preset}는 간격 ${gap}px, baseline 8pt 스케일을 따릅니다.`
  );

  if (category === "landing") {
    meta.rulesApplied.push("Primary는 6~9컬럼 폭으로 상단에 배치");
  }
  if (category === "banner") {
    meta.rulesApplied.push("비대칭 배치와 큰 타이포 우선");
  }
  if (category === "detail") {
    meta.rulesApplied.push("이미지/텍스트 2컬럼 구조를 기본 유도");
  }
  if (category === "editorial") {
    meta.rulesApplied.push("텍스트 폭을 3~4컬럼으로 제한");
  }
  if (category === "app") {
    meta.rulesApplied.push("모바일 4컬럼, 8pt 스케일 고정");
  }

  if (category === "banner" && blocks.length >= 5) {
    meta.detectedIssues.push(
      "Banner는 요소가 많으면 집중도가 떨어집니다. 4개 이하를 권장합니다."
    );
  }

  if (!blocks.some((block) => block.importance === "primary")) {
    meta.detectedIssues.push("Primary 블록이 없습니다. 위계가 약해집니다.");
  }

  if (stressTest) {
    meta.rulesApplied.push("Stress Test: 텍스트 2배, 세로 이미지 가정");
  }

  if (lockLayout) {
    meta.rulesApplied.push("Lock Layout: placements 유지, overflow 보호");
  }

  const placements = lockLayout && lockedPlacements?.length
    ? lockedPlacements.map((placement) => ({ ...placement }))
    : layoutSequential(blocks, columns, stressTest, lockLayout, category, preset);

  return {
    grid: {
      columns,
      gap,
      outerMargin
    },
    placements,
    typography,
    meta
  };
};
