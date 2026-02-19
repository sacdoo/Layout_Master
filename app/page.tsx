"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import ControlsPanel, { HistoryItem } from "../components/ControlsPanel";
import CanvasPreview from "../components/CanvasPreview";
import BlockEditor from "../components/BlockEditor";
import { layoutEngine } from "../lib/layoutEngine";
import {
  Block,
  Category,
  LayoutSpec,
  Mode,
  Placement,
  Preset,
  Ratio
} from "../lib/types";

const createId = () =>
  typeof crypto !== "undefined" ? crypto.randomUUID() : String(Date.now());

const initialBlocks: Block[] = [
  {
    id: createId(),
    type: "image",
    importance: "primary",
    ratio: "16:9",
    dummy: true
  },
  {
    id: createId(),
    type: "text",
    importance: "secondary",
    textLines: 3,
    dummy: true
  },
  {
    id: createId(),
    type: "image",
    importance: "minor",
    ratio: "1:1",
    dummy: true
  }
];

type AppState = {
  category: Category;
  preset: Preset;
  mode: Mode;
  blocks: Block[];
  stressTest: boolean;
  lockLayout: boolean;
};

type HistoryState = {
  past: AppState[];
  present: AppState;
  future: AppState[];
};

const initialState: AppState = {
  category: "landing",
  preset: "stable",
  mode: "draft",
  blocks: initialBlocks,
  stressTest: false,
  lockLayout: false
};

const buildStressBlocks = (blocks: Block[], mode: Mode) =>
  blocks.map((block, index) => {
    if (block.type === "text") {
      const content = block.content ?? "";
      const doubledContent = content ? `${content}\n${content}` : content;
      return {
        ...block,
        textLines: (block.textLines ?? 2) * 2,
        content: mode === "live" ? doubledContent : block.content
      };
    }
    if (block.type === "image") {
      return {
        ...block,
        ratio: index % 2 === 0 ? "3:4" : block.ratio
      };
    }
    return block;
  });

const snapshotLabel = (state: AppState) =>
  `${state.category.toUpperCase()} · ${state.preset} · ${state.blocks.length} blocks`;

