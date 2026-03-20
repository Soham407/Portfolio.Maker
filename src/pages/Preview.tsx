import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, LayoutPanelLeft, PenTool } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SectionLayoutPicker from "@/components/preview/SectionLayoutPicker";
import SectionManager from "@/components/preview/SectionManager";
import { getTemplateComponent } from "@/components/templates";
import { useBio } from "@/hooks/useBio";
import { useCertifications } from "@/hooks/useCertifications";
import { useContact } from "@/hooks/useContact";
import { useEducation } from "@/hooks/useEducation";
import { useExperience } from "@/hooks/useExperience";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useProjects } from "@/hooks/useProjects";
import { useSkills } from "@/hooks/useSkills";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "@/hooks/use-toast";
import { DEFAULT_SECTION_ORDER } from "@/lib/constants";
import { normalizeHiddenSections, normalizeSectionOrder } from "@/lib/portfolioSections";

const TEMPLATE_NAMES: Record<string, string> = {
  minimal: "Glass",
  developer: "Night Owl",
  creative: "Vibrant",
  corporate: "Editorial",
  photography: "Brutalist",
};

const Preview = () => {
  const [searchParams] = useSearchParams();
  const portfolioParam = searchParams.get("portfolio") ?? undefined;
  const { portfolio, isLoading: portfolioLoading, updateSectionLayouts, updateSectionControls } = usePortfolio(portfolioParam);
  const { profile } = useProfile();
  const portfolioId = portfolio?.id;
  const templateId = portfolio?.template_id ?? "minimal";
  const dashboardHref = "/dashboard";
  const builderHref = portfolioId ? `/builder?portfolio=${portfolioId}` : "/builder";

  const { bio } = useBio(portfolioId);
  const { projects } = useProjects(portfolioId);
  const { skills } = useSkills(portfolioId);
  const { experiences } = useExperience(portfolioId);
  const { education } = useEducation(portfolioId);
  const { contact } = useContact(portfolioId);
  const { certifications } = useCertifications(portfolioId);

  const TemplateComponent = getTemplateComponent(templateId);
  const templateName = TEMPLATE_NAMES[templateId] ?? templateId;
  const defaultOrderForReset = normalizeSectionOrder(
    DEFAULT_SECTION_ORDER[(profile?.user_type as keyof typeof DEFAULT_SECTION_ORDER) || "fresher"]
  );

  const [editMode, setEditMode] = useState(false);
  const [sectionLayouts, setSectionLayouts] = useState<Record<string, string>>({});
  const [activeSidebarSection, setActiveSidebarSection] = useState<string | null>(null);
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
  const [hiddenSections, setHiddenSections] = useState<string[]>([]);
  const sectionLayoutSaveRef = useRef<number | null>(null);
  const sectionControlsSaveRef = useRef<number | null>(null);
  const pendingLayoutsRef = useRef<Record<string, string> | null>(null);
  const pendingControlsRef = useRef<{ section_order: string[]; hidden_sections: string[] } | null>(null);
  const lastSyncedLayoutsRef = useRef<Record<string, string>>({});
  const lastSyncedOrderRef = useRef<string[]>([]);
  const lastSyncedHiddenRef = useRef<string[]>([]);

  useEffect(() => {
    const nextLayouts = (portfolio?.section_layouts as Record<string, string>) ?? {};
    const nextOrder = normalizeSectionOrder(portfolio?.section_order ?? defaultOrderForReset);
    const nextHidden = normalizeHiddenSections(portfolio?.hidden_sections);

    lastSyncedLayoutsRef.current = nextLayouts;
    lastSyncedOrderRef.current = nextOrder;
    lastSyncedHiddenRef.current = nextHidden;

    setSectionLayouts(nextLayouts);
    setSectionOrder(nextOrder);
    setHiddenSections(nextHidden);
  }, [defaultOrderForReset, portfolio]);

  const rollbackSectionLayouts = () => {
    setSectionLayouts(lastSyncedLayoutsRef.current);
  };

  const rollbackSectionControls = () => {
    setSectionOrder(lastSyncedOrderRef.current);
    setHiddenSections(lastSyncedHiddenRef.current);
  };

  const executeSectionLayoutsPersist = (nextLayouts: Record<string, string>) => {
    pendingLayoutsRef.current = null;
    updateSectionLayouts.mutate(nextLayouts, {
      onError: () => {
        rollbackSectionLayouts();
        toast({
          title: "Could not save layout",
          description: "Your last layout change was not saved. We restored the previous version.",
          variant: "destructive",
        });
      },
    });
  };

  const executeSectionControlsPersist = (nextOrder: string[], nextHidden: string[]) => {
    pendingControlsRef.current = null;
    updateSectionControls.mutate(
      {
        section_order: nextOrder,
        hidden_sections: nextHidden,
      },
      {
        onError: () => {
          rollbackSectionControls();
          toast({
            title: "Could not save section order",
            description: "Your last section change was not saved. We restored the previous version.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const flushPendingSaves = () => {
    if (sectionLayoutSaveRef.current) {
      window.clearTimeout(sectionLayoutSaveRef.current);
      sectionLayoutSaveRef.current = null;
    }

    if (sectionControlsSaveRef.current) {
      window.clearTimeout(sectionControlsSaveRef.current);
      sectionControlsSaveRef.current = null;
    }

    if (pendingLayoutsRef.current) {
      executeSectionLayoutsPersist(pendingLayoutsRef.current);
    }

    if (pendingControlsRef.current) {
      executeSectionControlsPersist(
        pendingControlsRef.current.section_order,
        pendingControlsRef.current.hidden_sections
      );
    }
  };

  useEffect(() => {
    return () => {
      flushPendingSaves();
    };
  }, []);

  useEffect(() => {
    if (!editMode) {
      setActiveSidebarSection(null);
    }
  }, [editMode]);

  const queueSectionControlsPersist = (nextOrder: string[], nextHidden: string[]) => {
    if (sectionControlsSaveRef.current) {
      window.clearTimeout(sectionControlsSaveRef.current);
    }

    pendingControlsRef.current = {
      section_order: nextOrder,
      hidden_sections: nextHidden,
    };

    sectionControlsSaveRef.current = window.setTimeout(() => {
      sectionControlsSaveRef.current = null;
      executeSectionControlsPersist(nextOrder, nextHidden);
    }, 220);
  };

  const queueSectionLayoutsPersist = (nextLayouts: Record<string, string>) => {
    if (sectionLayoutSaveRef.current) {
      window.clearTimeout(sectionLayoutSaveRef.current);
    }

    pendingLayoutsRef.current = nextLayouts;

    sectionLayoutSaveRef.current = window.setTimeout(() => {
      sectionLayoutSaveRef.current = null;
      executeSectionLayoutsPersist(nextLayouts);
    }, 220);
  };

  const persistSectionControls = (nextOrder: string[], nextHidden: string[]) => {
    setSectionOrder(nextOrder);
    setHiddenSections(nextHidden);
    queueSectionControlsPersist(nextOrder, nextHidden);
  };

  const handleMoveSection = (sectionId: string, direction: -1 | 1) => {
    const currentIndex = sectionOrder.indexOf(sectionId);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= sectionOrder.length) return;

    const nextOrder = [...sectionOrder];
    [nextOrder[currentIndex], nextOrder[nextIndex]] = [nextOrder[nextIndex], nextOrder[currentIndex]];
    persistSectionControls(nextOrder, hiddenSections);
  };

  const handleToggleHidden = (sectionId: string) => {
    const nextHidden = hiddenSections.includes(sectionId)
      ? hiddenSections.filter((entry) => entry !== sectionId)
      : [...hiddenSections, sectionId];
    persistSectionControls(sectionOrder, nextHidden);
  };

  const handleResetSections = () => {
    persistSectionControls(defaultOrderForReset, []);
  };

  if (portfolioLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
          <div className="container flex h-12 items-center justify-between">
            <Button variant="ghost" size="sm" asChild>
              <Link to={dashboardHref} onClick={flushPendingSaves}>
                <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading your portfolio preview...</p>
          </div>
        </div>
      </div>
    );
  }

  if (portfolioParam && !portfolio) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
          <div className="container flex h-12 items-center justify-between">
            <Button variant="ghost" size="sm" asChild>
              <Link to={dashboardHref} onClick={flushPendingSaves}>
                <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center px-6">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-semibold text-foreground">Preview not available</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This portfolio could not be found, or you no longer have access to it.
            </p>
            <Button className="mt-6" asChild>
              <Link to={dashboardHref}>Return to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="container flex h-12 items-center justify-between gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to={dashboardHref} onClick={flushPendingSaves}>
              <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Back to Dashboard
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Preview - {templateName}</Badge>
            <Button size="sm" asChild>
              <Link to={builderHref} onClick={flushPendingSaves}>
                <PenTool className="mr-2 h-3.5 w-3.5" /> Edit
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div>
        <TemplateComponent
          bio={bio ?? null}
          projects={projects ?? []}
          skills={skills ?? []}
          experiences={experiences ?? []}
          education={education ?? []}
          contact={contact ?? null}
          certifications={certifications ?? []}
          sectionLayouts={sectionLayouts}
          sectionOrder={sectionOrder}
          hiddenSections={hiddenSections}
          editMode={editMode}
          onSectionEdit={(section) => setActiveSidebarSection(section)}
        />
      </div>

      <button
        onClick={() => {
          setEditMode((current) => {
            if (current) setActiveSidebarSection(null);
            return !current;
          });
        }}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-xl transition-all hover:scale-105 hover:shadow-2xl active:scale-95 ${
          editMode
            ? "bg-primary text-primary-foreground"
            : "border border-border bg-card text-foreground hover:bg-accent"
        }`}
      >
        <LayoutPanelLeft className="h-4 w-4" />
        {editMode ? "Done Editing" : "Customize Layout"}
      </button>

      {activeSidebarSection && (
        <SectionLayoutPicker
          section={activeSidebarSection}
          current={sectionLayouts[activeSidebarSection]}
          onSelect={(layoutId) => {
            const next = { ...sectionLayouts, [activeSidebarSection]: layoutId };
            setSectionLayouts(next);
            queueSectionLayoutsPersist(next);
          }}
          onClose={() => setActiveSidebarSection(null)}
        />
      )}

      {editMode && (
        <div className="fixed left-6 top-1/2 z-40 hidden w-[340px] -translate-y-1/2 xl:block">
          <SectionManager
            order={sectionOrder}
            hiddenSections={hiddenSections}
            onMove={handleMoveSection}
            onReorder={(nextOrder) => persistSectionControls(nextOrder, hiddenSections)}
            onToggleHidden={handleToggleHidden}
            onReset={handleResetSections}
          />
        </div>
      )}
    </div>
  );
};

export default Preview;
