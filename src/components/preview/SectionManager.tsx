import { Reorder, useDragControls } from "framer-motion";
import { ArrowDown, ArrowUp, Eye, EyeOff, GripVertical, Lock, RotateCcw } from "lucide-react";
import { PORTFOLIO_SECTIONS } from "@/lib/constants";
import { isLockedSection } from "@/lib/portfolioSections";

type SectionManagerProps = {
  order: string[];
  hiddenSections: string[];
  onMove: (sectionId: string, direction: -1 | 1) => void;
  onReorder: (nextOrder: string[]) => void;
  onToggleHidden: (sectionId: string) => void;
  onReset: () => void;
};

type SectionManagerItemProps = {
  sectionId: string;
  index: number;
  orderLength: number;
  hidden: boolean;
  pinnedCount: number;
  label: string;
  onMove: (sectionId: string, direction: -1 | 1) => void;
  onToggleHidden: (sectionId: string) => void;
};

function SectionManagerItem({
  sectionId,
  index,
  orderLength,
  hidden,
  pinnedCount,
  label,
  onMove,
  onToggleHidden,
}: SectionManagerItemProps) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={sectionId}
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      className="flex items-center gap-3 rounded-2xl border border-border bg-background/70 px-3 py-3"
      whileDrag={{ scale: 1.01, boxShadow: "0 18px 40px rgba(0,0,0,0.12)" }}
      transition={{ layout: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } }}
    >
      <button
        type="button"
        aria-label={`Drag ${label}`}
        onPointerDown={(event) => dragControls.start(event)}
        className="cursor-grab rounded-xl border border-border bg-card p-2 text-muted-foreground active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">
          {hidden ? "Hidden from visitors and exports" : "Visible everywhere"}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onMove(sectionId, -1)}
          disabled={index <= pinnedCount}
          className="rounded-lg border border-border px-2 py-1.5 text-xs disabled:opacity-40"
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onMove(sectionId, 1)}
          disabled={index === orderLength - 1}
          className="rounded-lg border border-border px-2 py-1.5 text-xs disabled:opacity-40"
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onToggleHidden(sectionId)}
          className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-xs"
        >
          {hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          {hidden ? "Show" : "Hide"}
        </button>
      </div>
    </Reorder.Item>
  );
}

export default function SectionManager({
  order,
  hiddenSections,
  onMove,
  onReorder,
  onToggleHidden,
  onReset,
}: SectionManagerProps) {
  const labels = Object.fromEntries(PORTFOLIO_SECTIONS.map((section) => [section.id, section.label]));
  const pinnedSections = order.filter((sectionId) => isLockedSection(sectionId));
  const movableSections = order.filter((sectionId) => !isLockedSection(sectionId));

  return (
    <div className="flex max-h-[calc(100vh-7rem)] flex-col overflow-hidden rounded-3xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Arrange Sections</h3>
          <p className="text-xs text-muted-foreground">
            Drag sections to reorder them. Changes apply to preview, public page, and exports.
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      <div className="mt-4 flex-1 overflow-y-auto pr-1">
        <div className="space-y-3">
        {pinnedSections.map((sectionId) => {
          return (
            <div key={sectionId} className="rounded-2xl border border-primary/20 bg-primary/5 px-3 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Lock className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{labels[sectionId] || sectionId}</p>
                  <p className="text-xs text-muted-foreground">Pinned to the top of the portfolio</p>
                </div>
              </div>
            </div>
          );
        })}

        <Reorder.Group
          axis="y"
          layoutScroll
          values={movableSections}
          onReorder={(nextMovableSections) => onReorder([...pinnedSections, ...nextMovableSections])}
          className="flex flex-col gap-2"
        >
          {movableSections.map((sectionId) => {
            const index = order.indexOf(sectionId);
            const hidden = hiddenSections.includes(sectionId);

            return (
              <SectionManagerItem
              key={sectionId}
                sectionId={sectionId}
                index={index}
                orderLength={order.length}
                hidden={hidden}
                pinnedCount={pinnedSections.length}
                label={labels[sectionId] || sectionId}
                onMove={onMove}
                onToggleHidden={onToggleHidden}
              />
            );
          })}
        </Reorder.Group>
        </div>
      </div>
    </div>
  );
}
