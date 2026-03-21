import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeCustomSection } from "@/lib/sanitize";

type CustomSectionInput = {
  title: string;
  body: string;
};

export const useCustomSections = (portfolioId: string | undefined) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const customSectionsQueryKey = ["custom-sections", portfolioId];

  const syncCustomSectionsCache = (
    updater: (current: Array<Record<string, unknown>>) => Array<Record<string, unknown>>
  ) => {
    queryClient.setQueryData(customSectionsQueryKey, (current: Array<Record<string, unknown>> | undefined) => (
      updater(current ?? [])
    ));
  };

  const { data: customSections = [], isLoading } = useQuery({
    queryKey: customSectionsQueryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_sections")
        .select("*")
        .eq("portfolio_id", portfolioId!)
        .order("display_order");
      if (error) throw error;
      return data || [];
    },
    enabled: !!portfolioId,
  });

  const addCustomSection = useMutation({
    mutationFn: async (input: CustomSectionInput) => {
      const sanitized = sanitizeCustomSection(input);
      const nextDisplayOrder = customSections.reduce(
        (maxOrder, section) => Math.max(maxOrder, section.display_order ?? -1),
        -1
      ) + 1;
      const { data, error } = await supabase
        .from("custom_sections")
        .insert({
          ...sanitized,
          display_order: nextDisplayOrder,
          portfolio_id: portfolioId!,
          user_id: user!.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (created) => {
      syncCustomSectionsCache((current) => [...current, created]);
      queryClient.invalidateQueries({ queryKey: customSectionsQueryKey });
    },
  });

  const updateCustomSection = useMutation({
    mutationFn: async ({ id, ...input }: CustomSectionInput & { id: string }) => {
      const sanitized = sanitizeCustomSection(input);
      const { data, error } = await supabase
        .from("custom_sections")
        .update(sanitized)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (updated) => {
      syncCustomSectionsCache((current) => current.map((section) => (
        section.id === updated.id ? updated : section
      )));
    },
  });

  const reorderCustomSections = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      await Promise.all(
        orderedIds.map((id, index) =>
          supabase.from("custom_sections").update({ display_order: index }).eq("id", id)
        )
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customSectionsQueryKey }),
  });

  const deleteCustomSection = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("custom_sections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, id) => {
      syncCustomSectionsCache((current) => current.filter((section) => section.id !== id));
      queryClient.invalidateQueries({ queryKey: customSectionsQueryKey });
    },
  });

  return {
    customSections,
    isLoading,
    addCustomSection,
    updateCustomSection,
    reorderCustomSections,
    deleteCustomSection,
  };
};
