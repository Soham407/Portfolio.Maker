import { createContext, useContext } from "react";

type PreviewLayoutContextValue = {
  editMode: boolean;
  draggedSectionId: string | null;
  onDragStart: (sectionId: string) => void;
  onDrop: (targetSectionId: string) => void;
  onDragEnd: () => void;
  onToggleHidden?: (sectionId: string) => void;
};

const PreviewLayoutContext = createContext<PreviewLayoutContextValue | null>(null);

export const PreviewLayoutProvider = PreviewLayoutContext.Provider;

export const usePreviewLayout = () => useContext(PreviewLayoutContext);
