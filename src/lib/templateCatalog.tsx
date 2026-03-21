import type { ReactNode } from "react";

export type TemplateCatalogEntry = {
  id: string;
  name: string;
  description: string;
  animationLabel: string;
  accentClass: string;
  dotColor: string;
  preview: ReactNode;
};

export const TEMPLATE_CATALOG: TemplateCatalogEntry[] = [
  {
    id: "minimal",
    name: "Glass",
    description: "Dark glassmorphism, elegant and modern.",
    animationLabel: "Blur fade-in",
    accentClass: "from-violet-500/20 to-blue-500/20",
    dotColor: "#a78bfa",
    preview: (
      <div className="aspect-[4/3] rounded-lg overflow-hidden" style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>
        <div className="p-3 flex flex-col gap-2 h-full">
          <div className="mx-auto mt-2 h-7 w-7 rounded-full" style={{ background: "linear-gradient(135deg,#a78bfa,#60a5fa)", boxShadow: "0 0 12px #a78bfa88" }} />
          <div className="mx-auto h-1.5 w-20 rounded-full bg-white/30" />
          <div className="mx-auto h-1 w-14 rounded-full" style={{ background: "#a78bfa66" }} />
          <div className="mt-1 flex flex-wrap justify-center gap-1">
            {[10, 14, 10, 12, 8].map((w, i) => <div key={i} className="h-2 rounded-full" style={{ width: `${w * 3}px`, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }} />)}
          </div>
          <div className="mt-auto grid grid-cols-2 gap-1">
            {[0, 1].map((i) => (
              <div key={i} className="rounded-md p-1.5 h-8" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="h-1 w-10 rounded bg-white/20 mb-1" />
                <div className="h-1 w-8 rounded" style={{ background: "#a78bfa44" }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "developer",
    name: "Night Owl",
    description: "VS Code dark, clean and technical.",
    animationLabel: "Slide from left",
    accentClass: "from-teal-500/20 to-emerald-500/20",
    dotColor: "#2DD4BF",
    preview: (
      <div className="aspect-[4/3] rounded-lg overflow-hidden" style={{ background: "#0d1117" }}>
        <div className="p-3 flex flex-col gap-2 h-full">
          <div className="flex items-center justify-between">
            <div className="h-1.5 w-16 rounded font-mono" style={{ background: "#2DD4BF44" }} />
            <div className="flex gap-1">{[0, 1, 2].map(i => <div key={i} className="h-1.5 w-6 rounded bg-white/10" />)}</div>
          </div>
          <div className="flex items-start gap-2 mt-1">
            <div className="flex-1">
              <div className="mb-1 h-1 w-10 rounded" style={{ background: "#2DD4BF33", border: "1px solid #2DD4BF44" }} />
              <div className="h-2.5 w-24 rounded bg-white/25" />
              <div className="mt-1 h-1.5 w-16 rounded" style={{ background: "#2DD4BF66" }} />
              <div className="mt-2 flex gap-1">
                <div className="h-3 w-12 rounded" style={{ background: "#2DD4BF" }} />
                <div className="h-3 w-8 rounded" style={{ background: "#161b22", border: "1px solid #30363d" }} />
              </div>
            </div>
            <div className="h-14 w-12 rounded-lg flex-shrink-0" style={{ background: "#161b22", border: "2px solid #2DD4BF44" }} />
          </div>
          <div className="mt-auto space-y-1">
            {[0, 1].map(i => (
              <div key={i} className="flex gap-1.5 rounded p-1.5" style={{ background: "#161b22", border: "1px solid #30363d" }}>
                <div className="h-5 w-6 rounded flex-shrink-0" style={{ background: "#2DD4BF18" }} />
                <div className="flex-1">
                  <div className="h-1.5 w-14 rounded bg-white/20" />
                  <div className="mt-0.5 flex gap-1">
                    <div className="h-1 w-5 rounded" style={{ background: "#2DD4BF33" }} />
                    <div className="h-1 w-4 rounded" style={{ background: "#2DD4BF33" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "creative",
    name: "Vibrant",
    description: "Bold and colorful, makes an impression.",
    animationLabel: "Spring scale-up",
    accentClass: "from-yellow-400/20 to-lime-400/20",
    dotColor: "#CBFF4D",
    preview: (
      <div className="aspect-[4/3] rounded-lg overflow-hidden bg-white">
        <div className="p-0 flex flex-col h-full">
          <div className="bg-black px-3 pt-3 pb-3 flex-shrink-0">
            <div className="h-2 w-20 rounded-sm bg-white/20 mb-1" />
            <div className="h-4 w-28 rounded-sm" style={{ background: "rgba(255,255,255,0.9)" }} />
            <div className="mt-1 inline-block h-2.5 w-16 rounded-full px-2" style={{ background: "#CBFF4D" }} />
          </div>
          <div className="h-1.5 w-full flex-shrink-0" style={{ background: "#CBFF4D" }} />
          <div className="p-2 grid grid-cols-4 gap-1">
            {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className="h-5 rounded-md text-center flex items-center justify-center" style={{ background: "#f5f5f5", border: "1.5px solid #e5e5e5" }}>
                <div className="h-1 w-4 rounded bg-gray-300" />
              </div>
            ))}
          </div>
          <div className="px-2 grid grid-cols-2 gap-1">
            {[["#F3E8FF", "#C084FC"], ["#FEF9C3", "#FACC15"]].map(([bg, bdr], i) => (
              <div key={i} className="h-8 rounded-lg p-1.5" style={{ background: bg, border: `2px solid ${bdr}` }}>
                <div className="h-1.5 w-10 rounded" style={{ background: `${bdr}88` }} />
                <div className="mt-0.5 h-1 w-8 rounded" style={{ background: `${bdr}55` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "corporate",
    name: "Editorial",
    description: "Magazine-style, sophisticated and clean.",
    animationLabel: "Elegant fade-up",
    accentClass: "from-green-500/20 to-emerald-600/20",
    dotColor: "#16A34A",
    preview: (
      <div className="aspect-[4/3] rounded-lg overflow-hidden" style={{ background: "#FAFAF7" }}>
        <div className="p-3 flex flex-col gap-2 h-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full" style={{ background: "#16A34A" }} />
              <div className="h-1 w-10 rounded bg-gray-400" />
            </div>
            <div className="h-3 w-10 rounded-full" style={{ background: "#16A34A" }} />
          </div>
          <div className="mt-1">
            <div className="mb-0.5 h-1 w-12 rounded" style={{ background: "#16A34A44" }} />
            <div className="h-4 w-28 rounded-sm bg-black/80" />
            <div className="mt-1 h-1.5 w-20 rounded bg-gray-400/50" />
          </div>
          <div className="flex gap-2 mt-1">
            <div className="flex-1 space-y-0.5">
              <div className="h-0.5 w-full rounded bg-gray-300" />
              <div className="h-0.5 w-3/4 rounded bg-gray-300" />
              <div className="h-0.5 w-5/6 rounded bg-gray-300" />
            </div>
            <div className="flex-1 flex flex-wrap gap-0.5">
              {[8, 10, 7, 9, 6].map((w, i) => <div key={i} className="h-2 rounded-full" style={{ width: `${w * 3}px`, background: "#f0f0ee", border: "1px solid #e0e0de" }} />)}
            </div>
          </div>
          <div className="mt-auto grid grid-cols-3 gap-1">
            <div className="col-span-2 h-10 rounded-xl" style={{ background: "#111" }}>
              <div className="p-1.5">
                <div className="h-1.5 w-10 rounded bg-white/30" />
                <div className="mt-0.5 flex gap-0.5">{[0, 1].map(i => <div key={i} className="h-1 w-5 rounded" style={{ background: "#16A34A33" }} />)}</div>
              </div>
            </div>
            <div className="h-10 rounded-xl bg-white" style={{ border: "1px solid #e5e5e5" }}>
              <div className="p-1.5"><div className="h-1.5 w-6 rounded bg-gray-300" /></div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "photography",
    name: "Brutalist",
    description: "High-contrast B&W, raw typographic power.",
    animationLabel: "Clip-path reveal",
    accentClass: "from-gray-700/20 to-gray-900/20",
    dotColor: "#ffffff",
    preview: (
      <div className="aspect-[4/3] rounded-lg overflow-hidden bg-black">
        <div className="p-3 flex flex-col gap-2 h-full">
          <div className="flex items-center justify-between">
            <div className="h-1 w-10 rounded bg-white/20" />
            <div className="h-3 w-10 rounded-none border border-white/40" />
          </div>
          <div className="mt-1">
            <div className="h-5 w-32 rounded-none bg-white/90" />
            <div className="mt-0.5 h-5 w-20 rounded-none bg-white/70" />
            <div className="mt-1 h-1.5 w-16 rounded bg-white/30" />
          </div>
          <div className="flex gap-1 mt-1">
            {["React", "TS", "Node"].map((t, i) => <span key={i} className="text-[6px] uppercase tracking-wider" style={{ color: "#555" }}>{t}{i < 2 ? " ." : ""}</span>)}
          </div>
          <div className="mt-auto space-y-1 border-t border-white/10 pt-1">
            {[0, 1].map(i => (
              <div key={i} className="flex items-center justify-between border-b border-white/10 pb-1">
                <div className="h-1.5 w-16 rounded bg-white/60" />
                <div className="h-1 w-6 rounded bg-white/20 underline" />
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
];
