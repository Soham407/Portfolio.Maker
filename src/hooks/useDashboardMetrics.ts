import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useDashboardMetrics = (portfolioId: string | undefined) => {
  const viewCountQuery = useQuery({
    queryKey: ["dashboard", "viewCount", portfolioId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("portfolio_views")
        .select("*", { count: "exact", head: true })
        .eq("portfolio_id", portfolioId!);

      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!portfolioId,
  });

  const completionQuery = useQuery({
    queryKey: ["dashboard", "completion", portfolioId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_portfolio_completion", {
        p_portfolio_id: portfolioId!,
      });

      if (error) throw error;
      return data as number;
    },
    enabled: !!portfolioId,
  });

  return {
    viewCount: viewCountQuery.data ?? 0,
    completion: completionQuery.data ?? 0,
    isLoading: viewCountQuery.isLoading || completionQuery.isLoading,
  };
};
