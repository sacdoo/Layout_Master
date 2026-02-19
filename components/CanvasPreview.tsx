import { Block, LayoutSpec, Mode } from "../lib/types";

const lorem =
  "그리드는 질서를 만들고, 위계는 이야기를 만듭니다. 레이아웃은 콘텐츠가 바뀌어도 흔들리지 않아야 합니다.";

const ratioStringToNumber = (ratio: Block["ratio"]) => {
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

const buildDummyText = (lines: number) => {
  const words = lorem.split(" ");
  return new Array(lines)
    .fill(0)
    .map((_, index) => words[index % words.length])
    .join(" ");
};

export default function CanvasPreview({
  blocks,
  layout,
  mode,
  stressTest,
  lockLayout,
  showGrid,
  selectedBlockId,
  onSelectBlock,
  expandedTextIds,
  onToggleExpand
}: {
  blocks: Block[];
  layout: LayoutSpec;
  mode: Mode;
  stressTest: boolean;
  lockLayout: boolean;
  showGrid: boolean;
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  expandedTextIds: string[];
  onToggleExpand: (id: string) => void;
}) {
  const gridStyle = {
    gridTemplateColumns: `repeat(${layout.grid.columns}, minmax(0, 1fr))`,
    gap: `${layout.grid.gap}px`,
    padding: `${layout.grid.outerMargin}px`
  } as const;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {layout.meta.detectedIssues.map((issue) => (
          <span
            key={issue}
            className="rounded-full bg-accent-500/10 px-3 py-1 text-xs text-accent-600"
          >
            {issue}
          </span>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-ink-900/10 bg-white shadow-soft">
        <div className="absolute inset-0 bg-gradient-to-br from-paper-100 via-white to-paper-50" />
        <div
          className="relative grid min-h-[520px]"
          style={gridStyle}
        >
          {showGrid && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(14, 15, 18, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(14, 15, 18, 0.05) 1px, transparent 1px)`,
                backgroundSize: `calc(100% / ${layout.grid.columns}) 80px`
              }}
            />
          )}
          {layout.placements.map((placement) => {
            const block = blocks.find((item) => item.id === placement.id);
            if (!block) return null;

            const isSelected = selectedBlockId === block.id;
            const isText = block.type === "text";
            const textLines = block.textLines ?? 2;
            const content =
              mode === "draft"
                ? buildDummyText(textLines)
                : block.content || "텍스트를 입력하세요.";
            const isLong =
              mode === "live"
                ? content.split("\n").length > 6 || content.length > 240
                : textLines > 4;
            const isExpanded = expandedTextIds.includes(block.id);
            const showClamp = isLong && !isExpanded;

            const hasAutoCrop =
              block.type === "image" &&
              block.fileMeta &&
              block.ratio &&
              Math.abs(
                block.fileMeta.width / block.fileMeta.height -
                  ratioStringToNumber(block.ratio)
              ) > 0.25;

            return (
              <div
                key={placement.id}
                onClick={() => onSelectBlock(block.id)}
                className={`relative rounded-xl border transition ${
                  isSelected
                    ? "border-ink-900"
                    : "border-ink-900/10 hover:border-ink-900/40"
                } bg-white/80 backdrop-blur`}
                style={{
                  gridColumn: `${placement.colStart} / span ${placement.colSpan}`,
                  gridRow: `${placement.rowStart} / span ${placement.rowSpan}`,
                  minHeight: placement.minHeight
                }}
              >
                <div className="absolute right-3 top-3 text-[10px] uppercase tracking-[0.2em] text-ink-300">
                  {block.importance}
                </div>
                {block.type === "image" ? (
                  <div className="h-full w-full overflow-hidden rounded-xl">
                    {mode === "draft" || !block.fileUrl ? (
                      <div className="flex h-full items-center justify-center border border-dashed border-ink-900/20 bg-paper-50 text-ink-300">
                        <span className="text-2xl">✕</span>
                      </div>
                    ) : (
                      <img
                        src={block.fileUrl}
                        alt="uploaded"
                        className="h-full w-full object-cover"
                      />
                    )}
                    {hasAutoCrop && (
                      <span className="absolute left-3 top-3 rounded-full bg-ink-900/80 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-paper-50">
                        Auto-crop 안내
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="h-full w-full px-5 py-6">
                    <p
                      className="text-balance text-sm text-ink-700"
                      style={
                        showClamp
                          ? {
                              display: "-webkit-box",
                              WebkitLineClamp: 6,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden"
                            }
                          : undefined
                      }
                    >
                      {content}
                    </p>
                    {isLong && (
                      <button
                        type="button"
                        className="mt-3 text-xs uppercase tracking-[0.2em] text-ink-300"
                        onClick={(event) => {
                          event.stopPropagation();
                          onToggleExpand(block.id);
                        }}
                      >
                        {isExpanded ? "Less" : "More"}
                      </button>
                    )}
                    {(stressTest || lockLayout) && (
                      <div className="mt-4 text-xs text-ink-300">
                        {stressTest && "Stress Test 적용"}
                        {stressTest && lockLayout && " · "}
                        {lockLayout && "Lock Layout 유지"}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
