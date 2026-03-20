import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { sanitizeText, sanitizeUrl } from "@/lib/sanitize";

type CertificationInput = {
  name: string;
  issuer: string;
  issue_date?: string;
  expiry_date?: string;
  credential_url?: string;
  description?: string;
};

export const useCertifications = (portfolioId: string | undefined) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: certifications = [], isLoading } = useQuery({
    queryKey: ["certifications", portfolioId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certifications")
        .select("*")
        .eq("portfolio_id", portfolioId!)
        .order("display_order");
      if (error) throw error;
      return data;
    },
    enabled: !!portfolioId,
  });

  const addCertification = useMutation({
    mutationFn: async (input: CertificationInput) => {
      const { data, error } = await supabase
        .from("certifications")
        .insert({
          name: sanitizeText(input.name).slice(0, 100),
          issuer: input.issuer ? sanitizeText(input.issuer).slice(0, 100) : "",
          issue_date: input.issue_date || null,
          expiry_date: input.expiry_date || null,
          credential_url: input.credential_url ? sanitizeUrl(input.credential_url) : null,
          description: input.description ? sanitizeText(input.description).slice(0, 300) : null,
          portfolio_id: portfolioId!,
          user_id: user!.id,
          display_order: certifications.length,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["certifications", portfolioId] }),
  });

  const deleteCertification = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("certifications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["certifications", portfolioId] }),
  });

  return { certifications, isLoading, addCertification, deleteCertification };
};
