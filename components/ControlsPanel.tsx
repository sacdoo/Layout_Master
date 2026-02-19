import { Block, Category, Preset, Mode, Ratio, Importance } from "../lib/types";

const categories: { label: string; value: Category }[] = [
  { label: "Landing", value: "landing" },
  { label: "Banner", value: "banner" },
  { label: "Detail", value: "detail" },
  { label: "Editorial", value: "editorial" },
  { label: "App", value: "app" }
];

const presets: { label: string; value: Preset; desc: string }[] = [
  { label: "안정적", value: "stable", desc: "정돈된 위계" },
  { label: "강조형", value: "bold", desc: "큰 대비" },
  { label: "실험형", value: "experimental", desc: "다이내믹" }
];

const ratios: Ratio[] = ["1:1", "4:3", "16:9", "3:4"];

const importanceLabels: Record<Importance, string> = {
  primary: "Primary",
  secondary: "Secondary",
  minor: "Minor"
};

export type HistoryItem = {
  id: string;
  label: string;
  isActive: boolean;
};

export default function ControlsPanel({
  category,
  setCategory,
  preset,
  setPreset,
  mode,
  setMode,
  blocks,
  onAddImage,
  onAddText,
  onSelectBlock,
  onMoveBlock,
  onDeleteBlock,
  onReorderBlock,
  stressTest,
  setStressTest,
  lockLayout,
  setLockLayout,
  showWhy,
  setShowWhy,
  showGrid,
  setShowGrid,
  onExport,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  historyItems,
  onSelectSnapshot
}: {
  category: Category;
  setCategory: (value: Category) => void;
  preset: Preset;
  setPreset: (value: Preset) => void;
  mode: Mode;
  setMode: (value: Mode) => void;
  blocks: Block[];
  onAddImage: (ratio: Ratio) => void;
  onAddText: (lines: number) => void;
  onSelectBlock: (id: string) => void;
  onMoveBlock: (id: string, dir: "up" | "down") => void;
  onDeleteBlock: (id: string) => void;
  onReorderBlock: (fromId: string, toId: string) => void;
  stressTest: boolean;
  setStressTest: (value: boolean) => void;
  lockLayout: boolean;
  setLockLayout: (value: boolean) => void;
  showWhy: boolean;
  setShowWhy: (value: boolean) => void;
  showGrid: boolean;
  setShowGrid: (value: boolean) => void;
  onExport: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  historyItems: HistoryItem[];
  onSelectSnapshot: (id: string) => void;
}) {
  return (
    <div className="bg-paper-100/80 border border-ink-900/10 rounded-xl p-5 shadow-soft backdrop-blur">
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-ink-300">Category</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setCategory(item.value)}
                className={`px-3 py-1.5 rounded-full text-sm border transition ${
                  category === item.value
                    ? "bg-ink-900 text-paper-50 border-ink-900"
                    : "border-ink-900/10 hover:border-ink-900/30"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-ink-300">Preset</p>
          <div className="mt-3 grid grid-cols-1 gap-2">
            {presets.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setPreset(item.value)}
                className={`w-full text-left border rounded-lg px-3 py-2 transition ${
                  preset === item.value
                    ? "border-ink-900 bg-white"
                    : "border-ink-900/10 hover:border-ink-900/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-xs text-ink-300">{item.desc}</span>
                </div>
                <div className="mt-2 h-10 rounded-md border border-dashed border-ink-900/20 bg-gradient-to-r from-paper-50 via-white to-paper-100" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-ink-300">Mode</p>
          <div className="mt-3 flex gap-2">
            {([
              { label: "Draft", value: "draft" },
              { label: "Live", value: "live" }
            ] as { label: string; value: Mode }[]).map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setMode(item.value)}
                className={`px-3 py-1.5 rounded-full text-sm border transition ${
                  mode === item.value
                    ? "bg-ink-900 text-paper-50 border-ink-900"
                    : "border-ink-900/10 hover:border-ink-900/30"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-ink-300">Draft Blocks</p>
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap gap-2">
              {ratios.map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => onAddImage(ratio)}
                  className="px-3 py-1.5 rounded-full text-sm border border-ink-900/10 hover:border-ink-900/30"
                >
                  Add Dummy Image {ratio}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map((lines) => (
                <button
                  key={lines}
                  type="button"
                  onClick={() => onAddText(lines)}
                  className="px-3 py-1.5 rounded-full text-sm border border-ink-900/10 hover:border-ink-900/30"
                >
                  Add Dummy Text {lines}줄
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-ink-300">Blocks</p>
          <div className="mt-3 space-y-2">
            {blocks.length === 0 && (
              <p className="text-sm text-ink-300">블록을 추가해 시작하세요.</p>
            )}
            {blocks.map((block, index) => (
              <div
                key={block.id}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/plain", block.id);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const fromId = event.dataTransfer.getData("text/plain");
                  if (fromId && fromId !== block.id) {
                    onReorderBlock(fromId, block.id);
                  }
                }}
                className="flex items-center justify-between rounded-lg border border-ink-900/10 bg-white/70 px-3 py-2"
              >
                <button
                  type="button"
                  onClick={() => onSelectBlock(block.id)}
                  className="text-left"
                >
                  <p className="text-sm font-medium">
                    {index + 1}. {block.type === "image" ? "Image" : "Text"}
                  </p>
                  <p className="text-xs text-ink-300">
                    {importanceLabels[block.importance]}
                  </p>
                </button>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => onMoveBlock(block.id, "up")}
                    className="rounded border border-ink-900/10 px-2 py-1"
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveBlock(block.id, "down")}
                    className="rounded border border-ink-900/10 px-2 py-1"
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteBlock(block.id)}
                    className="rounded border border-ink-900/10 px-2 py-1 text-accent-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between rounded-lg border border-ink-900/10 bg-white/70 px-3 py-2 text-sm">
            <span>Stress Test</span>
            <input
              type="checkbox"
              checked={stressTest}
              onChange={(event) => setStressTest(event.target.checked)}
            />
          </label>
          <label className="flex items-center justify-between rounded-lg border border-ink-900/10 bg-white/70 px-3 py-2 text-sm">
            <span>Lock Layout</span>
            <input
              type="checkbox"
              checked={lockLayout}
              onChange={(event) => setLockLayout(event.target.checked)}
            />
          </label>
          <label className="flex items-center justify-between rounded-lg border border-ink-900/10 bg-white/70 px-3 py-2 text-sm">
            <span>Grid Overlay</span>
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(event) => setShowGrid(event.target.checked)}
            />
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowWhy(!showWhy)}
              className="flex-1 rounded-lg border border-ink-900/10 px-3 py-2 text-sm"
            >
              Why
            </button>
            <button
              type="button"
              onClick={onExport}
              className="flex-1 rounded-lg border border-ink-900/10 px-3 py-2 text-sm"
            >
              Export JSON
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-ink-300">
            History
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className="flex-1 rounded-lg border border-ink-900/10 px-3 py-2 text-sm disabled:opacity-40"
            >
              Undo
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              className="flex-1 rounded-lg border border-ink-900/10 px-3 py-2 text-sm disabled:opacity-40"
            >
              Redo
            </button>
          </div>
          <div className="mt-3 max-h-40 space-y-2 overflow-auto pr-1">
            {historyItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSnapshot(item.id)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-xs ${
                  item.isActive
                    ? "border-ink-900 bg-white"
                    : "border-ink-900/10 hover:border-ink-900/30"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
