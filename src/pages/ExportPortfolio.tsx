import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import PrintablePortfolio from "@/components/export/PrintablePortfolio";
import { usePortfolioPreviewData } from "@/hooks/usePortfolioPreviewData";

const ExportPortfolio = () => {
  const { mode } = useParams<{ mode: string }>();
  const [searchParams] = useSearchParams();
  const portfolioParam = searchParams.get("portfolio") ?? undefined;
  const exportMode = mode === "resume" ? "resume" : "portfolio";
  const { portfolio, templateData, isLoading, isReady } = usePortfolioPreviewData(portfolioParam);

  useEffect(() => {
    if (!isReady) return;

    let timeout: number | null = null;
    const frame = window.requestAnimationFrame(() => {
      timeout = window.setTimeout(() => {
        window.print();
      }, 250);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      if (timeout) {
        window.clearTimeout(timeout);
      }
    };
  }, [exportMode, isReady]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold text-foreground">Export not available</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This portfolio could not be loaded for printing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PrintablePortfolio
      mode={exportMode}
      name={portfolio?.name}
      {...templateData}
    />
  );
};

export default ExportPortfolio;
