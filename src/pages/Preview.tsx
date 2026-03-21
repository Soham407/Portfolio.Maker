import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, LayoutPanelLeft, PenTool, Share2, Copy, CheckCheck, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SectionLayoutPicker from "@/components/preview/SectionLayoutPicker";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTemplateComponent } from "@/components/templates";
import { useBio } from "@/hooks/useBio";
import { useCertifications } from "@/hooks/useCertifications";
import { useContact } from "@/hooks/useContact";
import { useCustomSections } from "@/hooks/useCustomSections";
import { useEducation } from "@/hooks/useEducation";
import { useExperience } from "@/hooks/useExperience";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useProjects } from "@/hooks/useProjects";
import { useSkills } from "@/hooks/useSkills";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "@/hooks/use-toast";
import { DEFAULT_SECTION_ORDER } from "@/lib/constants";
import { getOrderedCustomSectionIds, normalizeHiddenSections, normalizeSectionOrder } from "@/lib/portfolioSections";
import { PreviewLayoutProvider } from "@/components/preview/PreviewLayoutContext";

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
  const { customSections } = useCustomSections(portfolioId);

  const TemplateComponent = getTemplateComponent(templateId);
  const templateName = TEMPLATE_NAMES[templateId] ?? templateId;
  const defaultOrderForReset = normalizeSectionOrder(
    DEFAULT_SECTION_ORDER[(profile?.user_type as keyof typeof DEFAULT_SECTION_ORDER) || "fresher"]
  );

  const [editMode, setEditMode] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sectionLayouts, setSectionLayouts] = useState<Record<string, string>>({});
  const [activeSidebarSection, setActiveSidebarSection] = useState<string | null>(null);
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
  const [hiddenSections, setHiddenSections] = useState<string[]>([]);
  const [notApplicableSections, setNotApplicableSections] = useState<string[]>([]);
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const sectionLayoutSaveRef = useRef<number | null>(null);
  const sectionControlsSaveRef = useRef<number | null>(null);
  const pendingLayoutsRef = useRef<Record<string, string> | null>(null);
  const pendingControlsRef = useRef<{ section_order: string[]; hidden_sections: string[]; not_applicable_sections: string[] } | null>(null);
  const lastSyncedLayoutsRef = useRef<Record<string, string>>({});
  const lastSyncedOrderRef = useRef<string[]>([]);
  const lastSyncedHiddenRef = useRef<string[]>([]);
  const lastSyncedNotApplicableRef = useRef<string[]>([]);

  useEffect(() => {
    const nextLayouts = (portfolio?.section_layouts as Record<string, string>) ?? {};
    const customSectionIds = (customSections || []).map((section) => `custom:${section.id}`);
    const nextOrder = normalizeSectionOrder([...(portfolio?.section_order ?? defaultOrderForReset), ...customSectionIds]);
    const nextHidden = normalizeHiddenSections(portfolio?.hidden_sections);
    const nextNotApplicable = (portfolio?.not_applicable_sections as string[] | null) ?? [];

    lastSyncedLayoutsRef.current = nextLayouts;
    lastSyncedOrderRef.current = nextOrder;
    lastSyncedHiddenRef.current = nextHidden;
    lastSyncedNotApplicableRef.current = nextNotApplicable;

    setSectionLayouts(nextLayouts);
    setSectionOrder(nextOrder);
    setHiddenSections(nextHidden);
    setNotApplicableSections(nextNotApplicable);
  }, [customSections, defaultOrderForReset, portfolio]);

  const rollbackSectionLayouts = useCallback(() => {
    setSectionLayouts(lastSyncedLayoutsRef.current);
  }, []);

  const rollbackSectionControls = useCallback(() => {
    setSectionOrder(lastSyncedOrderRef.current);
    setHiddenSections(lastSyncedHiddenRef.current);
    setNotApplicableSections(lastSyncedNotApplicableRef.current);
  }, []);

  const executeSectionLayoutsPersist = useCallback((nextLayouts: Record<string, string>) => {
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
  }, [rollbackSectionLayouts, updateSectionLayouts]);

  const executeSectionControlsPersist = useCallback((nextOrder: string[], nextHidden: string[], nextNotApplicable: string[]) => {
    pendingControlsRef.current = null;
    updateSectionControls.mutate(
      {
        section_order: nextOrder,
        hidden_sections: nextHidden,
        not_applicable_sections: nextNotApplicable,
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
  }, [rollbackSectionControls, updateSectionControls]);

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
        pendingControlsRef.current.hidden_sections,
        pendingControlsRef.current.not_applicable_sections
      );
    }
  };

  useEffect(() => {
    return () => {
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
          pendingControlsRef.current.hidden_sections,
          pendingControlsRef.current.not_applicable_sections
        );
      }
    };
  }, [executeSectionControlsPersist, executeSectionLayoutsPersist]);

  useEffect(() => {
    if (!editMode) {
      setActiveSidebarSection(null);
    }
  }, [editMode]);

  const queueSectionControlsPersist = (nextOrder: string[], nextHidden: string[], nextNotApplicable: string[]) => {
    if (sectionControlsSaveRef.current) {
      window.clearTimeout(sectionControlsSaveRef.current);
    }

    pendingControlsRef.current = {
      section_order: nextOrder,
      hidden_sections: nextHidden,
      not_applicable_sections: nextNotApplicable,
    };

    sectionControlsSaveRef.current = window.setTimeout(() => {
      sectionControlsSaveRef.current = null;
      executeSectionControlsPersist(nextOrder, nextHidden, nextNotApplicable);
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

  const persistSectionControls = (nextOrder: string[], nextHidden: string[], nextNotApplicable: string[]) => {
    const normalizedOrder = normalizeSectionOrder(nextOrder);
    setSectionOrder(normalizedOrder);
    setHiddenSections(nextHidden);
    setNotApplicableSections(nextNotApplicable);
    queueSectionControlsPersist(normalizedOrder, nextHidden, nextNotApplicable);
  };

  const handleMoveSection = (sectionId: string, direction: -1 | 1) => {
    const currentIndex = sectionOrder.indexOf(sectionId);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= sectionOrder.length) return;

    const nextOrder = [...sectionOrder];
    [nextOrder[currentIndex], nextOrder[nextIndex]] = [nextOrder[nextIndex], nextOrder[currentIndex]];
    persistSectionControls(nextOrder, hiddenSections, notApplicableSections);
  };

  const handleToggleHidden = (sectionId: string) => {
    const nextHidden = hiddenSections.includes(sectionId)
      ? hiddenSections.filter((entry) => entry !== sectionId)
      : [...hiddenSections, sectionId];
    const nextNotApplicable = notApplicableSections.filter((entry) => entry !== sectionId);
    persistSectionControls(sectionOrder, nextHidden, nextNotApplicable);
  };

  const handleResetSections = () => {
    const customSectionIds = getOrderedCustomSectionIds(sectionOrder);
    const defaultSectionsWithoutContact = defaultOrderForReset.filter((sectionId) => sectionId !== "contact");
    persistSectionControls([...defaultSectionsWithoutContact, ...customSectionIds, "contact"], [], notApplicableSections);
  };

  const handleDropSection = (targetSectionId: string) => {
    if (!draggedSectionId || draggedSectionId === targetSectionId) return;
    const nextOrder = [...sectionOrder];
    const fromIndex = nextOrder.indexOf(draggedSectionId);
    const targetIndex = nextOrder.indexOf(targetSectionId);
    if (fromIndex < 0 || targetIndex < 0) return;
    nextOrder.splice(fromIndex, 1);
    nextOrder.splice(targetIndex, 0, draggedSectionId);
    setDraggedSectionId(null);
    persistSectionControls(nextOrder, hiddenSections, notApplicableSections);
  };

  const shareUrl = portfolio?.visibility === "unlisted"
    ? `${window.location.origin}/share/${portfolio?.share_token}`
    : `${window.location.origin}/p/${profile?.username}${portfolio?.share_token ? `/${portfolio.share_token}` : ""}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copied!" });
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
            <Button size="sm" variant="outline" onClick={() => setIsShareOpen(true)}>
              <Share2 className="mr-2 h-3.5 w-3.5" /> Share
            </Button>
            <Button size="sm" asChild>
              <Link to={builderHref} onClick={flushPendingSaves}>
                <PenTool className="mr-2 h-3.5 w-3.5" /> Edit
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <PreviewLayoutProvider
        value={{
          editMode,
          draggedSectionId,
          onDragStart: setDraggedSectionId,
          onDrop: handleDropSection,
          onDragEnd: () => setDraggedSectionId(null),
          onToggleHidden: handleToggleHidden,
        }}
      >
        <div>
          <TemplateComponent
            bio={bio ?? null}
            projects={projects ?? []}
            skills={skills ?? []}
            experiences={experiences ?? []}
            education={education ?? []}
            contact={contact ?? null}
            certifications={certifications ?? []}
            customSections={customSections ?? []}
            sectionLayouts={sectionLayouts}
            sectionOrder={sectionOrder}
            hiddenSections={hiddenSections}
            notApplicableSections={notApplicableSections}
            editMode={editMode}
            onSectionEdit={(section) => setActiveSidebarSection(section)}
          />
        </div>
      </PreviewLayoutProvider>

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

      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Portfolio</DialogTitle>
            <DialogDescription>
              {!profile?.username && portfolio?.visibility === "public"
                ? "Set a username first to get your public URL."
                : portfolio?.visibility === "private"
                ? "Change visibility to public or unlisted before sharing."
                : portfolio?.visibility === "unlisted"
                ? "Share your secret link with selected people."
                : "Share your public portfolio with the world."}
            </DialogDescription>
          </DialogHeader>
          {(!profile?.username && portfolio?.visibility === "public") || portfolio?.visibility === "private" ? (
            <Button variant="hero" asChild className="w-full">
              <Link to={`${builderHref}${builderHref.includes("?") ? "&" : "?"}section=settings`} onClick={() => setIsShareOpen(false)}>
                <Settings className="mr-2 h-4 w-4" />
                {!profile?.username ? "Set Username in Settings" : "Update Visibility in Settings"}
              </Link>
            </Button>
          ) : (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Your share URL</Label>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly className="flex-1 text-sm" />
                  <Button size="sm" variant="outline" onClick={handleCopyLink}>
                    {copied ? <CheckCheck className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Preview;
