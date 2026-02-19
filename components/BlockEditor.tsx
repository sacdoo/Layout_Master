import { Block, Importance, Mode, Ratio } from "../lib/types";

const importanceOptions: { label: string; value: Importance }[] = [
  { label: "Primary", value: "primary" },
  { label: "Secondary", value: "secondary" },
  { label: "Minor", value: "minor" }
];

const ratioOptions: Ratio[] = ["1:1", "4:3", "16:9", "3:4"];

export default function BlockEditor({
  block,
  mode,
  onUpdate
}: {
  block: Block | null;
  mode: Mode;
  onUpdate: (updates: Partial<Block>) => void;
}) {
  if (!block) {
    return (
      <div className="rounded-xl border border-ink-900/10 bg-white/70 px-6 py-8 text-sm text-ink-300">
        선택한 블록이 없습니다. 좌측 목록에서 선택하세요.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-ink-900/10 bg-white/70 px-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-ink-300">
            Block Editor
          </p>
          <h3 className="mt-2 font-[var(--font-display)] text-2xl">
            {block.type === "image" ? "Image Block" : "Text Block"}
          </h3>
        </div>
        <span className="rounded-full border border-ink-900/10 px-3 py-1 text-xs text-ink-300">
          {mode === "draft" ? "Draft" : "Live"}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div>
          <label className="text-xs uppercase tracking-[0.24em] text-ink-300">
            Importance
          </label>
          <select
            className="mt-2 w-full rounded-lg border border-ink-900/10 bg-white px-3 py-2 text-sm"
            value={block.importance}
            onChange={(event) => onUpdate({ importance: event.target.value as Importance })}
          >
            {importanceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {block.type === "image" ? (
          <>
            <div>
              <label className="text-xs uppercase tracking-[0.24em] text-ink-300">
                Aspect Ratio
              </label>
              <select
                className="mt-2 w-full rounded-lg border border-ink-900/10 bg-white px-3 py-2 text-sm"
                value={block.ratio ?? "1:1"}
                onChange={(event) =>
                  onUpdate({ ratio: event.target.value as Ratio })
                }
              >
                {ratioOptions.map((ratio) => (
                  <option key={ratio} value={ratio}>
                    {ratio}
                  </option>
                ))}
              </select>
            </div>
            {mode === "live" && (
              <div>
                <label className="text-xs uppercase tracking-[0.24em] text-ink-300">
                  Upload
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 w-full text-sm"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const url = URL.createObjectURL(file);
                    const img = new Image();
                    img.onload = () => {
                      onUpdate({
                        fileUrl: url,
                        fileMeta: { width: img.width, height: img.height }
                      });
                    };
                    img.src = url;
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <>
            <div>
              <label className="text-xs uppercase tracking-[0.24em] text-ink-300">
                Dummy Lines
              </label>
              <input
                type="range"
                min={1}
                max={6}
                value={block.textLines ?? 2}
                onChange={(event) =>
                  onUpdate({ textLines: Number(event.target.value) })
                }
                className="mt-3 w-full"
              />
              <p className="mt-2 text-xs text-ink-300">
                {block.textLines ?? 2}줄
              </p>
            </div>
            {mode === "live" && (
              <div className="lg:col-span-2">
                <label className="text-xs uppercase tracking-[0.24em] text-ink-300">
                  Content
                </label>
                <textarea
                  className="mt-2 w-full min-h-[140px] rounded-lg border border-ink-900/10 bg-white px-3 py-2 text-sm"
                  value={block.content ?? ""}
                  onChange={(event) => onUpdate({ content: event.target.value })}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