export default function HomePage() {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: initialState,
    future: []
  });
  const [selectedId, setSelectedId] = useState<string | null>(
    initialBlocks[0]?.id ?? null
  );
  const [showWhy, setShowWhy] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [lockedPlacements, setLockedPlacements] = useState<Placement[] | null>(
    null
  );
  const [expandedTextIds, setExpandedTextIds] = useState<string[]>([]);

  const commit = (updater: (state: AppState) => AppState) => {
    setHistory((current) => {
      const next = updater(current.present);
      if (next === current.present) return current;
      const nextPast = [...current.past, current.present].slice(-20);
      return { past: nextPast, present: next, future: [] };
    });
  };

  const undo = () => {
    setHistory((current) => {
      if (current.past.length === 0) return current;
      const previous = current.past[current.past.length - 1];
      const newPast = current.past.slice(0, -1);
      return {
        past: newPast,
        present: previous,
        future: [current.present, ...current.future]
      };
    });
  };

  const redo = () => {
    setHistory((current) => {
      if (current.future.length === 0) return current;
      const next = current.future[0];
      const newFuture = current.future.slice(1);
      return {
        past: [...current.past, current.present].slice(-20),
        present: next,
        future: newFuture
      };
    });
  };

  const selectSnapshot = (id: string) => {
    const all = [...history.past, history.present, ...history.future];
    const index = all.findIndex((state, idx) => `${idx}-${snapshotLabel(state)}` === id);
    if (index === -1) return;
    const newPast = all.slice(0, index);
    const newPresent = all[index];
    const newFuture = all.slice(index + 1);
    setHistory({ past: newPast, present: newPresent, future: newFuture });
  };

  const { category, preset, mode, blocks, stressTest, lockLayout } = history.present;

  const displayBlocks = useMemo(
    () => (stressTest ? buildStressBlocks(blocks, mode) : blocks),
    [blocks, mode, stressTest]
  );

  const layoutInput = useMemo(
    () => ({
      blocks: displayBlocks,
      category,
      preset,
      mode,
      stressTest,
      lockLayout,
      lockedPlacements: lockLayout ? lockedPlacements ?? undefined : undefined
    }),
    [
      displayBlocks,
      category,
      preset,
      mode,
      stressTest,
      lockLayout,
      lockedPlacements
    ]
  );

  const layout: LayoutSpec = useMemo(
    () => layoutEngine(layoutInput),
    [layoutInput]
  );

  useEffect(() => {
    if (lockLayout && !lockedPlacements) {
      setLockedPlacements(layout.placements);
    }
    if (!lockLayout && lockedPlacements) {
      setLockedPlacements(null);
    }
  }, [lockLayout, lockedPlacements, layout.placements]);

  useEffect(() => {
    if (selectedId && !blocks.some((block) => block.id === selectedId)) {
      setSelectedId(blocks[0]?.id ?? null);
    }
  }, [blocks, selectedId]);

  const selectedBlock = blocks.find((block) => block.id === selectedId) ?? null;

  const updateBlock = (updates: Partial<Block>) => {
    if (!selectedId) return;
    commit((state) => ({
      ...state,
      blocks: state.blocks.map((block) =>
        block.id === selectedId ? { ...block, ...updates } : block
      )
    }));
  };

  const addImage = (ratio: Ratio) => {
    const newBlock: Block = {
      id: createId(),
      type: "image",
      importance: "secondary",
      ratio,
      dummy: true
    };
    commit((state) => ({ ...state, blocks: [...state.blocks, newBlock] }));
    setSelectedId(newBlock.id);
  };

  const addText = (lines: number) => {
    const newBlock: Block = {
      id: createId(),
      type: "text",
      importance: "secondary",
      textLines: lines,
      dummy: true
    };
    commit((state) => ({ ...state, blocks: [...state.blocks, newBlock] }));
    setSelectedId(newBlock.id);
  };

  const moveBlock = (id: string, dir: "up" | "down") => {
    commit((state) => {
      const index = state.blocks.findIndex((block) => block.id === id);
      if (index === -1) return state;
      const nextIndex = dir === "up" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= state.blocks.length) return state;
      const next = [...state.blocks];
      const temp = next[index];
      next[index] = next[nextIndex];
      next[nextIndex] = temp;
      return { ...state, blocks: next };
    });
  };

  const reorderBlock = (fromId: string, toId: string) => {
    commit((state) => {
      const current = [...state.blocks];
      const fromIndex = current.findIndex((block) => block.id === fromId);
      const toIndex = current.findIndex((block) => block.id === toId);
      if (fromIndex === -1 || toIndex === -1) return state;
      const [moved] = current.splice(fromIndex, 1);
      current.splice(toIndex, 0, moved);
      return { ...state, blocks: current };
    });
  };

  const deleteBlock = (id: string) => {
    commit((state) => ({
      ...state,
      blocks: state.blocks.filter((block) => block.id !== id)
    }));
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedTextIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const exportLayout = async () => {
    const payload = JSON.stringify(layout, null, 2);
    await navigator.clipboard.writeText(payload);
    alert("Layout spec JSON이 클립보드에 복사되었습니다.");
  };

  const historyItems: HistoryItem[] = useMemo(() => {
    const all = [...history.past, history.present, ...history.future];
    return all.map((state, index) => ({
      id: `${index}-${snapshotLabel(state)}`,
      label: snapshotLabel(state),
      isActive: state === history.present
    }));
  }, [history]);

  return (
    <AppShell
      header={
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-ink-300">
            Layout Master
          </p>
          <h1 className="mt-2 font-[var(--font-display)] text-4xl leading-tight">
            자동 레이아웃 생성기
          </h1>
          <p className="mt-3 text-sm text-ink-500">
            초보자도 숙련자 수준의 구조를 얻는 Resilient Layout Studio
          </p>
        </div>
      }
      sidebar={
        <ControlsPanel
          category={category}
          setCategory={(value) => commit((state) => ({ ...state, category: value }))}
          preset={preset}
          setPreset={(value) => commit((state) => ({ ...state, preset: value }))}
          mode={mode}
          setMode={(value) => commit((state) => ({ ...state, mode: value }))}
          blocks={blocks}
          onAddImage={addImage}
          onAddText={addText}
          onSelectBlock={setSelectedId}
          onMoveBlock={moveBlock}
          onDeleteBlock={deleteBlock}
          onReorderBlock={reorderBlock}
          stressTest={stressTest}
          setStressTest={(value) =>
            commit((state) => ({ ...state, stressTest: value }))
          }
          lockLayout={lockLayout}
          setLockLayout={(value) =>
            commit((state) => ({ ...state, lockLayout: value }))
          }
          showWhy={showWhy}
          setShowWhy={setShowWhy}
          showGrid={showGrid}
          setShowGrid={setShowGrid}
          onExport={exportLayout}
          canUndo={history.past.length > 0}
          canRedo={history.future.length > 0}
          onUndo={undo}
          onRedo={redo}
          historyItems={historyItems}
          onSelectSnapshot={selectSnapshot}
        />
      }
      canvas={
        <div className="relative">
          <CanvasPreview
            blocks={displayBlocks}
            layout={layout}
            mode={mode}
            stressTest={stressTest}
            lockLayout={lockLayout}
            showGrid={showGrid}
            selectedBlockId={selectedId}
            onSelectBlock={setSelectedId}
            expandedTextIds={expandedTextIds}
            onToggleExpand={toggleExpand}
          />
          {showWhy && (
            <aside className="mt-4 rounded-xl border border-ink-900/10 bg-white/90 p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <h3 className="font-[var(--font-display)] text-2xl">
                  Why this layout
                </h3>
                <button
                  type="button"
                  onClick={() => setShowWhy(false)}
                  className="text-xs uppercase tracking-[0.2em] text-ink-300"
                >
                  Close
                </button>
              </div>
              <div className="mt-4 space-y-4 text-sm text-ink-500">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-ink-300">
                    Rationale
                  </p>
                  <ul className="mt-2 space-y-1">
                    {layout.meta.rationale.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-ink-300">
                    Rules Applied
                  </p>
                  <ul className="mt-2 space-y-1">
                    {layout.meta.rulesApplied.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-ink-300">
                    Detected Issues
                  </p>
                  <ul className="mt-2 space-y-1">
                    {layout.meta.detectedIssues.length === 0 && (
                      <li>문제 없음</li>
                    )}
                    {layout.meta.detectedIssues.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          )}
        </div>
      }
      editor={<BlockEditor block={selectedBlock} mode={mode} onUpdate={updateBlock} />}
    />
  );
}
