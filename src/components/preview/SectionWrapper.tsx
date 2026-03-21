import { motion } from "framer-motion";
import { useRef } from "react";
import { GripVertical, EyeOff } from "lucide-react";
import { usePreviewLayout } from "./PreviewLayoutContext";
import { isLockedSection } from "@/lib/portfolioSections";

interface SectionWrapperProps {
  id: string;
  editMode?: boolean;
  onEdit?: (section: string) => void;
  children: React.ReactNode;
}

export default function SectionWrapper({ id, editMode, onEdit, children }: SectionWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const previewLayout = usePreviewLayout();
  const isDragging = previewLayout?.draggedSectionId === id;
  const canReorder = Boolean(editMode && previewLayout && !isLockedSection(id) && id !== "contact");
  const canHide = !isLockedSection(id);

  return (
    <motion.div
      ref={ref}
      layout
      onDragOver={(event) => {
        if (!previewLayout || !editMode) return;
        event.preventDefault();
      }}
      onDrop={(event) => {
        if (!previewLayout || !editMode) return;
        event.preventDefault();
        previewLayout.onDrop(id);
      }}
      onDragEnd={() => previewLayout?.onDragEnd()}
      transition={{ layout: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
      className={`group relative ${editMode ? "rounded-2xl border-2 border-dashed border-red-400/70 bg-red-50/20" : ""} ${isDragging ? "opacity-60" : ""}`}
    >
      {editMode && onEdit && (
        <div className="absolute right-3 top-3 z-40 flex items-center gap-2 rounded-full border border-border bg-background/95 px-2 py-1.5 text-xs font-medium text-foreground shadow-md backdrop-blur-sm sm:opacity-0 sm:group-hover:opacity-100">
          {canReorder && (
            <button
              type="button"
              draggable
              onDragStart={() => previewLayout?.onDragStart(id)}
              onDragEnd={() => previewLayout?.onDragEnd()}
              className="inline-flex cursor-grab items-center gap-1 rounded-full border border-border px-2 py-1 text-[11px] text-muted-foreground active:cursor-grabbing"
            >
              <GripVertical className="h-3.5 w-3.5" />
              Drag
            </button>
          )}
          <button
            type="button"
            onClick={() => onEdit(id)}
            className="rounded-full border border-border px-3 py-1 transition-all hover:bg-accent"
          >
            Edit Layout
          </button>
          {previewLayout?.onToggleHidden && canHide && (
            <button
              type="button"
              onClick={() => previewLayout.onToggleHidden?.(id)}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 transition-all hover:bg-accent"
            >
              <EyeOff className="h-3.5 w-3.5" />
              Hide
            </button>
          )}
        </div>
      )}
      {children}
    </motion.div>
  );
}
